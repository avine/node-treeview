const TreeView = require('../index');

TreeView.process(__dirname + '/contents').then(result => {
  process.stdout.write(JSON.stringify(result, undefined, 2) + '\n');
});
