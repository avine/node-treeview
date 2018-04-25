// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { customMatchers } from './matchers/matchers';

import * as Model from '../src/model';
import { TreeView } from '../src/index';
import { pretty, watch } from '../src/helper';

import { providersFactory, IEndpoints } from './mock/mock.api';

class TreeViewMock extends TreeView {
  set endpoints(data: IEndpoints) {
    this.providers = providersFactory(data);
  }

  inject() {
    this.endpoints = {};
  }
}

// tslint:disable-next-line:no-console
// const log = (data: any) => console.log(JSON.stringify(data, undefined, 2));

describe('TreeView helper', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should refresh with absolute', (done) => {
    const treeview = new TreeViewMock({ relative: false, sort: 1 });
    treeview.endpoints = {
      '/root/test': { type: 'dir', nodes: ['ok', 'a1', 'b1'] },
      '/root/test/ok': { type: 'file', content: 'ok', size: 2 },
      '/root/test/a1': { type: 'file', content: 'aaa', size: 3 },
      '/root/test/b1': { type: 'dir', nodes: ['c1'] },
      '/root/test/b1/c1': { type: 'file', content: 'ccc', size: 3 },
    };

    treeview.process('./test').then((tree) => {
      // console.log(pretty(tree));

      treeview.endpoints = {
        '/root/test': { type: 'dir', nodes: ['ok', 'a2', 'b2'] },
        '/root/test/ok': { type: 'file', content: 'okok', size: 4 },
        '/root/test/a2': { type: 'file', content: 'aaaa', size: 4 },
        '/root/test/b2': { type: 'dir', nodes: ['c2', 'folder1', , 'folder2'] },
        '/root/test/b2/c2': { type: 'file', content: 'cccc', size: 4 },
        '/root/test/b2/folder1': { type: 'dir', nodes: ['sub'] },
        '/root/test/b2/folder1/sub': { type: 'dir', nodes: [] },
        '/root/test/b2/folder2': { type: 'dir', nodes: ['sub'] },
        '/root/test/b2/folder2/sub': { type: 'dir', nodes: ['file'] },
        '/root/test/b2/folder2/sub/file': { type: 'file', content: 'file', size: 4 }
      };

      treeview.refresh(['./test/ok'])
        .then(() => treeview.refresh(['./test/a1']))
        .then(() => treeview.refresh(['./test/a2']))
        .then(() => treeview.refresh(['./test/b1']))
        .then(() => treeview.refresh(['./test/b1/c1']))
        .then(() => treeview.refresh(['./test/b2']))
        .then(() => treeview.refresh(['./test/b2/c2']))
        .then(() => treeview.refresh(['./test/b2/folder1/sub']))
        .then(() => treeview.refresh(['./test/folder2/sub/file']))
        .then(() => {
          // console.log(pretty(treeview.lastResult.tree));
          done();
        });

      /*treeview.refresh([
        './test/ok', // Modified
        './test/a1', // Removed
        './test/a2', // Added
        './test/b1', // Removed
        './test/b1/c1', // Removed
        './test/b2', // Added
        './test/b2/c2', // Added
        './test/b2/folder1/sub', // Added deep dir
        './test/b2/folder2/sub/file', // Added deep file
      ]).then(() => {
        log(treeview.lastResult.tree);
        done();
      });*/
    });
  });
});
