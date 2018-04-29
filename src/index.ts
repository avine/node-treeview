import { EventEmitter } from 'events';
import { readdir, readFile, stat } from 'fs';
import { extname, join, relative, resolve } from 'path';
import * as minimatch from 'minimatch';

import * as Model from './model';
import { isBinaryPath } from './helper/binary';

export const INFINITE_DEPTH = -1;

export class TreeView {
  private static addTime(item: Model.Item, stats: Model.IStats) {
    item.created = stats.birthtime;
    item.modified = stats.mtime;
  }

  private static removeHidden(files: string[]) {
    return files.filter(file => file[0] !== '.');
  }

  private static getMainPaths(paths: string[] | string) {
    const main = ([] as string[])
      .concat(paths)
      .sort()
      .reduce((acc, curr, index) => {
        if (!index || !curr.startsWith(acc.prev)) {
          acc.paths.push(curr);
          acc.prev = curr;
        }
        return acc;
      }, {
        paths: [] as string[],
        prev: ''
      });
    return main.paths;
  }

  opts: Model.IOpts = {
    all: false,
    content: false,
    depth: INFINITE_DEPTH,
    relative: false,
    include: [],
    exclude: [],
    glob: [],
    sort: Model.Sorting.Alpha
  };
  events = new EventEmitter();
  providers!: Model.IProviders;
  lastResult!: Model.IResult;

  constructor(opts?: Model.IOptsParam) {
    this.inject();
    Object.assign(this.opts, opts || {});
    this.formatOpts();
  }

  listen(listener: Model.Listener) {
    this.events.addListener('item', listener);
    return this;
  }

  removeListeners() {
    this.events.removeAllListeners('item');
    return this;
  }

  process(path: string, cb?: Model.Cb) {
    const rootPath = this.providers.resolve(path);
    const ctx: Model.ICtx = {
      rootPath,
      getPath: this.getPathFactory(rootPath),
      path: rootPath,
      depth: 0
    };
    const promise = this.walk(ctx);
    promise.then(tree => this.lastResult = { rootPath, tree }, error => error);
    if (cb) promise.then(tree => cb(null, tree), error => cb(error));
    return promise;
  }

  refreshResult(paths: string[] | string) {
    const mainPaths = TreeView.getMainPaths(([] as string[]).concat(paths));
    const { matchs, remains } = this.filterResult(mainPaths);
    return Promise.all([
      ...matchs.map(match => this.updateResult(match)),
      ...remains.map(pathname => this.extendResult(pathname))
    ]).then(() => this.lastResult.tree);
  }

  protected inject() {
    this.providers = { join, resolve, relative, readFile, readdir, stat };
  }

  private formatOpts() {
    [this.opts.include, this.opts.exclude].forEach(paths =>
      paths.forEach((path, n: number) => paths[n] = this.providers.resolve(path))
    );
  }

  private getPathFactory(rootPath: string) {
    return (item: Model.IRef) => this.providers.resolve(this.opts.relative ? rootPath : '', item.path, item.name);
  }

  private walk(ctx: Model.ICtx, tree: Model.TreeNode[] = []) {
    return new Promise<Model.TreeNode[]>((success, reject) => {
      this.providers.readdir(ctx.path, (error, files) => {
        if (error) {
          reject(error);
          return;
        }
        if (!this.opts.all) {
          files = TreeView.removeHidden(files);
        }
        if (!files.length) {
          success(tree);
          return;
        }
        const tasks = files.map(name => this.getTreeNode(ctx, name));
        Promise.all(tasks).then((items) => {
          items.forEach((item) => { if (item) tree.push(item); });
          success(this.sort(tree));
        });
      });
    });
  }

  private getTreeNode(ctx: Model.ICtx, name: string) {
    // `path` and `pathname` are always absolute
    const pathname = this.providers.resolve(ctx.path, name);

    // while `itemPath` and `itemPathname` are relative when the option `relative` is `true`.
    const itemPath = this.opts.relative ? this.providers.relative(ctx.rootPath, ctx.path) : ctx.path;
    const itemPathname = this.opts.relative ? this.providers.join(itemPath, name) : pathname;

    const item: Model.IRef = {
      name,
      path: itemPath,
      pathname: itemPathname,
      depth: ctx.depth
    };
    const pathfile = ctx.getPath(item);
    return new Promise<Model.TreeNode | void>((success) => {
      this.providers.stat(pathfile, (err, stats) => {
        if (err) {
          this.addError(ctx, item, err);
          success(item);
        } else {
          TreeView.addTime(item as Model.Item, stats);

          let task;
          let checked = false;
          const cb = () => checked ? success(item) : success();

          // The glob pattern should match "absolute path" when the
          // option `relative` is `false` and "relative path" otherwise.
          // Accordingly, we check the file against `item.pathname` (and not `pathname`).
          // On the other hand, we check the directory against `path` or `pathname` which are always absolute.
          if (stats.isFile() && this.checkFile(item.pathname, ctx) && this.checkDirectory(ctx.path, ctx, true)) {
            task = this.addFile(ctx, item as Model.IFile, stats);
            checked = true;
          } else if (stats.isDirectory() && this.checkDirectory(pathname, ctx)) {
            task = this.addDir(ctx, item as Model.IDir);
            checked = true;
          }
          task ? task.then(cb) : cb();
        }
      });
    });
  }

  private checkFile(file: string, search: Model.ISearch = {}) {
    const globList = [...this.opts.glob, ...(search.glob || [])];
    const glogCb = (glob: string) => minimatch(file, glob);
    return !globList.length || globList.findIndex(glogCb) !== -1;
  }

