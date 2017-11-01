import { readdir, readFile, stat } from 'fs';
import { resolve } from 'path';

import * as Model from './model';

export class TreeView {
  private static addTime(item: Model.Item, stats: Model.IStats) {
    item.created = stats.birthtime;
    item.modified = stats.mtime;
  }

  private static skipHidden(files: string[]) {
    return files.filter(file => file[0] !== '.');
  }

  opts: Model.IOpts = { encoding: 'utf8', content: true, depth: false, exclude: [] };
  providers: Model.IProviders;

  constructor(opts?: Model.IOptsParam) {
    this.inject();
    Object.assign(this.opts, opts || {});
    this.opts.exclude.map(path => this.providers.resolve(path));
  }

  inject() {
    this.providers = { resolve, readFile, readdir, stat };
  }

  process(path: string, cb?: Model.Cb) {
    const p = this.walk(this.providers.resolve(path));
    if (cb) p.then(result => cb(null, result), error => cb(error));
    return p;
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
          const item: Model.IRef = { name, path };
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
    return this.providers.resolve(item.path, item.name);
  }

  private addFile(item: Model.IFile, stats: Model.IStats) {
    item.type = 'file';
    item.size = stats.size;
    if (this.opts.content) {
      return this.addContent(item);
    }
    return null;
  }

  private addContent(item: Model.IFile) {
    return new Promise<void>(success =>
      this.providers.readFile(this.getPath(item), {
        encoding: this.opts.encoding
      }, (error, data) => {
        if (error) {
          item.error = error;
        } else {
          // TODO: if `this.opts.content` is a number then
          // only retrieve this number of octets...
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
