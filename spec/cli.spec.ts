// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { resolve } from 'path';
import { spawn } from 'child_process';

import { TreeView } from '../src/index';
import * as Model from '../src/model';

import { IDebug } from '../src/bin/cli-model';

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
    cli([basePath, '--debug'], (error, result) => {
      result = result as IDebug;
      expect(error).toBeUndefined();
      expect(result.opts).toEqual({
        content: false,
        relative: false,
        depth: false,
        hidden: false,
        include: [],
        exclude: [],
        pattern: []
      });
      expect(result.flatten).toBeFalsy();
      expect(result.clean).toBeFalsy();
      expect(result.outputPath).toBeUndefined();
      expect(result.path).toEqual(basePath);
      done();
    });
  });

  it('should use requested options', (done) => {
    cli([basePath, '--debug',
      '--content',
      '--relative',
      '--depth', '2',
      '--hidden',
      '--include', 'path/1', 'path/2',
      '--exclude', 'path/3', 'path/4',
      '--pattern', '*.*', '**/*',
      '--flatten',
      '--clean',
      '--output', './tree.json'
    ], (error, result) => {
      result = result as IDebug;
      expect(error).toBeUndefined();
      expect(result.opts).toEqual({
        content: true,
        relative: true,
        depth: 2,
        hidden: true,
        include: [resolve('path/1'), resolve('path/2')],
        exclude: [resolve('path/3'), resolve('path/4')],
        pattern: ['*.*', '**/*']
      });
      expect(result.flatten).toBeTruthy();
      expect(result.clean).toBeTruthy();
      expect(result.outputPath).toEqual('./tree.json');
      expect(result.path).toEqual(basePath);
      done();
    });
  });

  it('should have options alias', (done) => {
    cli([basePath, '--debug',
      '-c',
      '-r',
      '-d', '2',
      '-h',
      '-i', 'path/1', 'path/2',
      '-e', 'path/3', 'path/4',
      '-p', '*.*', '**/*',
      '-f',
      '-n', // notice: it's "n" (and not "c" which is already used for "content")
      '-o', './tree.json'
    ], (error, result) => {
      result = result as IDebug;
      expect(error).toBeUndefined();
      expect(result.opts).toEqual({
        content: true,
        relative: true,
        depth: 2,
        hidden: true,
        include: [resolve('path/1'), resolve('path/2')],
        exclude: [resolve('path/3'), resolve('path/4')],
        pattern: ['*.*', '**/*']
      });
      expect(result.flatten).toBeTruthy();
      expect(result.clean).toBeTruthy();
      expect(result.outputPath).toEqual('./tree.json');
      expect(result.path).toEqual(basePath);
      done();
    });
  });
});
