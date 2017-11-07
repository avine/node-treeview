#! /usr/bin/env node

import * as yargs from 'yargs';
import { TreeView } from '../index';
import * as Model from '../model';
import { flatten } from '../helper/flatten';

const log = (data: any) => process.stdout.write(JSON.stringify(data, undefined, 2) + '\n');

// `depth` arguments validation
const booleanOrNumber = (arg: boolean | string) => {
  const strArg = arg.toString();
  switch (strArg) {
    case 'true': return true;
    case 'false': return false;
  }
  const numArg = parseInt(strArg, 10);
  if (!isNaN(numArg)) return numArg;
  throw new Error(`Boolean or number expected, but got "${arg}" instead!`);
};

yargs
  .locale('en')
  .usage('Usage: $0 <path> [options]')
  .demandCommand(1, 'Error: argument <path> is missing!')
  .option('content', {
    alias: 'c',
    default: false,
    describe: 'Add files content to output.',
    type: 'boolean'

  }).option('depth', {
    alias: 'd',
    coerce: booleanOrNumber,
    default: false,
    describe: 'Maximum depth of directories. Use a boolean or a number.'

  }).option('relative', {
    alias: 'r',
    default: false,
    describe: 'Use relative path.',
    type: 'boolean'

  }).option('exclude', {
    alias: 'e',
    default: [],
    describe: 'List of directory paths to exclude from output.',
    type: 'array'

  }).option('flatten', {
    alias: 'f',
    default: false,
    describe: 'Flatten the output.',
    type: 'boolean'

  })
  .help('help')
  .alias('help', 'h');

// log(yargs.argv); // For debugging

const path = yargs.argv._[0];
const { content, depth, relative, exclude } = yargs.argv;
if (path) {
  new TreeView({ content, depth, relative, exclude })
    .process(path)
    .then(result => log(yargs.argv.flatten ? flatten(result) : result))
    .catch((error: Error) => {
      // tslint:disable-next-line:no-console
      console.log(error.toString());
      process.exit(1);
    });
}
