
import { TreeView } from './src/index';
import * as Model from './src/model';

import { pretty } from './src/helper';

// tslint:disable:no-console
const treeview = new TreeView({
  exclude: ['/Users/stephane/Workspace/node-treeview/coverage/a']
});

treeview.on('item', (item: Model.TreeNode) => {
  // console.log(item.pathname, item.error ? 'DELETE' : 'CHANGE');
});

const close = treeview.watch('./coverage');

treeview
  .on('all', (event, data) => {
    if (event === 'ready') {
      console.log(event);
    } else if (event === 'tree') {
      console.log('');
      console.log(pretty(data as Model.TreeNode[]));
      console.log('');
    } else if (event !== 'item') {
      console.log(event, (data as Model.TreeNode).pathname);
    } else {
      console.log('\t\t', event, (data as Model.TreeNode).pathname);
    }
  })
  /*.on('ready', (tree: Model.TreeNode[]) => {
    console.log(pretty(tree));
    console.log('');
  })
  .on('tree', (tree: Model.TreeNode[]) => {
    console.log('');
    console.log(pretty(tree));
    console.log('');
  })*/
  ;

// setTimeout(close, 10000);
