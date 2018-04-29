// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { customMatchers } from './matchers/matchers';

import * as Model from '../src/model';
import { TreeView } from '../src/index';
import { watch } from '../src/helper';

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

const endpointsBefore = {
  '/root/test': { type: 'dir', nodes: ['ok', 'a1', 'b1'] },
  '/root/test/ok': { type: 'file', content: 'ok', size: 2 },
  '/root/test/a1': { type: 'file', content: 'aaa', size: 3 },
  '/root/test/b1': { type: 'dir', nodes: ['c1'] },
  '/root/test/b1/c1': { type: 'file', content: 'ccc', size: 3 },
};

const endpointsAfter = {
  '/root/test': { type: 'dir', nodes: ['ok', 'a2', 'b2'] },
  '/root/test/ok': { type: 'file', content: 'okok', size: 4 },
  '/root/test/a2': { type: 'file', content: 'aaaa', size: 4 },
  '/root/test/b2': { type: 'dir', nodes: ['c2', 'd2', , 'e2'] },
  '/root/test/b2/c2': { type: 'file', content: 'cccc', size: 4 },
  '/root/test/b2/d2': { type: 'dir', nodes: ['sub'] },
  '/root/test/b2/d2/sub': { type: 'dir', nodes: [] },
  '/root/test/b2/e2': { type: 'dir', nodes: ['sub'] },
  '/root/test/b2/e2/sub': { type: 'dir', nodes: ['file'] },
  '/root/test/b2/e2/sub/file': { type: 'file', content: 'file', size: 4 }
};

describe('TreeView refreshResult mock', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should refresh with absolute', (done) => {
    const treeview = new TreeViewMock({ relative: false, content: true });
    treeview.endpoints = endpointsBefore;

    treeview.process('./test').then((tree) => {

      // Check initial state
      expect(tree).toContainItem({ path: '/root/test', name: 'ok', type: 'file' , content: 'ok', size: 2 });
      expect(tree).toContainItem({ path: '/root/test', name: 'a1', type: 'file' });
      expect(tree).toContainItem({ path: '/root/test', name: 'b1', type: 'dir' });
      const sub = tree.filter(item => item.name === 'b1')[0] as Model.IDir;
      expect(sub.nodes).toContainItem({ path: '/root/test/b1', name: 'c1', type: 'file', content: 'ccc', size: 3 });

      // Simulate that the filesystem has changed...
      treeview.endpoints = endpointsAfter;

      treeview.refreshResult(['./test/ok'])
        .then(() => treeview.refreshResult(['./test/a1']))
        .then(() => treeview.refreshResult(['./test/a2']))
        .then(() => treeview.refreshResult(['./test/b1']))
        .then(() => treeview.refreshResult(['./test/b1/c1']))
        .then(() => treeview.refreshResult(['./test/b2']))
        .then(() => treeview.refreshResult(['./test/b2/c2']))
        .then(() => treeview.refreshResult(['./test/b2/d2/sub']))
        .then(() => treeview.refreshResult(['./test/e2/sub/file']))
        .then((newTree) => {

          // Check final state
          expect(newTree).toContainItem({ path: '/root/test', name: 'ok', type: 'file' , content: 'okok', size: 4 });
          expect(newTree).not.toContainItem({ path: '/root/test', name: 'a1', type: 'file' });
          expect(newTree).not.toContainItem({ path: '/root/test', name: 'b1', type: 'dir' });

          expect(newTree).toContainItem({ path: '/root/test', name: 'a2', type: 'file', content: 'aaaa', size: 4 });
          expect(newTree).toContainItem({ path: '/root/test', name: 'b2', type: 'dir' });
          const b2 = tree.filter(item => item.name === 'b2')[0] as Model.IDir;

          done();
        });

      /*treeview.refreshResult([
        './test/ok', // Modified
        './test/a1', // Removed
        './test/a2', // Added
        './test/b1', // Removed
        './test/b1/c1', // Removed
        './test/b2', // Added
        './test/b2/c2', // Added
        './test/b2/d2/sub', // Added deep dir
        './test/b2/e2/sub/file', // Added deep file
      ]).then((newTree) => {
        // console.log(pretty(newTree));
        done();
      });*/
    });
  });
});
