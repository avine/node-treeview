// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { customMatchers } from './matchers/matchers';

import { resolve } from 'path';
import { appendFile, copy, move, remove } from 'fs-extra';

import { TreeView } from '../src/index';
import * as Model from '../src/model';

import { cWatchFn, fWatchFn, FS_WATCH_SUPPORTED } from '../src/watch';

// tslint:disable-next-line:no-console
// const log = (data: any) => console.log(JSON.stringify(data, undefined, 2));

const basePath = resolve('spec/fixture');
const subPath = resolve(basePath, 'sub');
const deepPath = resolve(subPath, 'deep');

describe('TreeView e2e process', () => {
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
      const pngContent = Buffer.from(png).toString('base64');
      const pngSize = png.length;

      expect(deep.nodes).toContainItem({
        type: 'file', path: deepPath, name: 'c.png', content: pngContent, size: pngSize, binary: true
      });

      done();
    });
  });
});

describe('TreeView e2e watch', () => {
  beforeEach((done) => {
    jasmine.addMatchers(customMatchers);

    // Copy fixture to temporary directory
    copy(basePath, resolve('dist/tmp')).then(done);
  });

  afterEach((done) => {
    // Delete temporary directory
    remove(resolve('dist/tmp')).then(done);
  });

  [
    { watchFn: fWatchFn, relative: false, expectation: 'should watch using fs provider and absolute path' },
    { watchFn: fWatchFn, relative: true, expectation: 'should watch using fs provider and relative path' },
    { watchFn: cWatchFn, relative: false, expectation: 'should watch using chokidar provider and absolute path' },
    { watchFn: cWatchFn, relative: true, expectation: 'should watch using chokidar provider and relative path' }
 ].forEach(({ watchFn, relative, expectation }) => {

    if (!FS_WATCH_SUPPORTED && watchFn === fWatchFn) {
      return; // `fs.watch` with option `recursive` only supported on MacOS and Windows!
    }

    it(expectation, (done) => {
      const treeview = new TreeView({ relative });

      let changesDone = false;

      // When tree is ready, modify the file system...
      treeview.on('ready', () => {
        move(resolve('dist/tmp/a'), resolve('dist/tmp/n'))
          .then(() => move(resolve('dist/tmp/sub/deep'), resolve('dist/tmp/sub/purple')))
          .then(() => appendFile(resolve('dist/tmp/sub/b.txt'), 'BBB', { encoding: 'utf8' }))
          .then(() => changesDone = true);
      });

      // Expected items to be emitted
      const unlink = ['a', 'deep'];
      const add = ['n', 'purple'];
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

      treeview.on('tree', (tree) => {
        // Check that the file system was modified before the tree event was emitted
        expect(changesDone).toBeTruthy();

        // Check that all events was emitted
        expect(unlink).toEqual([]);
        expect(add).toEqual([]);
        expect(change).toEqual([]);

        // Check the final state of the file system
        expect(tree).not.toContainItem({ name: 'a' });
        expect(tree).toContainItem({ name: 'n' });

        const sub = tree.find(item => item.name === 'sub') as Model.IDir;
        expect(sub.nodes).toContainItem({ name: 'b.txt', size: 6 });
        expect(sub.nodes).not.toContainItem({ name: 'deep' });
        expect(sub.nodes).toContainItem({ name: 'purple' });

        const purple = sub.nodes.find(item => item.name === 'purple') as Model.IDir;
        expect(purple.nodes).toContainItem({ name: 'c.png' });

        // Check items order
        expect(tree[0].name).toBe('n');
        expect(tree[1].name).toBe('sub');

        // Stop watching
        watcher.close();
        done();
      });

      // Start watching...
      const watcher = treeview.watch('dist/tmp', watchFn);
    });
  });
});
