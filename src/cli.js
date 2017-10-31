#! /usr/bin/env node

const yargs = require('yargs');
const TreeView = require('../index');

const log = (data) => console.log(JSON.stringify(data, undefined, 2));

yargs.option('content', {
  alias: 'c',
  describe: 'Add the content of files to output',
  boolean: true,
  default: true

}).option('depth', {
  alias: 'd',
  describe: 'Max depth of directories',
  number: true,
  default: false

}).option('encoding', {
  alias: 'en',
  describe: 'Set files encoding',
  string: true,
  default: 'utf8'

}).option('exclude', {
  alias: 'ex',
  describe: 'Path to exclude from output',
  array: true,
  default: []

})
.help();

// log(yargs.argv);

const path = yargs.argv._[0];
if (path) {
  new TreeView({
    content: yargs.argv.content,
    depth: yargs.argv.depth,
    encoding: yargs.argv.encoding,
    exclude: yargs.argv.exclude

  }).process(path)
    .then(result => log(result))
    .catch(error => {
      console.log('\n' + error.toString() + '\n');
      process.exit(1);
    });
}
