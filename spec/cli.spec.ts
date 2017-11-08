// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { resolve } from 'path';
import { spawn } from 'child_process';

import { TreeView } from '../src/index';
import * as Model from '../src/model';

import { customMatchers } from './matchers/matchers';

// tslint:disable-next-line:no-console
// const log = (data: any) => console.log(JSON.stringify(data, undefined, 2));

const basePath = resolve('spec/fixture');
const subPath = resolve(basePath, 'sub');
const deepPath = resolve(subPath, 'deep');

const cliPath = resolve('dist/src/bin/cli.js');

function cli(args: string[], cb: (error: string | undefined, result?: Model.TreeNode[]) => any) {
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

  // The following spec is almost a copy/paste of the one in `e2e.spec.ts`
  it('should write to stdout on success', (done) => {
    cli([basePath, '--content'], (error, result) => {
      expect(result).toContainItem({
        type: 'file', path: basePath, name: 'a', content: 'aaa', size: 3, binary: false
      });
      expect(result).toContainItem({
        type: 'dir', path: basePath, name: 'sub'
      });

      let filtered = (result as Model.TreeNode[]).filter(r => r.name === 'sub');
      const sub = filtered[0] as Model.IDir;
      expect(sub.content).toContainItem({
        type: 'file', path: subPath, name: 'b.txt', content: 'bbb', size: 3, binary: false
      });
      expect(sub.content).toContainItem({
        type: 'dir', path: subPath, name: 'deep'
      });

      filtered = sub.content.filter(r => r.name === 'deep');
      const deep = filtered[0] as Model.IDir;

      const png = 'ccc'; // this is the real content of the dummy file `c.png`
      const pngContent = new Buffer(png).toString('base64');
      const pngSize = png.length;

      expect(deep.content).toContainItem({
        type: 'file', path: deepPath, name: 'c.png', content: pngContent, size: pngSize, binary: true
      });
      done();
    });
  });

});
