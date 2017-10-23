const fs = require('fs');

class TreeView {
  constructor() {
  }

  process(path, callback) {
    return this._walk(path).then(callback);
  }

  _walk(path, list = []) {
    return new Promise((resolve/*, reject*/) => {
      fs.readdir(path, (err, files) => {
        let pending = files.length;
        const tasks = [];
        files.forEach(name => {
          const resource = `${path}/${name}`;
          fs.stat(resource, (err, stats) => {
            const item = { name };
            if (stats.isFile()) {
              list.push(item);
              tasks.push(
                new Promise((resolve/*, reject*/) =>
                  fs.readFile(resource, (err, data) => resolve(data.toString()))
                ).then(content => item.content = content)
              );
            } else if (stats.isDirectory()) {
              list.push(item);
              item.dir = [];
              tasks.push(this._walk(resource, item.dir));
            }
            --pending || Promise.all(tasks).then(() => resolve(list));
          });
        });
      });
    });
  }
}

const treeView = new TreeView();

treeView.process('./sample/contents', result => log(result));

treeView.process('./sample/contents/sub2', result => log(result));

function log(result) {
  process.stdout.write(JSON.stringify(result, undefined, 2) + '\n');
}
