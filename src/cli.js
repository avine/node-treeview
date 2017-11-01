#! /usr/bin/env node

const yargs = require('yargs');
const TreeView = require('../index');

const log = (data) => console.log(JSON.stringify(data, undefined, 2));

yargs
  .locale('en')
  .usage("Usage:\n  $0 <path> {options}")
  .option('content', {
    alias: 'c',
    describe: 'Add files content to output',
    boolean: true,
    default: true

  }).option('depth', {
    alias: 'd',
    describe: 'Maximum depth of directories',
    number: true,
    default: false

  }).option('exclude', {
    alias: 'ex',
    describe: 'List of directory paths to exclude from output',
    array: true,
    default: []

  }).option('encoding', {
    alias: 'en',
    describe: 'Set files encoding',
    string: true,
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
    exclude: yargs.argv.exclude

  }).process(path)
    .then(result => log(result))
    .catch(error => {
      console.log(error.toString() + '\n');
      process.exit(1);
    });
} else {
  console.log(new Error('<path> is missing').toString() + '\n');
  yargs.showHelp();
  process.exit(1);
}
