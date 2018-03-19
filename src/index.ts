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

  private static skipHidden(files: string[]) {
    return files.filter(file => file[0] !== '.');
  }

  opts: Model.IOpts = {
    content: false,
    relative: false,
    depth: false,
    include: [],
    exclude: [],
    pattern: []
  };
  providers!: Model.IProviders;
  rootPath!: string;

  constructor(opts?: Model.IOptsParam) {
    this.inject();
    Object.assign(this.opts, opts || {});
    this.formatOpts();
  }

  inject() {
    this.providers = { join, resolve, relative, readFile, readdir, stat };
  }

  process(path: string, cb?: Model.Cb) {
    this.rootPath = this.providers.resolve(path);
    const promise = this.walk(this.rootPath);
    if (cb) promise.then(result => cb(null, result), error => cb(error));
    return promise;
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
        files = TreeView.skipHidden(files);
        let pending = files.length;
        if (!pending) {
          success(tree);
          return;
        }
        const tasks: Promise<any>[] = [];
        files.forEach((name) => {
          const itemPath = this.opts.relative ? this.providers.relative(this.rootPath, path) : path;
          const item: Model.IRef = { name, path: itemPath, pathname: this.providers.join(itemPath, name) };
          const pathfile = this.getPath(item);
          this.providers.stat(pathfile, (err, stats: Model.IStats) => {
            if (err) {
              item.error = err;
              tree.push(item);
            } else {
              TreeView.addTime(item as Model.Item, stats);
              let task;
              if (stats.isFile() && this.checkFile(item.pathname) && this.checkDirectory(item.path, true)) {
                task = this.addFile(item as Model.IFile, stats);
                tree.push(item as Model.IFile);
              } else if (stats.isDirectory() && this.checkDirectory(item.pathname)) {
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
    return this.opts.pattern.reduce(
      (match: boolean, pattern: string) => match || minimatch(file, pattern),
      !this.opts.pattern.length
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
}
