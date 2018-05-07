// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { customMatchers } from './matchers/matchers';

import { resolve } from 'path';
import { appendFile, copy, move, remove } from 'fs-extra';

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

// Currently watch is not supported on Linux (NodeJS fs.watch limitation)
if (process.platform === 'darwin' || process.platform === 'win32') {
  describe('TreeView e2e', () => {
    beforeEach((done) => {
      jasmine.addMatchers(customMatchers);

      // Copy fixture to temporary directory
      copy(basePath, resolve('dist/tmp'), () => done());
    });

    afterEach((done) => {
      // Delete temporary directory
      remove(resolve('dist/tmp'), () => done());
    });

    it('should watch with absolute path', (done) => {
      const treeview = new TreeView({ relative: false });

      // Start watching...
      const stopWatching = treeview.watch('dist/tmp');

      // Expected items to be emitted
      const unlink = ['a', 'deep'];
      const add = ['z', 'purple'];
      const change = ['b.txt'];

      // Listen to tree modifications
      treeview.on('unlink', (item) => {
        const index = unlink.indexOf(item.name);
        if (index !== -1) {
          unlink.splice(index, 1);
        }
      }).on('add', (item) => {
        const index = add.indexOf(item.name);
        if (index !== -1) {
          add.splice(index, 1);
        }
      }).on('change', (item) => {
        const index = change.indexOf(item.name);
        if (index !== -1) {
          change.splice(index, 1);
        }
      });

      let changesDone = false;

      // When tree is ready, modify the file system...
      treeview.on('ready', () => {
        move(resolve('dist/tmp/a'), resolve('dist/tmp/z'))
          .then(() => move(resolve('dist/tmp/sub/deep'), resolve('dist/tmp/sub/purple')))
          .then(() => appendFile(resolve('dist/tmp/sub/b.txt'), 'BBB', { encoding: 'utf8' }))
          .then(() => changesDone = true);
      });

      // ...and listen to `tree` event
      treeview.on('tree', (tree) => {
        // Check that the file system was modified before the tree event was emitted
        expect(changesDone).toBeTruthy();

        // Check that all events was emitted
        expect(unlink).toEqual([]);
        expect(add).toEqual([]);
        expect(change).toEqual([]);

        // Check the final state of the file system
        expect(tree).not.toContainItem({ name: 'a' });
        expect(tree).toContainItem({ name: 'z' });

        const sub = tree.find(item => item.name === 'sub') as Model.IDir;
        expect(sub.nodes).toContainItem({ name: 'b.txt', size: 6 });
        expect(sub.nodes).not.toContainItem({ name: 'deep' });
        expect(sub.nodes).toContainItem({ name: 'purple' });

        const purple = sub.nodes.find(item => item.name === 'purple') as Model.IDir;
        expect(purple.nodes).toContainItem({ name: 'c.png' });

        stopWatching();
        done();
      });
    });

    // FIXME: Actually, it's NOT working! An infinite loop occurs... :(
    // Do the same test but with option { relative: true }
  });
}
