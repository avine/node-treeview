// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { customMatchers } from './matchers/matchers';

import { resolve } from 'path';
import { copy, remove } from 'fs-extra';

import { TreeView } from '../src/index';
import * as Model from '../src/model';

// tslint:disable-next-line:no-console
// const log = (data: any) => console.log(JSON.stringify(data, undefined, 2));

const basePath = resolve('spec/fixture');
const subPath = resolve(basePath, 'sub');
const deepPath = resolve(subPath, 'deep');

describe('TreeView e2e', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should process', (done) => {
    new TreeView({ content: true }).process(basePath).then((tree) => {
      expect(tree).toContainItem({
        type: 'file', path: basePath, name: 'a', content: 'aaa', size: 3, binary: false
      });
      expect(tree).toContainItem({
        type: 'dir', path: basePath, name: 'sub'
      });

      let filtered = tree.filter(item => item.name === 'sub');
      const sub = filtered[0] as Model.IDir;
      expect(sub.nodes).toContainItem({
        type: 'file', path: subPath, name: 'b.txt', content: 'bbb', size: 3, binary: false
      });
      expect(sub.nodes).toContainItem({
        type: 'dir', path: subPath, name: 'deep'
      });

      filtered = sub.nodes.filter(item => item.name === 'deep');
      const deep = filtered[0] as Model.IDir;

      const png = 'ccc'; // this is the real content of the dummy file `c.png`
      const pngContent = new Buffer(png).toString('base64');
      const pngSize = png.length;

      expect(deep.nodes).toContainItem({
        type: 'file', path: deepPath, name: 'c.png', content: pngContent, size: pngSize, binary: true
      });

      done();
    });
  });
});

describe('TreeView e2e', () => {
  beforeEach((done) => {
    jasmine.addMatchers(customMatchers);

    copy(basePath, resolve('dist/tmp'), () => done());
  });

  afterEach((done) => {
    remove(resolve('dist/tmp'), () => done());
  });

  it('should watch', (done) => {
    // Start watching...
    const treeview = new TreeView({ relative: true });
    const stopWatching = treeview.watch('dist/tmp');

    // When ready, modify the fixture...
    treeview.on('ready', () => {
      remove(resolve('dist/tmp/a'));
    });

    // ...and listen to `tree` event
    treeview.on('tree', (tree) => {
      expect(tree).not.toContainItem({ name: 'a' });
      stopWatching();

      done();
    });
  });
});
