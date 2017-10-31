
const yargs = require('yargs');
const TreeView = require('../index');

const log = (data) => console.log(JSON.stringify(data, undefined, 2));

yargs.option('content', {
  alias: 'c',
  describe: 'Add file content',
  boolean: true,
  default: true

}).option('depth', {
  alias: 'd',
  describe: 'Max depth',
  number: true,
  default: 0

}).option('encoding', {
  alias: 'e',
  describe: 'File encoding',
  default: 'utf8'

})
.help();

// log(yargs.argv);

const path = yargs.argv._[0];
if (path) {
  new TreeView({
    content: yargs.argv.content,
    depth: yargs.argv.depth,
    encoding: yargs.argv.encoding,
  }).process(path).then(
    result => log(result),
    error => log(error)
  );
}
