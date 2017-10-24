import { readdir, readFile, stat } from 'fs';
import { sep, normalize } from 'path';

import * as Model from './model';

export class TreeView {
  static process(path: string, cb?: Model.Cb, opts?: Model.OptsParam) {
    return new TreeView(opts).process(path, cb);
  }

  static getPath(item: Model.Ref) {
    return item.path + sep + item.name;
  }

  static addTime(item: Model.File | Model.Dir, stats: Model.Stats) {
    item.created = stats.birthtime;
    item.modified = stats.mtime;
  }

  static addContent(item: Model.File) {
    return new Promise(resolve =>
      readFile(TreeView.getPath(item), (error, data) => {
        if (error) {
          item.error = error;
        } else {
          item.content = data.toString();
        }
        resolve();
      })
    );
  }

  opts: Model.Opts = { content: true, depth: false };

  constructor(opts?: Model.OptsParam) {
    Object.assign(this.opts, opts || {});
  }

  process(path: string, cb?: Model.Cb) {
    const p = this.walk(normalize(path));
    if (cb) {
      p.then(cb);
      return null;
    }
    return p;
  }

  walk(path: string, list: (Model.Ref | Model.Item | Model.Err)[] = [], depth = 0) {
    return new Promise((resolve) => {
      readdir(path, (error, files) => {
        if (error) {
          list.push({ error });
          resolve(list);
          return;
        }
        let pending = files.length;
        const tasks: Promise<any>[] = [];
        files.forEach((name) => {
          const item: Model.Ref = { name, path };
          stat(TreeView.getPath(item), (err, stats: Model.Stats) => {
            if (err) {
              item.error = err;
              list.push(item);
            } else {
              TreeView.addTime(<Model.Item>item, stats);
              let task;
              if (stats.isFile()) {
                task = this.addFile(<Model.File>item, stats);
                list.push(<Model.File>item);
              } else if (stats.isDirectory()) {
                task = this.addDir(<Model.Dir>item, stats, depth);
                list.push(<Model.Dir>item);
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

  addFile(item: Model.File, stats: Model.Stats) {
    item.type = 'file';
    item.size = stats.size;
    if (this.opts.content) {
      return TreeView.addContent(item);
    }
    return null;
  }

  addDir(item: Model.Dir, stats: Model.Stats, depth: number) {
    item.type = 'dir';
    if (this.opts.depth === false || depth < this.opts.depth) {
      item.content = [];
      return this.walk(TreeView.getPath(item), item.content, depth + 1);
    }
    return null;
  }
}
