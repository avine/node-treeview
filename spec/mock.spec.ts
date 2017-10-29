// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { TreeView } from '../src/index';
import { providers } from './mock/mock-api';
import { DATE } from './mock/mock-endpoints';
import { customMatchers } from './matchers/matchers';

class TreeViewMock extends TreeView {
  inject() {
    this.providers = providers;
  }
}

describe('TreeView', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should handle bad path', (done) => {
    new TreeViewMock().process('oups').catch((error) => {
      expect(error instanceof Error).toBeTruthy();
      done();
    });
  });

  it('should handle empty dir', (done) => {
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

  it('should find dirs', (done) => {
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

  it('should handle not found', (done) => {
    new TreeViewMock().process('not-found').then((result) => {
      expect(result.length).toEqual(1);
      expect(result[0].error instanceof Error).toBeTruthy();
      expect(result).toContainItem({ path: 'not-found', name: 'oups' });
      done();
    });
  });
});

describe('TreeView', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  beforeEach(() => {
    // spyOn(providers, 'readFile');
    // spyOn(tree.providers, 'readdir');
  });

  it('should handle not readable', (done) => {
    new TreeViewMock().process('not-readable').then((result) => {
      expect(result.length).toEqual(2);

      result.forEach(r => expect(r.error instanceof Error).toBeTruthy());

      expect(result).toContainItem({ type: 'file', path: 'not-readable', name: 'a' });
      expect(result).toContainItem({ type: 'dir', path: 'not-readable', name: 'b' });

      // expect(providers.readFile).toHaveBeenCalledTimes(1);
      // expect(tree.providers.readdir).toHaveBeenCalledTimes(2);
      done();
    });
  });
});
