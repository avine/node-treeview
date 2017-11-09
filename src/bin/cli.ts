#! /usr/bin/env node

import * as yargs from 'yargs';

import { resolve } from 'path';
import { writeFile } from 'fs';

import { TreeView } from '../index';
import { flatten } from '../helper/flatten';

import { IDebug } from './cli-model';

// Don't forget to update cli version according to `package.json` version

// tslint:disable-next-line:no-var-requires
const pkgVersion = require(resolve('package.json')).version;

const stringify = (data: any) => JSON.stringify(data, undefined, 2) + '\n';
const log = (data: any) => process.stdout.write(stringify(data));

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
  .version(pkgVersion).alias('version', 'v')
  .help('help').alias('help', 'h')
  .usage('Usage: $0 <path> [options]')
  .demandCommand(1, 'Error: argument <path> is missing!')
  .option('content', {
    alias: 'c',
    default: false,
    describe: 'Add files content to output',
    type: 'boolean'

  }).option('relative', {
    alias: 'r',
    default: false,
    describe: 'Use relative path',
    type: 'boolean'

  }).option('depth', {
    alias: 'd',
    coerce: booleanOrNumber,
    default: false,
    describe: 'Maximum depth of directories (use boolean or number)'

  }).option('flatten', {
    alias: 'f',
    default: false,
    describe: 'Flatten output',
    type: 'boolean'

  }).option('exclude', {
    alias: 'e',
    default: [],
    describe: 'List of directory paths to exclude from output',
    type: 'array'

  }).option('output', {
    alias: 'o',
    describe: 'Output file path',
    type: 'string'

  }).option('debug', {
    default: false,
    describe: 'Add debugging information to output',
    type: 'boolean'

  });

// log(yargs.argv); // For debugging

const path = yargs.argv._[0];
const { content, relative, depth, exclude } = yargs.argv;
if (path) {
  new TreeView({ content, relative, depth, exclude })
    .process(path)
    .then((result) => {
      const output = yargs.argv.flatten ? flatten(result) : result;
      const outputPath = yargs.argv.output;
      if (yargs.argv.debug) {
        const debug: IDebug = {
          opts: { content, relative, depth, exclude },
          path,
          flatten: yargs.argv.flatten,
          output,
          outputPath
        };
        log(debug);
      } else {
        if (outputPath) {
          writeFile(resolve(outputPath), stringify(output), (error) => {
            if (error) throw error;
          });
        } else {
          log(output);
        }
      }
    })
    .catch((error: Error) => {
      process.stderr.write(error.toString() + '\n');
      process.exit(1);
    });
}
