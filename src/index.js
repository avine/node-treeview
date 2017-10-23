const fs = require('fs');
const pathModule = require('path');

class TreeView {
  static process(path, callback = null, options = {}) {
    return new TreeView(options).process(path, result =>
      callback ? callback(result) : null);
  }

  constructor(options = {}) {
    this.options = Object.assign({
      getContent: true,
      subLevelMax: false
    }, options);
  }

  process(path, callback = null) {
    const promise = this._walk(pathModule.normalize(path));
    if (callback) {
      promise.then(callback);
    }
    return promise;
  }

  _walk(path, list = [], subLevel = 0) {
    return new Promise(resolve => {
      fs.readdir(path, (error, files) => {
        if (error) {
          list.push({ error });
          return resolve(list);
        }
        let pending = files.length;
        const tasks = [];
        files.forEach(name => {
          const resource = `${path}${pathModule.sep}${name}`;
          const item = { name, path };
          fs.stat(resource, (error, stats) => {
            if (error) {
              item.error = error;
              list.push(item);
            } else {
              this._addTime(item, stats);
              if (stats.isFile()) {
                item.type = 'file';
                item.size = stats.size;
                if (this.options.getContent) {
                  tasks.push(this._getContent(resource).then(result =>
                    Object.assign(item, result)));
                }
                list.push(item);
              } else if (stats.isDirectory()) {
                item.type = 'directory';
                if (
                  this.options.subLevelMax === false ||
                  subLevel < this.options.subLevelMax
                ) {
                  item.content = [];
                  tasks.push(this._walk(resource, item.content, subLevel + 1));
                }
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
    Object.assign(item, { birthtime: stats.birthtime, mtime: stats.mtime });
  }

  _getContent(resource) {
    return new Promise(resolve =>
      fs.readFile(resource, (error, data) =>
        resolve(error ? { error } : { content: data.toString() })));
  }
}

module.exports = TreeView;
