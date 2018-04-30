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

// Legend
// ------
//   kf : keep file
//   mf : modified file
//   df : delete file
//   kd : keep dir
//   dd : delete dir
//   af : added file
//   ad : added dir

const endpointsBefore = {
  '/root/test': { type: 'dir', nodes: ['kf1', 'mf1', 'df1', 'kd1', 'dd1'] },
  '/root/test/kf1': { type: 'file', content: 'keep', size: 4 },
  '/root/test/mf1': { type: 'file', content: 'modify', size: 6 },
  '/root/test/df1': { type: 'file', content: 'delete', size: 6 },
  '/root/test/kd1': { type: 'dir', nodes: ['kf2', 'mf2', 'df2', 'kd2', 'dd2'] },
  '/root/test/kd1/kf2': { type: 'file', content: 'keep', size: 4 },
  '/root/test/kd1/mf2': { type: 'file', content: 'modify', size: 6 },
  '/root/test/kd1/df2': { type: 'file', content: 'delete', size: 6 },
  '/root/test/kd1/kd2': { type: 'dir', nodes: [] },
  '/root/test/kd1/dd2': { type: 'dir', nodes: [] },
  '/root/test/dd1': { type: 'dir', nodes: ['df3', 'dd3'] },
  '/root/test/dd1/df3': { type: 'file', content: 'delete', size: 6 },
  '/root/test/dd1/dd3': { type: 'dir', nodes: [] }
};

const endpointsAfter = {
  '/root/test': { type: 'dir', nodes: ['kf1', 'mf1', 'af1', 'kd1', 'ad1'] },
  '/root/test/kf1': { type: 'file', content: 'keep', size: 4 },
  '/root/test/mf1': { type: 'file', content: 'modified', size: 8 },
  '/root/test/af1': { type: 'file', content: 'added', size: 5 },
  '/root/test/kd1': { type: 'dir', nodes: ['kf2', 'mf2', 'af2', 'kd2', 'ad2'] },
  '/root/test/kd1/kf2': { type: 'file', content: 'keep', size: 4 },
  '/root/test/kd1/mf2': { type: 'file', content: 'modified', size: 8 },
  '/root/test/kd1/af2': { type: 'file', content: 'added', size: 5 },
  '/root/test/kd1/kd2': { type: 'dir', nodes: [] },
  '/root/test/kd1/ad2': { type: 'dir', nodes: [] },
  '/root/test/ad1': { type: 'dir', nodes: ['af3', 'ad3'] },
  '/root/test/ad1/af3': { type: 'file', content: 'added', size: 5 },
  '/root/test/ad1/ad3': { type: 'dir', nodes: [] }
};

