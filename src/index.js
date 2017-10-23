const fs = require('fs');
const pathM = require('path'); // "M" stand for module

class TreeView {
  static process(path, cb = null, opts = {}) {
    return new TreeView(opts).process(path, cb ? cb : null);
  }

  constructor(opts = {}) {
    this.opts = Object.assign({ content: true, depth: false }, opts);
  }

  process(path, cb = null) {
    const p = this._walk(pathM.normalize(path));
    if (cb) {
      p.then(cb);
    } else {
      return p;      
    }
  }

  _walk(path, list = [], depth = 0) {
    return new Promise(resolve => {
      fs.readdir(path, (error, files) => {
        if (error) {
          list.push({ error });
          return resolve(list);
        }
        let pending = files.length;
        let tasks = [];
        files.forEach(name => {
          const item = { name, path };
          fs.stat(this._getPath(item), (error, stats) => {
            if (error) {
              item.error = error;
              list.push(item);
            } else {
              this._addTime(item, stats);
              if (stats.isFile()) {
                tasks = tasks.concat(this._addFile(item, stats) || []);
                list.push(item);
              } else if (stats.isDirectory()) {
                tasks = tasks.concat(this._addDir(item, stats, depth) || []);
                list.push(item);
              }
            }
            --pending || Promise.all(tasks).then(() => resolve(list));
          });
        });
      });
    });
  }

  _addTime(item, stats) {
    Object.assign(item, { created: stats.birthtime, modified: stats.mtime });
  }

  _addFile(item, stats) {
    Object.assign(item, { type: 'file', size: stats.size });
    if (this.opts.content) {
      return this._getContent(item).then(result => Object.assign(item, result));
    }
  }

  _addDir(item, stats, depth) {
    item.type = 'dir';
    if (this.opts.depth === false || depth < this.opts.depth) {
      return this._walk(this._getPath(item), item.content = [], depth + 1);
    }
  }

  _getPath(item) {
    return `${item.path}${pathM.sep}${item.name}`;
  }

  _getContent(item) {
    return new Promise(resolve =>
      fs.readFile(this._getPath(item), (error, data) =>
        resolve(error ? { error } : { content: data.toString() })));
  }
}

module.exports = TreeView;
