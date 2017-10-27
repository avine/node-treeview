import { readdir, readFile, stat } from 'fs';
import { normalize, sep } from 'path';

import * as Model from './model';

export class TreeView {
  private static addTime(item: Model.Item, stats: Model.IStats) {
    item.created = stats.birthtime;
    item.modified = stats.mtime;
  }

  opts: Model.IOpts = { encoding: 'utf8', content: true, depth: false };
  providers: Model.IProviders;

  constructor(opts?: Model.IOptsParam) {
    Object.assign(this.opts, opts || {});
    this.inject();
  }

  inject() {
    this.providers = { normalize, readFile, readdir, sep, stat };
  }

  process(path: string, cb?: Model.Cb) {
    const p = this.walk(this.providers.normalize(path));
    if (cb) p.then(cb);
    return p;
  }

  private walk(path: string, list: Model.TreeNode[] = [], depth = 0) {
    return new Promise<Model.TreeNode[]>((resolve, reject) => {
      this.providers.readdir(path, (error, files) => {
        if (error) {
          reject(error);
          return;
        }
        let pending = files.length;
        if (!pending) resolve(list);
        const tasks: Promise<any>[] = [];
        files.forEach((name) => {
          const item: Model.IRef = { name, path };
          this.providers.stat(this.getPath(item), (err, stats: Model.IStats) => {
            if (err) {
              item.error = err;
              list.push(item);
            } else {
              TreeView.addTime(item as Model.Item, stats);
              let task;
              if (stats.isFile()) {
                task = this.addFile(item as Model.IFile, stats);
                list.push(item as Model.IFile);
              } else if (stats.isDirectory()) {
                task = this.addDir(item as Model.IDir, depth);
                list.push(item as Model.IDir);
              }
              if (task) tasks.push(task);
            }
            pending -= 1;
            if (!pending) Promise.all(tasks).then(() => resolve(list));
          });
        });
      });
    })/*.catch((error) => {
      console.log(path, error);
      return Promise.resolve(); // Don't break the walk...
    })*/;
  }

  private getPath(item: Model.IRef) {
    return item.path + this.providers.sep + item.name;
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
    return new Promise<void>((resolve) =>
      this.providers.readFile(this.getPath(item), {
        encoding: this.opts.encoding
      }, (error, data) => {
        if (error) {
          item.error = error;
        } else {
          item.content = data.toString();
        }
        resolve();
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
