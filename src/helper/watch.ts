// tslint:disable:no-console

import { watch as fsWatch } from 'fs';

import { join, resolve } from 'path';

import * as Model from '../model';
import { TreeView } from '../index';

// import { pretty } from './pretty';

const debounceTime = 50; // ms

export function watch(
  rootPath: string,
  opts: Model.IOptsParam = {},
  callback: (tree: Model.TreeNode[]) => void
) {
  const treeview = new TreeView(opts);
  treeview.process(rootPath).then((tree) => {
    let timeout: NodeJS.Timer | null = null;
    let paths: string[] = [];
    fsWatch(resolve(rootPath), { recursive: true }, (eventType, filename) => {
      // console.log(eventType, filename);
      paths.push(resolve(join(rootPath, filename)));
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        timeout = null;
        treeview.refreshResult(paths).then(callback);
        paths = [];
      }, debounceTime);
    });
  });
}

// watch('./coverage', {}, tree => console.log(pretty(tree)));
