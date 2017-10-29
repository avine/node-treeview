// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { TreeView } from '../src/index';
import { providers } from './mock/mock-api';
import { DATE } from './mock/mock-endpoints';
import { customMatchers } from './matchers/matchers';

import * as Model from '../src/model';

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

  it('should find sub dirs', (done) => {
    new TreeViewMock().process('sub-dir').then((result) => {
      expect(result).toContainItem({ path: 'sub-dir', type: 'file', name: 'a' });
      expect(result).toContainItem({ path: 'sub-dir', type: 'dir', name: 'b' });

      const dir = result.filter(r => r.name === 'b');
      const subDir = dir[0] as Model.IDir;
      expect(subDir.content).toContainItem({ path: 'sub-dir/b', type: 'file', name: 'c', content: 'ccc' });
      expect(subDir.content).toContainItem({ path: 'sub-dir/b', type: 'file', name: 'd', content: 'ddd' });

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
    spyOn(providers, 'readFile').and.callThrough();
    spyOn(providers, 'readdir').and.callThrough();
  });

  it('should handle not readable file or dir', (done) => {
    new TreeViewMock().process('not-readable').then((result) => {
      expect(result.length).toEqual(2);

      result.forEach(r => expect(r.error instanceof Error).toBeTruthy());

      expect(result).toContainItem({ type: 'file', name: 'a', path: 'not-readable' });
      expect(result).toContainItem({ type: 'dir', name: 'b', path: 'not-readable' });

      expect(providers.readFile).toHaveBeenCalledTimes(1); // One for 'a'
      expect(providers.readdir).toHaveBeenCalledTimes(2); // One for 'not-readable' and another for 'b'
      done();
    });
  });

  it('should handle not readable dir (immediately)', (done) => {
    new TreeViewMock().process('immediate-error').catch((error) => {
      expect(error instanceof Error).toBeTruthy();
      done();
    });
  });
});
