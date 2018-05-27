#! /usr/bin/env node

import * as yargs from 'yargs';

import { join, resolve } from 'path';
import { writeFile } from 'fs';

import { INFINITE_DEPTH, TreeView } from '../index';
import * as Model from '../model';

import { clean, flatten } from '../helper';
import { pretty, renderer, Renderer } from '../helper/pretty';

import { exit, getDepthArg, getPrettyArg, getSortArg, getSortDesc } from './cli.helper';
import { DebugOutput, IDebug, IDebugHelper } from './cli.model';

const stringify = (data: any) => JSON.stringify(data, undefined, 2) + '\n';

// Note: the following path refers to the directory: `./dist/src/package.json`
// (for details see the script: `npm run postbuild`).
const pkgVersion = require(join(__dirname, '../package.json')).version; // tslint:disable-line:no-var-requires

yargs
  .locale('en')
  .version(pkgVersion).alias('version', 'v')
  .help('help').alias('help', 'h')
  .usage('Usage: $0 <path> [options]')
  .demandCommand(1, 'Error: argument <path> is missing!')
  .option('all', {
    alias: 'a',
    describe: 'Include hidden files in output',
    type: 'boolean'

  }).option('content', {
    alias: 'c',
    describe: 'Add files content to output',
    type: 'boolean'

  }).option('depth', {
    alias: 'd',
    coerce: getDepthArg,
    describe: 'Maximum depth of directories',
    type: 'number',
    default: INFINITE_DEPTH // Setting a default value ensures that the coerce function will always be called

  }).option('relative', {
    alias: 'r',
    describe: 'Use relative path',
    type: 'boolean'

  }).option('include', {
    alias: 'i',
    describe: 'List of directory paths to include in output',
    type: 'array'

  }).option('exclude', {
    alias: 'e',
    describe: 'List of directory paths to exclude from output',
    type: 'array'

  }).option('glob', {
    alias: 'g',
    describe: 'Match files based on glob pattern',
    type: 'array'

  }).option('sort', {
    alias: 's',
    coerce: getSortArg,
    describe: 'Sort output ' + getSortDesc(),
    type: 'number',
    default: 0

  }).option('clean', {
    alias: 'n', // notice: it's "n" (and not "c" which is already used for "content")
    describe: 'Clean empty directories from output',
    type: 'boolean'

  }).option('flatten', {
    alias: 'f',
    describe: 'Flatten output',
    type: 'boolean'

  }).option('pretty', {
    alias: 'p',
    coerce: getPrettyArg,
    describe: 'Pretty-print output',
    type: 'string'

  }).option('watch', {
    alias: 'w',
    describe: 'Watch filesystem',
    type: 'boolean'

  }).option('output', {
    alias: 'o',
    describe: 'Output file path',
    type: 'string'

  }).option('debug', {
    describe: 'Add debugging information to output',
    type: 'boolean'

  });

// process.stdout.write(stringify(yargs.argv)); // For debugging

const a = yargs.argv;

const path = a._[0];

const opts: Model.IOpts = {
  all: a.all,
  content: a.content,
  depth: a.depth,
  relative: a.relative,
  include: a.include || [],
  exclude: a.exclude || [],
  glob: a.glob || [],
  sort: a.sort
};

const helper: IDebugHelper = {
  clean: a.clean,
  flatten: a.flatten,
  pretty: a.pretty
};

const watchMode: boolean = a.watch;
const outputPath = a.output as string || undefined;
const debugMode: boolean = a.debug;

const handleTree = (tree: Model.TreeNode[]) => {
  // Note that if the output is flattened there's no need to clean it!
  // Because the flatten version only contains the files (and not the directories).
  const output =
    helper.flatten ? flatten(tree) :
    helper.clean ? clean(tree) :
    tree;

  let outputStr: string;
  if (helper.pretty) {
    const render = (renderer as { [index: string]: Renderer })[helper.pretty as string];
    outputStr = pretty(output, render) + '\n';
  } else {
    outputStr = stringify(output);
  }

  if (debugMode) {
    const debug: IDebug = {
      opts,
      path,
      helper,
      watchMode,
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
};

if (path) {
  const treeview = new TreeView(opts);
  if (!watchMode) {
    treeview.process(path).then(handleTree).catch(exit);
  } else {
    treeview.on('ready', handleTree).on('tree', handleTree).watch(path);
  }
}
