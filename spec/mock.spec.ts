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
    Promise.all([
      // Using promise interface
      new TreeViewMock().process('oups').catch((error) => {
        expect(error instanceof Error).toBeTruthy();
      }),

      // Using callback interface
      new TreeViewMock().process('oups', (error, result) => {
        expect(error instanceof Error).toBeTruthy();
      })
    ]).catch(done);
  });

  it('should handle empty directory', (done) => {
    Promise.all([
      // Using promise interface
      new TreeViewMock().process('empty-dir').then((result) => {
        expect(result.length).toEqual(0);
      }),

      // Using callback interface
      new TreeViewMock().process('empty-dir', (error, result) => {
        expect(result.length).toEqual(0);
      })
    ]).then(done);
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

describe('TreeView options', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should skip files content', (done) => {
    Promise.all([
      new TreeViewMock(/*{ content: true }*/).process('skip-content').then((result) => {
        expect(result.length).toEqual(2);

        expect(result).toContainItem({ type: 'file', name: 'a', content: 'aaa', size: 3 });
        expect(result).toContainItem({ type: 'file', name: 'b', content: 'bbbb', size: 4 });
      }),
      new TreeViewMock({ content: false }).process('skip-content').then((result) => {
        expect(result.length).toEqual(2);

        // When `content` option is set to `false`, the `size` property is still available...
        expect(result).toContainItem({ type: 'file', name: 'a', size: 3 });
        expect(result).toContainItem({ type: 'file', name: 'b', size: 4 });

        // ...but the `content` property is skipped!
        result.forEach(r => expect('content' in r).toBeFalsy());
      })
    ]).then(done);
  });

  it('should stop processing at expected depth', (done) => {
    Promise.all([
      new TreeViewMock({ depth: 0 }).process('deep-dirs').then((result) => {
        expect(result).toContainItem({ type: 'file', name: 'a' });
        expect(result).toContainItem({ type: 'dir', name: 'folder' });
        expect(result).not.toContainItem({ type: 'dir', name: 'folder', content: ['b', 'folder'] });
      }),

      new TreeViewMock({ depth: 1 }).process('deep-dirs').then((result) => {
        const subDir = result.filter(r => r.name === 'folder')[0] as Model.IDir;

        expect(subDir.content).toContainItem({ type: 'file', name: 'b' });
        expect(subDir.content).toContainItem({ type: 'dir', name: 'folder' });
        expect(subDir.content).not.toContainItem({ type: 'dir', name: 'folder', content: ['c', 'd'] });
      }),

      new TreeViewMock({ depth: 2 }).process('deep-dirs').then((result) => {
        const subDir = result.filter(r => r.name === 'folder')[0] as Model.IDir;
        const deepDir = subDir.content.filter(r => r.name === 'folder')[0] as Model.IDir;

        expect(deepDir.content).toContainItem({ type: 'file', name: 'c' });
        expect(deepDir.content).toContainItem({ type: 'file', name: 'd' });
      })
    ]).then(done);
  });
});
