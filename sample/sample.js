const treeview = require('../index');

treeview(__dirname + '/contents').then(result => {
  process.stdout.write(JSON.stringify(result, undefined, 2));  
});