describe('TreeView refreshResult mock', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should refresh result sequentially with absolute path', (done) => {
    const treeview = new TreeViewMock({ relative: false, content: true });
    treeview.endpoints = endpointsBefore;

    treeview.process('./test').then((tree) => {
      // Check initial state
      expect(tree).toContainItem({ path: '/root/test', name: 'kf1', type: 'file', content: 'keep', size: 4 });
      expect(tree).toContainItem({ path: '/root/test', name: 'mf1', type: 'file', content: 'modify', size: 6 });
      expect(tree).toContainItem({ path: '/root/test', name: 'df1', type: 'file', content: 'delete', size: 6 });
      expect(tree).toContainItem({ path: '/root/test', name: 'kd1', type: 'dir' });
      expect(tree).toContainItem({ path: '/root/test', name: 'dd1', type: 'dir' });

      const kd1 = (tree.find(item => item.name === 'kd1') as Model.IDir).nodes;
      expect(kd1).toContainItem({ path: '/root/test/kd1', name: 'kf2', type: 'file', content: 'keep', size: 4 });
      expect(kd1).toContainItem({ path: '/root/test/kd1', name: 'mf2', type: 'file', content: 'modify', size: 6 });
      expect(kd1).toContainItem({ path: '/root/test/kd1', name: 'df2', type: 'file', content: 'delete', size: 6 });
      expect(kd1).toContainItem({ path: '/root/test/kd1', name: 'kd2', type: 'dir' });
      expect(kd1).toContainItem({ path: '/root/test/kd1', name: 'dd2', type: 'dir' });

      const dd1 = (tree.find(item => item.name === 'dd1') as Model.IDir).nodes;
      expect(dd1).toContainItem({ path: '/root/test/dd1', name: 'df3', type: 'file', content: 'delete', size: 6 });
      expect(dd1).toContainItem({ path: '/root/test/dd1', name: 'dd3', type: 'dir' });

      // Simulate that the filesystem has changed...
      treeview.endpoints = endpointsAfter;

      // Refresh result from "deep" to "root" paths
      treeview.refreshResult('/root/test/ad1/ad3')
        .then(() => treeview.refreshResult('/root/test/ad1/af3'))
        .then(() => treeview.refreshResult('/root/test/ad1'))
        .then(() => treeview.refreshResult('/root/test/dd1/dd3'))
        .then(() => treeview.refreshResult('/root/test/dd1/df3'))
        .then(() => treeview.refreshResult('/root/test/dd1'))
        .then(() => treeview.refreshResult('/root/test/kd1/ad2'))
        .then(() => treeview.refreshResult('/root/test/kd1/af2'))
        .then(() => treeview.refreshResult('/root/test/kd1/dd2'))
        .then(() => treeview.refreshResult('/root/test/kd1/kd2'))
        .then(() => treeview.refreshResult('/root/test/kd1/df2'))
        .then(() => treeview.refreshResult('/root/test/kd1/mf2'))
        .then(() => treeview.refreshResult('/root/test/kd1/kf2'))
        .then(() => treeview.refreshResult('/root/test/af1'))
        .then(() => treeview.refreshResult('/root/test/kd1'))
        .then(() => treeview.refreshResult('/root/test/df1'))
        .then(() => treeview.refreshResult('/root/test/mf1'))
        .then(() => treeview.refreshResult('/root/test/kf1'))

        .then((newTree) => {
          expect(newTree).toBe(tree);

          // Check final state
          expect(tree).toContainItem({ path: '/root/test', name: 'kf1', type: 'file', content: 'keep', size: 4 });
          expect(tree).toContainItem({ path: '/root/test', name: 'mf1', type: 'file', content: 'modified', size: 8 });
          expect(tree).toContainItem({ path: '/root/test', name: 'af1', type: 'file', content: 'added', size: 5 });
          expect(tree).toContainItem({ path: '/root/test', name: 'kd1', type: 'dir' });
          expect(tree).toContainItem({ path: '/root/test', name: 'ad1', type: 'dir' });

          expect(tree).not.toContainItem({ path: '/root/test', name: 'df1' });
          expect(tree).not.toContainItem({ path: '/root/test', name: 'dd1' });

          const kd1N = (tree.find(item => item.name === 'kd1') as Model.IDir).nodes; // "N" suffix means "New"
          expect(kd1N).toContainItem({ path: '/root/test/kd1', name: 'kf2', type: 'file', content: 'keep', size: 4 });
          // tslint:disable-next-line:max-line-length
          expect(kd1N).toContainItem({ path: '/root/test/kd1', name: 'mf2', type: 'file', content: 'modified', size: 8 });
          expect(kd1N).toContainItem({ path: '/root/test/kd1', name: 'af2', type: 'file', content: 'added', size: 5 });
          expect(kd1N).toContainItem({ path: '/root/test/kd1', name: 'kd2', type: 'dir' });
          expect(kd1N).toContainItem({ path: '/root/test/kd1', name: 'ad2', type: 'dir' });

          expect(kd1N).not.toContainItem({ path: '/root/test/kd1', name: 'df2' });
          expect(kd1N).not.toContainItem({ path: '/root/test/kd1', name: 'dd2' });

          const ad1N = (tree.find(item => item.name === 'ad1') as Model.IDir).nodes;
          expect(ad1N).toContainItem({ path: '/root/test/ad1', name: 'af3', type: 'file', content: 'added', size: 5 });
          expect(ad1N).toContainItem({ path: '/root/test/ad1', name: 'ad3', type: 'dir' });

          done();
        });
    });
  });

  it('should refresh result globally with absolute path', (done) => {
    const treeview = new TreeViewMock({ relative: false, content: true });
    treeview.endpoints = endpointsBefore;

    treeview.process('./test').then((tree) => {
      // Check initial state
      expect(tree).toContainItem({ path: '/root/test', name: 'kf1', type: 'file', content: 'keep', size: 4 });
      expect(tree).toContainItem({ path: '/root/test', name: 'mf1', type: 'file', content: 'modify', size: 6 });
      expect(tree).toContainItem({ path: '/root/test', name: 'df1', type: 'file', content: 'delete', size: 6 });
      expect(tree).toContainItem({ path: '/root/test', name: 'kd1', type: 'dir' });
      expect(tree).toContainItem({ path: '/root/test', name: 'dd1', type: 'dir' });

      const kd1 = (tree.find(item => item.name === 'kd1') as Model.IDir).nodes;
      expect(kd1).toContainItem({ path: '/root/test/kd1', name: 'kf2', type: 'file', content: 'keep', size: 4 });
      expect(kd1).toContainItem({ path: '/root/test/kd1', name: 'mf2', type: 'file', content: 'modify', size: 6 });
      expect(kd1).toContainItem({ path: '/root/test/kd1', name: 'df2', type: 'file', content: 'delete', size: 6 });
      expect(kd1).toContainItem({ path: '/root/test/kd1', name: 'kd2', type: 'dir' });
      expect(kd1).toContainItem({ path: '/root/test/kd1', name: 'dd2', type: 'dir' });

      const dd1 = (tree.find(item => item.name === 'dd1') as Model.IDir).nodes;
      expect(dd1).toContainItem({ path: '/root/test/dd1', name: 'df3', type: 'file', content: 'delete', size: 6 });
      expect(dd1).toContainItem({ path: '/root/test/dd1', name: 'dd3', type: 'dir' });

      // Simulate that the filesystem has changed...
      treeview.endpoints = endpointsAfter;

      treeview.refreshResult([
        '/root/test/kf1',
        '/root/test/mf1',
        '/root/test/df1',
        '/root/test/kd1',
        '/root/test/af1',
        '/root/test/kd1/kf2',
        '/root/test/kd1/mf2',
        '/root/test/kd1/df2',
        '/root/test/kd1/kd2',
        '/root/test/kd1/dd2',
        '/root/test/kd1/af2',
        '/root/test/kd1/ad2',
        '/root/test/dd1',
        '/root/test/dd1/df3',
        '/root/test/dd1/dd3',
        '/root/test/ad1',
        '/root/test/ad1/af3',
        '/root/test/ad1/ad3'
      ]).then((newTree) => {
        expect(newTree).toBe(tree);

        // Check final state
        expect(tree).toContainItem({ path: '/root/test', name: 'kf1', type: 'file', content: 'keep', size: 4 });
        expect(tree).toContainItem({ path: '/root/test', name: 'mf1', type: 'file', content: 'modified', size: 8 });
        expect(tree).toContainItem({ path: '/root/test', name: 'af1', type: 'file', content: 'added', size: 5 });
        expect(tree).toContainItem({ path: '/root/test', name: 'kd1', type: 'dir' });
        expect(tree).toContainItem({ path: '/root/test', name: 'ad1', type: 'dir' });

        expect(tree).not.toContainItem({ path: '/root/test', name: 'df1' });
        expect(tree).not.toContainItem({ path: '/root/test', name: 'dd1' });

        const kd1N = (tree.find(item => item.name === 'kd1') as Model.IDir).nodes; // "N" suffix means "New"
        expect(kd1N).toContainItem({ path: '/root/test/kd1', name: 'kf2', type: 'file', content: 'keep', size: 4 });
        expect(kd1N).toContainItem({ path: '/root/test/kd1', name: 'mf2', type: 'file', content: 'modified', size: 8 });
        expect(kd1N).toContainItem({ path: '/root/test/kd1', name: 'af2', type: 'file', content: 'added', size: 5 });
        expect(kd1N).toContainItem({ path: '/root/test/kd1', name: 'kd2', type: 'dir' });
        expect(kd1N).toContainItem({ path: '/root/test/kd1', name: 'ad2', type: 'dir' });

        expect(kd1N).not.toContainItem({ path: '/root/test/kd1', name: 'df2' });
        expect(kd1N).not.toContainItem({ path: '/root/test/kd1', name: 'dd2' });

        const ad1N = (tree.find(item => item.name === 'ad1') as Model.IDir).nodes;
        expect(ad1N).toContainItem({ path: '/root/test/ad1', name: 'af3', type: 'file', content: 'added', size: 5 });
        expect(ad1N).toContainItem({ path: '/root/test/ad1', name: 'ad3', type: 'dir' });

        done();
      });
    });
  });

  it('should refresh result globally with relative path', (done) => {
    const treeview = new TreeViewMock({ relative: true, content: true });
    treeview.endpoints = endpointsBefore;

    treeview.process('./test').then((tree) => {
      // Check initial state
      expect(tree).toContainItem({ path: '', name: 'kf1', type: 'file', content: 'keep', size: 4 });
      expect(tree).toContainItem({ path: '', name: 'mf1', type: 'file', content: 'modify', size: 6 });
      expect(tree).toContainItem({ path: '', name: 'df1', type: 'file', content: 'delete', size: 6 });
      expect(tree).toContainItem({ path: '', name: 'kd1', type: 'dir' });
      expect(tree).toContainItem({ path: '', name: 'dd1', type: 'dir' });

      const kd1 = (tree.find(item => item.name === 'kd1') as Model.IDir).nodes;
      expect(kd1).toContainItem({ path: 'kd1', name: 'kf2', type: 'file', content: 'keep', size: 4 });
      expect(kd1).toContainItem({ path: 'kd1', name: 'mf2', type: 'file', content: 'modify', size: 6 });
      expect(kd1).toContainItem({ path: 'kd1', name: 'df2', type: 'file', content: 'delete', size: 6 });
      expect(kd1).toContainItem({ path: 'kd1', name: 'kd2', type: 'dir' });
      expect(kd1).toContainItem({ path: 'kd1', name: 'dd2', type: 'dir' });

      const dd1 = (tree.find(item => item.name === 'dd1') as Model.IDir).nodes;
      expect(dd1).toContainItem({ path: 'dd1', name: 'df3', type: 'file', content: 'delete', size: 6 });
      expect(dd1).toContainItem({ path: 'dd1', name: 'dd3', type: 'dir' });

      // Simulate that the filesystem has changed...
      treeview.endpoints = endpointsAfter;

      treeview.refreshResult([
        '/root/test/kf1',
        '/root/test/mf1',
        '/root/test/df1',
        '/root/test/kd1',
        '/root/test/af1',
        '/root/test/kd1/kf2',
        '/root/test/kd1/mf2',
        '/root/test/kd1/df2',
        '/root/test/kd1/kd2',
        '/root/test/kd1/dd2',
        '/root/test/kd1/af2',
        '/root/test/kd1/ad2',
        '/root/test/dd1',
        '/root/test/dd1/df3',
        '/root/test/dd1/dd3',
        '/root/test/ad1',
        '/root/test/ad1/af3',
        '/root/test/ad1/ad3'
      ]).then((newTree) => {
        expect(newTree).toBe(tree);

        // Check final state
        expect(tree).toContainItem({ path: '', name: 'kf1', type: 'file', content: 'keep', size: 4 });
        expect(tree).toContainItem({ path: '', name: 'mf1', type: 'file', content: 'modified', size: 8 });
        expect(tree).toContainItem({ path: '', name: 'af1', type: 'file', content: 'added', size: 5 });
        expect(tree).toContainItem({ path: '', name: 'kd1', type: 'dir' });
        expect(tree).toContainItem({ path: '', name: 'ad1', type: 'dir' });

        expect(tree).not.toContainItem({ path: '', name: 'df1' });
        expect(tree).not.toContainItem({ path: '', name: 'dd1' });

        const kd1N = (tree.find(item => item.name === 'kd1') as Model.IDir).nodes; // "N" suffix means "New"
        expect(kd1N).toContainItem({ path: 'kd1', name: 'kf2', type: 'file', content: 'keep', size: 4 });
        expect(kd1N).toContainItem({ path: 'kd1', name: 'mf2', type: 'file', content: 'modified', size: 8 });
        expect(kd1N).toContainItem({ path: 'kd1', name: 'af2', type: 'file', content: 'added', size: 5 });
        expect(kd1N).toContainItem({ path: 'kd1', name: 'kd2', type: 'dir' });
        expect(kd1N).toContainItem({ path: 'kd1', name: 'ad2', type: 'dir' });

        expect(kd1N).not.toContainItem({ path: 'kd1', name: 'df2' });
        expect(kd1N).not.toContainItem({ path: 'kd1', name: 'dd2' });

        const ad1N = (tree.find(item => item.name === 'ad1') as Model.IDir).nodes;
        expect(ad1N).toContainItem({ path: 'ad1', name: 'af3', type: 'file', content: 'added', size: 5 });
        expect(ad1N).toContainItem({ path: 'ad1', name: 'ad3', type: 'dir' });

        done();
      });
    });
  });
});
