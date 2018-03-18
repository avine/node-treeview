// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import * as Model from '../src/model';
import { TreeView } from '../src/index';
import { flatten } from '../src/helper/flatten';
import { clean } from '../src/helper/clean';
import { isBinaryPath } from '../src/helper/binary';

import { providers } from './mock/mock-api';

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
    new TreeViewMock().process('deep-dirs').then((tree) => {
      const flat = flatten(tree);

      // Check that `flat` is flatten and ordered
      expect([flat[0]]).toContainItem({ type: 'file', name: 'a', path: 'deep-dirs' });
      expect([flat[1]]).toContainItem({ type: 'file', name: 'b', path: 'deep-dirs/folder' });
      expect([flat[2]]).toContainItem({ type: 'file', name: 'c', path: 'deep-dirs/folder/folder' });
      expect([flat[3]]).toContainItem({ type: 'file', name: 'd', path: 'deep-dirs/folder/folder' });

      done();
    });
  });

  it('should clean tree', (done) => {
    Promise.all([
      new TreeViewMock().process('clean').then((tree) => {
        expect(tree).toContainItem({ type: 'file', path: 'clean', name: 'a', pathname: 'clean/a' });
        expect(tree).toContainItem({ type: 'dir', path: 'clean', name: 'b', pathname: 'clean/b' });
        expect(tree).toContainItem({ type: 'dir', path: 'clean', name: 'c', pathname: 'clean/c' });
        expect(tree).toContainItem({ type: 'dir', path: 'clean', name: 'd', pathname: 'clean/d' });

        const subDir = tree.filter(r => r.name === 'd')[0] as Model.IDir;
        expect(subDir.content).toContainItem({ type: 'file', path: 'clean/d', name: 'f', pathname: 'clean/d/f' });
      }),

      new TreeViewMock().process('clean').then((tree) => {
        const cleaned = clean(tree);

        expect(cleaned).toContainItem({ type: 'file', path: 'clean', name: 'a', pathname: 'clean/a' });
        expect(cleaned).not.toContainItem({ type: 'dir', path: 'clean', name: 'b', pathname: 'clean/b' });
        expect(cleaned).not.toContainItem({ type: 'dir', path: 'clean', name: 'c', pathname: 'clean/c' });
        expect(cleaned).toContainItem({ type: 'dir', path: 'clean', name: 'd', pathname: 'clean/d' });

        const subDir = cleaned.filter(r => r.name === 'd')[0] as Model.IDir;
        expect(subDir.content).toContainItem({ type: 'file', path: 'clean/d', name: 'f', pathname: 'clean/d/f' });
      })
    ]).then(done);
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
