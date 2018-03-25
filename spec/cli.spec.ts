// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { resolve } from 'path';
import { spawn } from 'child_process';

import { TreeView } from '../src/index';
import * as Model from '../src/model';

import { IDebug } from '../src/bin/cli.model';

import { customMatchers } from './matchers/matchers';

// tslint:disable-next-line:no-console
// const log = (data: any) => console.log(JSON.stringify(data, undefined, 2));

const basePath = resolve('spec/fixture');

const cliPath = resolve('dist/src/bin/cli.js');

function cli(args: string[], cb: (error: string | undefined, result?: Model.TreeNode[] | IDebug) => any) {
  const cp = spawn('node', [cliPath].concat(args));
  cp.stdout.on('data', data => cb(undefined, JSON.parse(data.toString())));
  cp.stderr.on('data', data => cb(data.toString()));
  // cp.on('close', (code: any) => console.log(`child process exited with code ${code}`));
  return cp;
}

describe('TreeView cli', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should write to stderr on error', (done) => {
    cli(['oups'], (error, result) => {
      expect(error).toBeDefined();
      expect(result).toBeUndefined();
      done();
    });
  });

  it('should write to stdout on success', (done) => {
    cli([basePath], (error, result) => {
      expect(error).toBeUndefined();
      expect(result).toBeDefined();
      done();
    });
  });

  it('should use default options', (done) => {
    cli([basePath, '--debug'], (error, debug) => {
      debug = debug as IDebug;
      expect(error).toBeUndefined();
      expect(debug.opts).toEqual({
        all: false,
        content: false,
        relative: false,
        depth: -1,
        include: [],
        exclude: [],
        glob: []
      });
      expect(debug.helper.clean).toBe(false);
      expect(debug.helper.flatten).toBe(false);
      expect(debug.helper.pretty).toBeUndefined();
      expect(debug.outputPath).toBeUndefined();
      expect(debug.path).toEqual(basePath);
      done();
    });
  });

  it('should use requested options', (done) => {
    cli([basePath, '--debug',
      '--all',
      '--content',
      '--relative',
      '--depth', '2',
      '--include', 'path/1', 'path/2',
      '--exclude', 'path/3', 'path/4',
      '--glob', '*.*', '**/*',
      '--clean',
      '--flatten',
      '--pretty', 'light',
      '--output', './tree.json'
    ], (error, debug) => {
      debug = debug as IDebug;
      expect(error).toBeUndefined();
      expect(debug.opts).toEqual({
        all: true,
        content: true,
        relative: true,
        depth: 2,
        include: [resolve('path/1'), resolve('path/2')],
        exclude: [resolve('path/3'), resolve('path/4')],
        glob: ['*.*', '**/*']
      });
      expect(debug.helper.clean).toBe(true);
      expect(debug.helper.flatten).toBe(true);
      expect(debug.helper.pretty).toBe('light');
      expect(debug.outputPath).toEqual('./tree.json');
      expect(debug.path).toEqual(basePath);
      done();
    });
  });

  it('should have options alias', (done) => {
    cli([basePath, '--debug',
      '-a',
      '-c',
      '-r',
      '-d', '2',
      '-i', 'path/1', 'path/2',
      '-e', 'path/3', 'path/4',
      '-g', '*.*', '**/*',
      '-n', // notice: it's "n" (and not "c" which is already used for "content")
      '-f',
      '-p', 'light',
      '-o', './tree.json'
    ], (error, debug) => {
      debug = debug as IDebug;
      expect(error).toBeUndefined();
      expect(debug.opts).toEqual({
        all: true,
        content: true,
        relative: true,
        depth: 2,
        include: [resolve('path/1'), resolve('path/2')],
        exclude: [resolve('path/3'), resolve('path/4')],
        glob: ['*.*', '**/*']
      });
      expect(debug.helper.clean).toBe(true);
      expect(debug.helper.flatten).toBe(true);
      expect(debug.helper.pretty).toBe('light');
      expect(debug.outputPath).toEqual('./tree.json');
      expect(debug.path).toEqual(basePath);
      done();
    });
  });
});
