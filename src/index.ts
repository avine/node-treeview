import { readdir, readFile, stat } from 'fs';
import { resolve, relative } from 'path';

import * as Model from './model';
import { isBinaryPath } from './binary';

export class TreeView {
  private static addTime(item: Model.Item, stats: Model.IStats) {
    item.created = stats.birthtime;
    item.modified = stats.mtime;
  }

  private static skipHidden(files: string[]) {
    return files.filter(file => file[0] !== '.');
  }

  opts: Model.IOpts = { content: true, depth: false, exclude: [], relative: false };
  providers: Model.IProviders;
  rootPath: string;

  constructor(opts?: Model.IOptsParam) {
    this.inject();
    Object.assign(this.opts, opts || {});
    this.opts.exclude.map(path => this.providers.resolve(path));
  }

  inject() {
    this.providers = { resolve, relative, readFile, readdir, stat };
  }

  process(path: string, cb?: Model.Cb) {
    this.rootPath = this.providers.resolve(path);
    const promise = this.walk(this.rootPath);
    if (cb) promise.then(result => cb(null, result), error => cb(error));
    return promise;
  }

  private walk(path: string, list: Model.TreeNode[] = [], depth = 0) {
    return new Promise<Model.TreeNode[]>((success, reject) => {
      this.providers.readdir(path, (error, files) => {
        if (error) {
          reject(error);
          return;
        }
        files = TreeView.skipHidden(files);
        let pending = files.length;
        if (!pending) {
          success(list);
          return;
        }
        const tasks: Promise<any>[] = [];
        files.forEach((name) => {
          const itemPath = this.opts.relative ? this.providers.relative(this.rootPath, path) : path;
          const item: Model.IRef = { name, path: itemPath };
          const pathfile = this.getPath(item);
          this.providers.stat(pathfile, (err, stats: Model.IStats) => {
            if (err) {
              item.error = err;
              list.push(item);
            } else {
              TreeView.addTime(item as Model.Item, stats);
              let task;
              if (stats.isFile()) {
                task = this.addFile(item as Model.IFile, stats);
                list.push(item as Model.IFile);
              } else if (stats.isDirectory() && !this.opts.exclude.includes(pathfile)) {
                task = this.addDir(item as Model.IDir, depth);
                list.push(item as Model.IDir);
              }
              if (task) tasks.push(task);
            }
            pending -= 1;
            if (!pending) Promise.all(tasks).then(() => success(list));
          });
        });
      });
    });
  }

  private getPath(item: Model.IRef) {
    return this.providers.resolve(this.opts.relative ? this.rootPath : '', item.path, item.name);
  }

  private addFile(item: Model.IFile, stats: Model.IStats) {
    item.type = 'file';
    item.size = stats.size;
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
