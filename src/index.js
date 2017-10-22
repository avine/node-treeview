const fs = require('fs');

module.exports = function treeview(path, tree = []) {
  const promise = new Promise((resolve/*, reject*/) => {
    fs.readdir(path, (err, files) => {
      const directories = [];
      files.forEach(name => {
        fs.stat(`${path}/${name}`, (err, stats) => {
          const item = { name };
          if (stats.isDirectory()) {
            item.tree = [];
            directories.push(treeview(`${path}/${name}`, item.tree));
          }
          tree.push(item);
          if (tree.length === files.length) {
            Promise.all(directories).then(() => resolve(tree));
          }
        });
      });
    });
  });
  return promise;
};
