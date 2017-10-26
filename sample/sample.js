const TreeView = require('../index');

// Using callback interface
new TreeView().process(__dirname + '/contents', log);

// Using Promise interface
new TreeView().process(__dirname + '/contents').then(log);

function log(result) {
  process.stdout.write(JSON.stringify(result, undefined, 2) + '\n\n\n');
}
