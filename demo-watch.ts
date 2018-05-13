import { mkdirSync } from 'fs';
import { resolve } from 'path';
import { appendFile, copy, copySync, emptyDirSync, ensureDirSync, move } from 'fs-extra';

import { TreeView } from './src/index';
import * as Model from './src/model';
import { cWatchFn, fWatchFn } from './src/watch';
import { pretty } from './src/helper';

// tslint:disable:no-console

// Prepare the filesystem
ensureDirSync('dist/tmp');
emptyDirSync('dist/tmp');
copySync(resolve('spec/fixture'), resolve('dist/tmp'));

const treeview = new TreeView();

treeview
  .on('all', (event, data) => {
    if (event === 'ready') {
      // Check the original state
      console.log('\nready!');
      console.log(pretty(data as Model.TreeNode[]));
      console.log('');

      // Modify the filesystem
      move(resolve('dist/tmp/a'), resolve('dist/tmp/z'))
        .then(() => move(resolve('dist/tmp/sub/deep'), resolve('dist/tmp/sub/purple')))
        .then(() => appendFile(resolve('dist/tmp/sub/b.txt'), 'BBB', { encoding: 'utf8' }));
    } else if (event === 'tree') {
      // Check the final state
      console.log('\ntree');
      console.log(pretty(data as Model.TreeNode[]));
      console.log('');

      // Stop watching
      watcher.close();
    } else if (event !== 'item') {
      console.log(event, (data as Model.TreeNode).pathname);
    } else {
      // console.log('\t\t', event, (data as Model.TreeNode).pathname);
    }
  });

console.log('Let\'s go!');

let watcher: any;
setTimeout(() => watcher = treeview.watch('./dist/tmp', cWatchFn), 1000);
