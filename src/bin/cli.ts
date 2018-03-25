#! /usr/bin/env node

import * as yargs from 'yargs';

import { resolve } from 'path';
import { writeFile } from 'fs';

import { TreeView } from '../index';
import { clean, flatten } from '../helper';
import { pretty, renderer, Renderer } from '../helper/pretty';

import { exit, getDepthArg, getPrettyArg } from './cli.helper';
import { DebugOutput, IDebug } from './cli.model';

// Don't forget to update cli version according to `package.json` version

const stringify = (data: any) => JSON.stringify(data, undefined, 2) + '\n';

// tslint:disable-next-line:no-var-requires
const pkgVersion = require(resolve('package.json')).version;

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
    coerce: getDepthArg,
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
    coerce: getPrettyArg,
    default: false,
    describe: 'Pretty-print output'

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

const a = yargs.argv;

const path = a._[0];

const opts = {
  all: a.all,
  content: a.content,
  relative: a.relative,
  depth: a.depth,
  include: a.include,
  exclude: a.exclude,
  glob: a.glob
};

const helper = {
  clean: a.clean,
  flatten: a.flatten,
  pretty: a.pretty
};

const outputPath = a.output;
const debugMode = a.debug;

if (path) {
  new TreeView(opts)
    .process(path)
    .then((tree) => {
      // Note that if the output is flattened there's no need to clean it!
      // Because the flatten version only contains the files (and not the directories).
      const output =
        helper.flatten ? flatten(tree) :
        helper.clean ? clean(tree) :
        tree;

      let outputStr: string;
      if (helper.pretty) {
        if (typeof helper.pretty === 'string') {
          const render = (renderer as { [index: string]: Renderer })[helper.pretty];
          outputStr = pretty(output, render) + '\n';
        } else {
          outputStr = pretty(output) + '\n';
        }
      } else {
        outputStr = stringify(output);
      }

      if (debugMode) {
        const debug: IDebug = {
          opts,
          path,
          helper,
          output: helper.pretty ? outputStr : output,
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
    }).catch(exit);
}
