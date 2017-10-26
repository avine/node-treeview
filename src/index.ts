import { readdir, readFile, stat } from 'fs';
import { normalize, sep } from 'path';

import * as Model from './model';

export class TreeView {
  static process(path: string, cb?: Model.Cb, opts?: Model.IOptsParam) {
    return new TreeView(opts).process(path, cb);
  }

  private static getPath(item: Model.IRef) {
    return item.path + sep + item.name;
  }

  private static addTime(item: Model.Item, stats: Model.IStats) {
    item.created = stats.birthtime;
    item.modified = stats.mtime;
  }

  private static addContent(item: Model.IFile) {
    return new Promise<void>(resolve =>
      readFile(TreeView.getPath(item), (error, data) => {
        if (error) {
          item.error = error;
        } else {
          item.content = data.toString();
        }
        resolve();
      }));
  }

  opts: Model.IOpts = { content: true, depth: false };

  constructor(opts?: Model.IOptsParam) {
    Object.assign(this.opts, opts || {});
  }

  process(path: string, cb?: Model.Cb) {
    const p = this.walk(normalize(path));
    if (cb) p.then(cb);
    return p;
  }

  private walk(path: string, list: Model.Tree[] = [], depth = 0) {
    return new Promise<Model.Tree[]>((resolve, reject) => {
      readdir(path, (error, files) => {
        if (error) {
          reject(error);
          return;
        }
        let pending = files.length;
        const tasks: Array<Promise<any>> = [];
        files.forEach((name) => {
          const item: Model.IRef = { name, path };
          stat(TreeView.getPath(item), (err, stats: Model.IStats) => {
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
                task = this.addDir(item as Model.IDir, stats, depth);
                list.push(item as Model.IDir);
              }
              if (task) tasks.push(task);
            }
            pending -= 1;
            if (!pending) Promise.all(tasks).then(() => resolve(list));
          });
        });
      });
    });
  }

  private addFile(item: Model.IFile, stats: Model.IStats) {
    item.type = 'file';
    item.size = stats.size;
    if (this.opts.content) {
      return TreeView.addContent(item);
    }
    return null;
  }

  private addDir(item: Model.IDir, stats: Model.IStats, depth: number) {
    item.type = 'dir';
    if (this.opts.depth === false || depth < this.opts.depth) {
      item.content = [];
      return this.walk(TreeView.getPath(item), item.content, depth + 1)
        .catch((error) => {
          item.error = error;
          delete item.content;
          return Promise.resolve(); // Don't break the walk...
        });
    }
    return null;
  }
}