  private checkDirectory(dir: string, search: Model.ISearch = {}, strict = false) {
    const incList = [...this.opts.include, ...(search.include || [])];
    const excList = [...this.opts.exclude, ...(search.exclude || [])];
    const incCb = strict
      ? (path: string) => dir.startsWith(path) // For a file
      : (path: string) => dir.length > path.length ? dir.startsWith(path) : path.startsWith(dir); // For a dir
    const included = !incList.length || incList.findIndex(incCb) !== -1;
    const excluded = excList.includes(dir);
    return included && !excluded;
  }

  private addError(ctx: Model.ICtx, item: Model.IRef, error: Error) {
    item.error = error;
    this.emit(ctx, item);
  }

  private addFile(ctx: Model.ICtx, item: Model.IFile, stats: Model.IStats) {
    item.type = 'file';
    item.size = stats.size;
    item.ext = extname(item.name).slice(1); // remove '.'
    item.binary = isBinaryPath(item.name);
    this.emit(ctx, item);
    if (this.opts.content) {
      return this.addContent(ctx, item);
    }
    return null;
  }

  private addContent(ctx: Model.ICtx, item: Model.IFile) {
    return new Promise<void>(success =>
      this.providers.readFile(ctx.getPath(item), {
        encoding: item.binary ? 'base64' : 'utf8'
      }, (error, data) => {
        if (error) {
          item.error = error;
          item.content = '';
        } else {
          item.content = data.toString();
        }
        success();
      }));
  }

  private addDir(ctx: Model.ICtx, item: Model.IDir) {
    item.type = 'dir';
    item.nodes = [];
    this.emit(ctx, item);
    if (this.opts.depth === INFINITE_DEPTH || ctx.depth < this.opts.depth) {
      const newCtx: Model.ICtx = {
        ...ctx,
        path: ctx.getPath(item),
        depth: ctx.depth + 1
      };
      return this.walk(newCtx, item.nodes)
        .catch((error) => {
          item.error = error;
          return Promise.resolve(); // Don't break the walk...
        });
    }
    return null;
  }

  private sort(tree: Model.TreeNode[]) {
    if (this.opts.sort === Model.Sorting.Alpha) {
      return tree.sort((a, b) => a.name > b.name ? 1 : -1);
    } else {
      const x = this.opts.sort === Model.Sorting.FileFirst ? 1 : -1;
      return tree.sort((a, b) => {
        if ((a as Model.IDir).type === 'dir' && (b as Model.IFile).type === 'file') return x;
        if ((a as Model.IFile).type === 'file' && (b as Model.IDir).type === 'dir') return -x;
        if (a.error && !b.error) return 1;
        if (!a.error && b.error) return -1;
        return a.name > b.name ? 1 : -1;
      });
    }
  }

  /**
   * Emit an event each time a `TreeNode` is discovered.
   *
   * Note:
   *  - Emitted file never have `content` property.
   *  - Emitted dir always have `nodes` property equal to an empty array.
   */
  private emit(ctx: Model.ICtx, item: Model.TreeNode) {
    // We should match the signature of `Model.Listener`.
    // Emit an immutable item.
    this.events.emit('item', { ...item }, ctx, this.opts);
  }

  private filterResult(paths: string[]) {
    const remains = paths.map(
      this.opts.relative
        ? p => this.providers.relative(this.lastResult.rootPath, p)
        : p => this.providers.resolve(p)
    );
    const filter = (nodes: Model.TreeNode[]) => {
      return nodes.reduce((acc: Model.IMatch[], item: Model.TreeNode) => {
        const index = remains.indexOf(item.pathname);
        if (index !== -1) {
          acc.push({ item, parentNodes: nodes });
          remains.splice(index, 1);
          if (!remains.length) {
            return acc;
          }
        }
        for (const pathname of remains) {
          if (pathname.startsWith(item.pathname)) {
            acc = acc.concat(filter((item as Model.IDir).nodes));
            break;
          }
        }
        return acc;
      }, []);
    };
    return { matchs: filter(this.lastResult.tree), remains };
  }

  private updateResult(match: Model.IMatch) {
    return new Promise<void>((success) => {
      const ctx: Model.ICtx = {
        rootPath: this.lastResult.rootPath,
        getPath: this.getPathFactory(this.lastResult.rootPath),
        path: match.item.path,
        depth: match.item.depth
      };
      this.getTreeNode(ctx, match.item.name).then((item) => {
        const index = match.parentNodes.indexOf(match.item);
        if (index !== -1) {
          if (item && !item.error) {
            match.parentNodes.splice(index, 1, item); // Replace
          } else {
            match.parentNodes.splice(index, 1); // Remove
          }
        } else if (item && !item.error) {
          match.parentNodes.push(item); // Add
        }
        success();
      });
    });
  }

  private extendResult(pathname: string) {
    const relPathname = this.providers.relative(this.lastResult.rootPath, pathname);
    const names = relPathname.split(/\/|\\/g);
    let tree = this.lastResult.tree;
    let parent: Model.IDir | null = null;
    let name: string | undefined;
    // tslint:disable-next-line:no-conditional-assignment
    while (name = names.shift()) {
      const match = tree.find(item => item.name === name);
      if (match && (match as Model.IDir).type === 'dir') {
        parent = match as Model.IDir;
        tree = (match as Model.IDir).nodes;
      } else {
        break;
      }
    }
    if (name) {
      const parentNodes = parent ? parent.nodes : this.lastResult.tree;
      const depth = parent ? parent.depth + 1 : 1;
      const path = parent ? parent.pathname : (this.opts.relative ? '' : this.lastResult.rootPath);
      const item: Model.IRef = {
        name,
        path,
        pathname: this.providers.join(path, name),
        depth
      };
      return this.updateResult({ parentNodes, item });
    }
    return Promise.resolve();
  }
}
