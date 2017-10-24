import fs from 'fs';
import pathM from 'path';

import * as Model from './model';

export class TreeView {
  static process(path: string, cb: Model.Cb = null, opts: Model.Opts = {}) {
    return new TreeView(opts).process(path, cb);
  }

  static getPath(item: Model.Ref) {
    return item.path + pathM.sep + item.name;
  }

  static addTime(item: Model.File | Model.Dir, stats: Model.Stats) {
    item.created = stats.birthtime;
    item.modified = stats.mtime;
  }

  static addContent(item: Model.File) {
    return new Promise(resolve =>
      fs.readFile(TreeView.getPath(item), (error, data) => {
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

  constructor(opts?: Model.Opts) {
    Object.assign(this.opts, opts || {});
  }

  process(path: string, cb: Model.Cb = null) {
    const p = this.walk(pathM.normalize(path));
    if (cb) {
      p.then(cb);
      return null;
    }
    return p;
  }

  walk(path: string, list: (Model.Ref | Model.Item | Model.Err)[] = [], depth = 0) {
    return new Promise((resolve) => {
      fs.readdir(path, (error, files) => {
        if (error) {
          list.push({ error });
          resolve(list);
          return;
        }
        let pending = files.length;
        const tasks: Promise<any>[] = [];
        files.forEach((name) => {
          const item: Model.Ref = { name, path };
          fs.stat(TreeView.getPath(item), (err, stats: Model.Stats) => {
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
