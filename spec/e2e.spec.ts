// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { customMatchers } from './matchers/matchers';

import { resolve } from 'path';
import { appendFile, copy, move, remove } from 'fs-extra';

import { TreeView } from '../src/index';
import * as Model from '../src/model';

import { cWatchFn, fWatchFn, DEF_WATCH_MODULE } from '../src/watch';

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

    // Copy fixture to temporary directory
    doAndWait(() => copy(basePath, resolve('dist/tmp'))).then(done);
  });

  afterEach((done) => {
    // Delete temporary directory
    doAndWait(() => remove(resolve('dist/tmp'))).then(done);
  });

  if (DEF_WATCH_MODULE === 'fs') {
    it('should watch provided by fs with absolute path', (done) => {
      const treeview = new TreeView(/*{ relative: false }*/);

      let changesDone = false;

      // When tree is ready, modify the file system...
      treeview.on('ready', () => {
        doAndWait(() => move(resolve('dist/tmp/a'), resolve('dist/tmp/z')))
          .then(() => doAndWait(() => move(resolve('dist/tmp/sub/deep'), resolve('dist/tmp/sub/purple'))))
          .then(() => doAndWait(() => appendFile(resolve('dist/tmp/sub/b.txt'), 'BBB', { encoding: 'utf8' })))
          .then(() => changesDone = true);
      });

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

        // Stop watching
        watcher.close();
        done();
      });

      // Start watching...
      const watcher = treeview.watch('dist/tmp'/*, fWatchFn*/);
    });

    it('should watch provided by fs with relative path', (done) => {
      const treeview = new TreeView({ relative: true });

      let changesDone = false;

      // When tree is ready, modify the file system...
      treeview.on('ready', () => {
        doAndWait(() => move(resolve('dist/tmp/a'), resolve('dist/tmp/z')))
          .then(() => doAndWait(() => move(resolve('dist/tmp/sub/deep'), resolve('dist/tmp/sub/purple'))))
          .then(() => doAndWait(() => appendFile(resolve('dist/tmp/sub/b.txt'), 'BBB', { encoding: 'utf8' })))
          .then(() => changesDone = true);
      });

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

        // Stop watching
        watcher.close();
        done();
      });

      // Start watching...
      const watcher = treeview.watch('dist/tmp'/*, fWatchFn*/);
    });
  }

  it('should watch provided by chokidar with absolute path', (done) => {
    const treeview = new TreeView(/*{ relative: false }*/);

    let changesDone = false;

    // When tree is ready, modify the file system...
    treeview.on('ready', () => {
      doAndWait(() => move(resolve('dist/tmp/a'), resolve('dist/tmp/z')))
        .then(() => doAndWait(() => move(resolve('dist/tmp/sub/deep'), resolve('dist/tmp/sub/purple'))))
        .then(() => doAndWait(() => appendFile(resolve('dist/tmp/sub/b.txt'), 'BBB', { encoding: 'utf8' })))
        .then(() => changesDone = true);
    });

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

      // Stop watching
      watcher.close();
      done();
    });

    // Start watching...
    const watcher = treeview.watch('dist/tmp', cWatchFn);
  });

  it('should watch provided by chokidar with relative path', (done) => {
    const treeview = new TreeView({ relative: true });

    let changesDone = false;

    // When tree is ready, modify the file system...
    treeview.on('ready', () => {
      doAndWait(() => move(resolve('dist/tmp/a'), resolve('dist/tmp/z')))
        .then(() => doAndWait(() => move(resolve('dist/tmp/sub/deep'), resolve('dist/tmp/sub/purple'))))
        .then(() => doAndWait(() => appendFile(resolve('dist/tmp/sub/b.txt'), 'BBB', { encoding: 'utf8' })))
        .then(() => changesDone = true);
    });

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

      // Stop watching
      watcher.close();
      done();
    });

    // Start watching...
    const watcher = treeview.watch('dist/tmp', cWatchFn);
  });
});

function doAndWait(action: () => Promise<void>, delay = 0) {
  return new Promise<void>(done => action().then(() => {
    setTimeout(done, delay);
  }));
}
