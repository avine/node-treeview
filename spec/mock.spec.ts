// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { TreeView } from '../src/index';
import * as Model from '../src/model';

import { providers } from './mock/mock-api';
import { DATE } from './mock/mock-endpoints';

import { customMatchers } from './matchers/matchers';

class TreeViewMock extends TreeView {
  inject() {
    this.providers = providers;
  }
}

// tslint:disable-next-line:no-console
const log = (data: any) => console.log(JSON.stringify(data, undefined, 2));

describe('TreeView', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should handle bad path', (done) => {
    new TreeViewMock().process('oups').catch((error) => {
      expect(error instanceof Error).toBeTruthy();
      done();
    });
  });

  it('should handle empty directory', (done) => {
    new TreeViewMock().process('empty-dir').then((result) => {
      expect(result.length).toEqual(0);
      done();
    });
  });

  it('should find files', (done) => {
    new TreeViewMock().process('files').then((result) => {
      expect(result.length).toEqual(2);

      expect(result).toContainItem({
        path: 'files', type: 'file', name: 'a', content: 'aaa', size: 3, created: DATE.CREATED, modified: DATE.MODIFIED
      });
      expect(result).toContainItem({
        path: 'files', type: 'file', name: 'b', content: 'bbbb', size: 4, created: DATE.CREATED, modified: DATE.MODIFIED
      });
      done();
    });
  });

  it('should skip hidden files', (done) => {
    new TreeViewMock().process('skip-hidden').then((result) => {
      expect(result.length).toEqual(1);

      expect(result).not.toContainItem({ type: 'file', name: '.hidden' });
      expect(result).toContainItem({ type: 'file', name: 'visible' });
      done();
    });
  });

  it('should find directories', (done) => {
    new TreeViewMock().process('dirs').then((result) => {
      expect(result.length).toEqual(2);

      expect(result).toContainItem({
        path: 'dirs', type: 'dir', name: 'a', content: [], created: DATE.CREATED, modified: DATE.MODIFIED
      });
      expect(result).toContainItem({
        path: 'dirs', type: 'dir', name: 'b', content: [], created: DATE.CREATED, modified: DATE.MODIFIED
      });
      done();
    });
  });

  it('should find sub-directory', (done) => {
    new TreeViewMock().process('sub-dirs').then((result) => {
      expect(result).toContainItem({ path: 'sub-dirs', type: 'file', name: 'a' });
      expect(result).toContainItem({ path: 'sub-dirs', type: 'dir', name: 'b' });

      const filtered = result.filter(r => r.name === 'b');
      const subDir = filtered[0] as Model.IDir;
      expect(subDir.content).toContainItem({ path: 'sub-dirs/b', type: 'file', name: 'c', content: 'ccc' });
      expect(subDir.content).toContainItem({ path: 'sub-dirs/b', type: 'file', name: 'd', content: 'ddd' });

      done();
    });
  });

  it('should handle sub-directory not-found', (done) => {
    new TreeViewMock().process('sub-dir-not-found').then((result) => {
      expect(result.length).toEqual(1);
      expect(result).toContainItem({ path: 'sub-dir-not-found', name: 'oups' });
      expect(result[0].error instanceof Error).toBeTruthy();
      done();
    });
  });

  it('should handle immediate not-readable directory', (done) => {
    new TreeViewMock().process('not-readable-eagerly').catch((error) => {
      expect(error instanceof Error).toBeTruthy();
      done();
    });
  });
});

describe('TreeView (with spy)', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  beforeEach(() => {
    spyOn(providers, 'readFile').and.callThrough();
    spyOn(providers, 'readdir').and.callThrough();
  });

  it('should handle not-readable file or directory', (done) => {
    new TreeViewMock().process('not-readable-lazily').then((result) => {
      expect(result.length).toEqual(2);

      result.forEach(r => expect(r.error instanceof Error).toBeTruthy());

      expect(result).toContainItem({ type: 'file', name: 'a', path: 'not-readable-lazily' });
      expect(result).toContainItem({ type: 'dir', name: 'b', path: 'not-readable-lazily' });

      expect(providers.readFile).toHaveBeenCalledTimes(1); // One for 'a'
      expect(providers.readdir).toHaveBeenCalledTimes(2); // One for 'not-readable-lazily' and another for 'b'
      done();
    });
  });
});

// TODO: test  `this.opts.depth` option...
