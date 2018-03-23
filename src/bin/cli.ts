#! /usr/bin/env node

import * as yargs from 'yargs';

import { resolve } from 'path';
import { writeFile } from 'fs';

import { TreeView } from '../index';
import { clean, flatten, pretty } from '../helper';

import { DebugOutput, IDebug } from './cli-model';

// Don't forget to update cli version according to `package.json` version

// tslint:disable-next-line:no-var-requires
const pkgVersion = require(resolve('package.json')).version;

const stringify = (data: any) => JSON.stringify(data, undefined, 2) + '\n';

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
  .option('all', {
    alias: 'a',
    default: false,
    describe: 'Include hidden files in output',
    type: 'boolean'

  }).option('content', {
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

  }).option('include', {
    alias: 'i',
    default: [],
    describe: 'List of directory paths to include in output',
    type: 'array'

  }).option('exclude', {
    alias: 'e',
    default: [],
    describe: 'List of directory paths to exclude from output',
    type: 'array'

  }).option('glob', {
    alias: 'g',
    default: [],
    describe: 'Match files based on glob pattern',
    type: 'array'

  }).option('clean', {
    alias: 'n', // notice: it's "n" (and not "c" which is already used for "content")
    default: false,
    describe: 'Clean empty directories from output',
    type: 'boolean'

  }).option('flatten', {
    alias: 'f',
    default: false,
    describe: 'Flatten output',
    type: 'boolean'

  }).option('pretty', {
    alias: 'p',
    default: false,
    describe: 'Pretty-print output',
    type: 'boolean'

  }).option('output', {
    alias: 'o',
    describe: 'Output file path',
    type: 'string'

  }).option('debug', {
    default: false,
    describe: 'Add debugging information to output',
    type: 'boolean'

  });

// process.stdout.write(stringify(yargs.argv)); // For debugging

const path = yargs.argv._[0];
const { all, content, relative, depth, include, exclude, glob } = yargs.argv;
if (path) {
  new TreeView({ all, content, relative, depth, include, exclude, glob })
    .process(path)
    .then((tree) => {
      // Note that if the output is flattened there's no need to clean it!
      // Because the flatten version only contains the files (and not the directories).
      const output =
        yargs.argv.flatten ? flatten(tree) :
        yargs.argv.clean ? clean(tree) :
        tree;
      let outputStr;
      if (yargs.argv.pretty) {
        outputStr = pretty(output) + '\n';
      } else {
        outputStr = stringify(output);
      }
      const outputPath = yargs.argv.output;
      if (yargs.argv.debug) {
        const debug: IDebug = {
          opts: { all, content, relative, depth, include, exclude, glob },
          path,
          helper: {
            clean: yargs.argv.clean,
            flatten: yargs.argv.flatten,
            pretty: yargs.argv.pretty
          },
          output: yargs.argv.pretty ? outputStr : output,
          outputPath
        };
        process.stdout.write(stringify(debug));
      } else {
        if (outputPath) {
          writeFile(resolve(outputPath), outputStr, (error) => {
            if (error) throw error;
          });
        } else {
          process.stdout.write(outputStr);
        }
      }
    })
    .catch((error: Error) => {
      process.stderr.write(error.toString() + '\n');
      process.exit(1);
    });
}
