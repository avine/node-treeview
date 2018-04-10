// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import * as Model from '../src/model';
import { TreeView } from '../src/index';
import { clean, flatten, pretty } from '../src/helper';
import { isBinaryPath } from '../src/helper/binary';

import { providers } from './mock/mock.api';

import { customMatchers } from './matchers/matchers';

class TreeViewMock extends TreeView {
  inject() {
    this.providers = providers;
  }
}

// tslint:disable-next-line:no-console
// const log = (data: any) => console.log(JSON.stringify(data, undefined, 2));

describe('TreeView helper', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should flatten tree', (done) => {
    new TreeViewMock().process('./deep-dirs').then((tree) => {
      const flat = flatten(tree);

      // Check that `flat` is flatten and ordered
      expect([flat[0]]).toContainItem({ type: 'file', name: 'a', path: '/root/deep-dirs' });
      expect([flat[1]]).toContainItem({ type: 'file', name: 'b', path: '/root/deep-dirs/folder' });
      expect([flat[2]]).toContainItem({ type: 'file', name: 'c', path: '/root/deep-dirs/folder/folder' });
      expect([flat[3]]).toContainItem({ type: 'file', name: 'd', path: '/root/deep-dirs/folder/folder' });

      done();
    });
  });

  it('should clean tree', (done) => {
    Promise.all([
      new TreeViewMock().process('./clean').then((tree) => {
        expect(tree).toContainItem({ type: 'file', path: '/root/clean', name: 'a', pathname: '/root/clean/a' });
        expect(tree).toContainItem({ type: 'dir', path: '/root/clean', name: 'b', pathname: '/root/clean/b' });
        expect(tree).toContainItem({ type: 'dir', path: '/root/clean', name: 'c', pathname: '/root/clean/c' });
        expect(tree).toContainItem({ type: 'dir', path: '/root/clean', name: 'd', pathname: '/root/clean/d' });

        const sub = tree.filter(r => r.name === 'd')[0] as Model.IDir;
        expect(sub.nodes).toContainItem({
          type: 'file', path: '/root/clean/d', name: 'f', pathname: '/root/clean/d/f'
        });
      }),

      new TreeViewMock().process('./clean').then((tree) => {
        const cleaned = clean(tree);

        expect(cleaned).toContainItem({ type: 'file', path: '/root/clean', name: 'a', pathname: '/root/clean/a' });
        expect(cleaned).not.toContainItem({ type: 'dir', path: '/root/clean', name: 'b', pathname: '/root/clean/b' });
        expect(cleaned).not.toContainItem({ type: 'dir', path: '/root/clean', name: 'c', pathname: '/root/clean/c' });
        expect(cleaned).toContainItem({ type: 'dir', path: '/root/clean', name: 'd', pathname: '/root/clean/d' });

        const sub = cleaned.filter(r => r.name === 'd')[0] as Model.IDir;
        expect(sub.nodes).toContainItem({
          type: 'file', path: '/root/clean/d', name: 'f', pathname: '/root/clean/d/f'
        });
      })
    ]).then(done);
  });

  it('should pretty tree', (done) => {
    new TreeViewMock().process('./deep-dirs').then((tree) => {
      const print = pretty(tree);
      const txt = `
├─ a
└─ folder
   ├─ b
   └─ folder
      ├─ c
      └─ d
`;

      expect(print).toBe(txt.trim());
      done();
    });
  });

  it('should check binary extensions', () => {
    expect(isBinaryPath('azerty')).toBeFalsy();
    expect(isBinaryPath('.azerty')).toBeFalsy();
    expect(isBinaryPath('azerty.txt')).toBeFalsy();

    expect(isBinaryPath('azerty.doc')).toBeTruthy();
    expect(isBinaryPath('azerty.pdf')).toBeTruthy();
    expect(isBinaryPath('azerty.png')).toBeTruthy();
  });
});
