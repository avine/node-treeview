// tslint:disable:no-console

import { watch as cWatch } from 'chokidar';

import * as Model from '../model';
import { TreeView } from '../index';

export function watch(rootPath: string, opts: Model.IOptsParam = {}) {
  const treeview = new TreeView(opts);
  treeview.process(rootPath).then((tree) => {

    console.log(JSON.stringify(tree, undefined, 2));

    cWatch(rootPath, { persistent: true, ignoreInitial: true }).on('all', (event, path) => {
      treeview.refresh(path).then(() => {

        console.log(JSON.stringify(tree, undefined, 2));
      });
    });
  });
}
