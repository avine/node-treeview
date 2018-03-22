import { EventEmitter } from 'events';
import { readdir, readFile, stat } from 'fs';
import { extname, join, relative, resolve } from 'path';
import * as minimatch from 'minimatch';

import * as Model from './model';
import { isBinaryPath } from './helper/binary';

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
    depth: false,
    include: [],
    exclude: [],
    glob: []
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
              item.error = err;
              this.emit(item);
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
            if (!pending) Promise.all(tasks).then(() => success(tree));
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
        } else {
          item.content = data.toString();
        }
        success();
      }));
  }

  private addDir(item: Model.IDir, depth: number) {
    item.type = 'dir';
    this.emit(item);
    if (this.opts.depth === false || depth < this.opts.depth) {
      item.content = [];
      return this.walk(this.getPath(item), item.content, depth + 1)
        .catch((error) => {
          item.error = error;
          delete item.content;
          return Promise.resolve(); // Don't break the walk...
        });
    }
    return null;
  }

  /**
   * Emit an event each time a file or a directory is discovered.
   */
  private emit(item: Model.TreeNode) {
    const data = { ...item };
    if (!item.error) {
      // When available, the `content` property of the emitted `item` is always an empty array!
      (data as Model.Item).content = [];
    }
    // We should match the signature of `Model.Listener`
    this.events.emit('item', data, this.opts);
  }
}
