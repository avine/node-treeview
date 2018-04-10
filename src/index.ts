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

  opts: Model.IOpts = {
    all: false,
    content: false,
    relative: false,
    depth: INFINITE_DEPTH,
    include: [],
    exclude: [],
    glob: [],
    sort: Model.Sorting.Alpha
  };
  events = new EventEmitter();
  providers!: Model.IProviders;
  rootPath!: string;

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
    this.rootPath = this.providers.resolve(path);
    const promise = this.walk(this.rootPath);
    if (cb) promise.then(tree => cb(null, tree), error => cb(error));
    return promise;
  }

  protected inject() {
    this.providers = { join, resolve, relative, readFile, readdir, stat };
  }

  private formatOpts() {
    [this.opts.include, this.opts.exclude].forEach(paths =>
      paths.forEach((path, n: number) => paths[n] = this.providers.resolve(path))
    );
  }

  private walk(path: string, tree: Model.TreeNode[] = [], depth = 0) {
    return new Promise<Model.TreeNode[]>((success, reject) => {
      this.providers.readdir(path, (error, files) => {
        if (error) {
          reject(error);
          return;
        }
        if (!this.opts.all) {
          files = TreeView.removeHidden(files);
        }
        let pending = files.length;
        if (!pending) {
          success(tree);
          return;
        }
        const tasks: Promise<any>[] = [];
        files.forEach((name) => {
          // `path` and `pathname` are always absolute
          const pathname = this.providers.resolve(path, name);

          // while `itemPath` and `itemPathname` are relative when the option `relative` is `true`.
          const itemPath = this.opts.relative ? this.providers.relative(this.rootPath, path) : path;
          const itemPathname = this.opts.relative ? this.providers.join(itemPath, name) : pathname;

          const item: Model.IRef = { name, path: itemPath, pathname: itemPathname };
          const pathfile = this.getPath(item);
          this.providers.stat(pathfile, (err, stats: Model.IStats) => {
            if (err) {
              this.addError(item, err);
              tree.push(item);
            } else {
              TreeView.addTime(item as Model.Item, stats);
              let task;

              // The glob pattern should match "absolute path" when the
              // option `relative` is `false` and "relative path" otherwise.
              // Accordingly, we check the file against `item.pathname` (and not `pathname`).
              // On the other hand, we check the directory against `path` or `pathname` which are always absolute.
              if (stats.isFile() && this.checkFile(item.pathname) && this.checkDirectory(path, true)) {
                task = this.addFile(item as Model.IFile, stats);
                tree.push(item as Model.IFile);
              } else if (stats.isDirectory() && this.checkDirectory(pathname)) {
                task = this.addDir(item as Model.IDir, depth);
                tree.push(item as Model.IDir);
              }
              if (task) tasks.push(task);
            }
            pending -= 1;
            if (!pending) Promise.all(tasks).then(() => success(this.sort(tree)));
          });
        });
      });
    });
  }

  private getPath(item: Model.IRef) {
    return this.providers.resolve(this.opts.relative ? this.rootPath : '', item.path, item.name);
  }

  private checkFile(file: string) {
    return this.opts.glob.reduce(
      (match: boolean, glob: string) => match || minimatch(file, glob),
      !this.opts.glob.length
    );
  }

  private checkDirectory(directory: string, strict = false) {
    const included = this.opts.include.reduce(
      (match: boolean, path: string) => match || (strict ? directory.startsWith(path) : path.startsWith(directory)),
      !this.opts.include.length
    );
    const excluded = this.opts.exclude.includes(directory);
    return included && !excluded;
  }

  private addError(item: Model.IRef, error: Error) {
    item.error = error;
    this.emit(item);
  }

  private addFile(item: Model.IFile, stats: Model.IStats) {
    item.type = 'file';
    item.size = stats.size;
    item.ext = extname(item.name).slice(1); // remove '.'
    item.binary = isBinaryPath(item.name);
    this.emit(item);
    if (this.opts.content) {
      return this.addContent(item);
    }
    return null;
  }

  private addContent(item: Model.IFile) {
    return new Promise<void>(success =>
      this.providers.readFile(this.getPath(item), {
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

  private addDir(item: Model.IDir, depth: number) {
    item.type = 'dir';
    item.nodes = [];
    this.emit(item);
    if (this.opts.depth === INFINITE_DEPTH || depth < this.opts.depth) {
      return this.walk(this.getPath(item), item.nodes, depth + 1)
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
  private emit(item: Model.TreeNode) {
    // We should match the signature of `Model.Listener`.
    // Emit an immutable item.
    this.events.emit('item', { ...item }, this.opts);
  }
}
