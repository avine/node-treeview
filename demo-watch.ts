
import { TreeView } from './src/index';
import * as Model from './src/model';

import { pretty } from './src/helper';

// tslint:disable:no-console

const treeview = new TreeView();

treeview
  .on('all', (event, data) => {
    if (event === 'ready') {
      console.log(event);
    } else if (event === 'tree') {
      // console.log('');
      // console.log(pretty(data as Model.TreeNode[]));
      // console.log('');
    } else if (event !== 'item') {
      console.log(event, (data as Model.TreeNode).pathname);
    } else {
      // console.log('\t\t', event, (data as Model.TreeNode).pathname);
    }
  });

const watcher = treeview.watch('./dist');

setTimeout(watcher.close, 20000);
