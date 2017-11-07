// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { resolve } from 'path';

import { TreeView } from '../src/index';
import * as Model from '../src/model';

import { customMatchers } from './matchers/matchers';

// tslint:disable-next-line:no-console
// const log = (data: any) => console.log(JSON.stringify(data, undefined, 2));

const basePath = resolve('spec', 'e2e-sample');
const subPath = resolve(basePath, 'sub');
const deepPath = resolve(subPath, 'deep');

describe('TreeView e2e', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should works!', (done) => {
    new TreeView({ content: true }).process(basePath).then((result) => {
      expect(result).toContainItem({
        binary: false, content: 'aaa', name: 'a', path: basePath, size: 3, type: 'file'
      });
      expect(result).toContainItem({ type: 'dir', path: basePath, name: 'sub' });

      let filtered = result.filter(r => r.name === 'sub');
      const sub = filtered[0] as Model.IDir;
      expect(sub.content).toContainItem({
        binary: false, content: 'bbb', name: 'b.txt', path: subPath, size: 3, type: 'file'
      });
      expect(sub.content).toContainItem({ type: 'dir', path: subPath, name: 'deep' });

      filtered = sub.content.filter(r => r.name === 'deep');
      const deep = filtered[0] as Model.IDir;

      const png = 'ccc'; // this is the real content of the dummy file `c.png`
      const pngContent = new Buffer(png).toString('base64');
      const pngSize = png.length;

      expect(deep.content).toContainItem({
        binary: true, content: pngContent, name: 'c.png', path: deepPath, size: pngSize, type: 'file'
      });

      done();
    });
  });
});
