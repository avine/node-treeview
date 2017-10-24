import fs from 'fs';
import pathM from 'path'; // "M" stand for module

export default class TreeView {
  static process(path, cb = null, opts = {}) {
    return new TreeView(opts).process(path, cb);
  }

  static getPath(item) {
    return item.path + pathM.sep + item.name;
  }

  static addTime(item, stats) {
    item.created = stats.birthtime;
    item.modified = stats.mtime;
  }

  static addContent(item) {
    return new Promise(resolve =>
      fs.readFile(TreeView.getPath(item), (error, data) => {
        if (error) {
          item.error = error;
        } else {
          item.content = data.toString();
        }
        resolve();
      }));
  }

  constructor(opts) {
    this.opts = Object.assign({ content: true, depth: false }, opts || {});
  }

  process(path, cb = null) {
    const p = this.walk(pathM.normalize(path));
    if (cb) {
      p.then(cb);
      return null;
    }
    return p;
  }

  walk(path, list = [], depth = 0) {
    return new Promise((resolve) => {
      fs.readdir(path, (error, files) => {
        if (error) {
          list.push({ error });
          resolve(list);
          return;
        }
        let pending = files.length;
        const tasks = [];
        files.forEach((name) => {
          const item = { name, path };
          fs.stat(TreeView.getPath(item), (err, stats) => {
            if (err) {
              item.error = err;
              list.push(item);
            } else {
              TreeView.addTime(item, stats);
              let task;
              if (stats.isFile()) {
                task = this.addFile(item, stats);
                list.push(item);
              } else if (stats.isDirectory()) {
                task = this.addDir(item, stats, depth);
                list.push(item);
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

  addFile(item, stats) {
    item.type = 'file';
    item.size = stats.size;
    if (this.opts.content) {
      return TreeView.addContent(item);
    }
    return null;
  }

  addDir(item, stats, depth) {
    item.type = 'dir';
    if (this.opts.depth === false || depth < this.opts.depth) {
      item.content = [];
      return this.walk(TreeView.getPath(item), item.content, depth + 1);
    }
    return null;
  }
}
