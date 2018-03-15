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
// const log = (data: any) => console.log(JSON.stringify(data, undefined, 2));

describe('TreeView mock', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should handle bad path', (done) => {
    let count = 0;

    // Using promise interface
    new TreeViewMock().process('oups').catch((error) => {
      expect(error instanceof Error).toBeTruthy();
      if (++count === 2) done();
    });

    // Using callback interface
    new TreeViewMock().process('oups', (error, result) => {
      expect(error instanceof Error).toBeTruthy();
      if (++count === 2) done();
    });
  });

  it('should handle empty directory', (done) => {
    Promise.all([
      // Using promise interface
      new TreeViewMock().process('empty-dir').then((result) => {
        expect(result.length).toBe(0);
      }),

      // Using callback interface
      new TreeViewMock().process('empty-dir', (error, result) => {
        expect(result.length).toBe(0);
      })
    ]).then(done);
  });

  it('should find files', (done) => {
    new TreeViewMock({ content: true }).process('files').then((result) => {
      expect(result.length).toBe(2);

      expect(result).toContainItem({
        binary: false, content: 'aaa', created: DATE.CREATED, modified: DATE.MODIFIED,
        name: 'a', path: 'files', pathname: 'files/a', size: 3, type: 'file'
      });
      expect(result).toContainItem({
        binary: false, content: 'bbbb', created: DATE.CREATED, modified: DATE.MODIFIED,
        name: 'b', path: 'files', pathname: 'files/b', size: 4, type: 'file'
      });
      done();
    });
  });

  it('should skip hidden files', (done) => {
    new TreeViewMock().process('skip-hidden').then((result) => {
      expect(result.length).toBe(1);

      expect(result).not.toContainItem({ type: 'file', name: '.hidden' });
      expect(result).toContainItem({ type: 'file', name: 'visible' });
      done();
    });
  });

  it('should check extension and binary path', (done) => {
    new TreeViewMock().process('binary').then((result) => {
      expect(result).toContainItem({ type: 'file', name: 'a.txt', ext: 'txt', binary: false });
      expect(result).toContainItem({ type: 'file', name: 'b.png', ext: 'png', binary: true });
      done();
    });
  });

  it('should find directories', (done) => {
    new TreeViewMock().process('dirs').then((result) => {
      expect(result.length).toBe(2);

      expect(result).toContainItem({
        content: [], created: DATE.CREATED, modified: DATE.MODIFIED,
        name: 'a', path: 'dirs', pathname: 'dirs/a', type: 'dir'
      });
      expect(result).toContainItem({
        content: [], created: DATE.CREATED, modified: DATE.MODIFIED,
        name: 'b', path: 'dirs', pathname: 'dirs/b', type: 'dir'
      });
      done();
    });
  });

  it('should find sub-directory', (done) => {
    new TreeViewMock({ content: true }).process('sub-dirs').then((result) => {
      expect(result).toContainItem({ path: 'sub-dirs', name: 'a', type: 'file' });
      expect(result).toContainItem({ path: 'sub-dirs', name: 'b', type: 'dir' });

      const filtered = result.filter(r => r.name === 'b');
      const subDir = filtered[0] as Model.IDir;
      expect(subDir.content).toContainItem({ path: 'sub-dirs/b', name: 'c', type: 'file', content: 'ccc' });
      expect(subDir.content).toContainItem({ path: 'sub-dirs/b', name: 'd', type: 'file', content: 'ddd' });

      done();
    });
  });

  it('should handle sub-directory not-found', (done) => {
    new TreeViewMock().process('sub-dir-not-found').then((result) => {
      expect(result.length).toBe(1);
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

describe('TreeView mock spies', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  beforeEach(() => {
    spyOn(providers, 'readFile').and.callThrough();
    spyOn(providers, 'readdir').and.callThrough();
  });

  it('should handle not-readable file or directory', (done) => {
    new TreeViewMock({ content: true }).process('not-readable-lazily').then((result) => {
      expect(result.length).toBe(2);

      result.forEach(r => expect(r.error instanceof Error).toBeTruthy());
      result.forEach(r => expect('content' in r).toBeFalsy());

      expect(result).toContainItem({ path: 'not-readable-lazily', name: 'a', type: 'file' });
      expect(result).toContainItem({ path: 'not-readable-lazily', name: 'b', type: 'dir' });

      expect(providers.readFile).toHaveBeenCalledTimes(1); // One for 'a'
      expect(providers.readdir).toHaveBeenCalledTimes(2); // One for 'not-readable-lazily' and another for 'b'
      done();
    });
  });
});

describe('TreeView mock options', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should skip files content', (done) => {
    Promise.all([
      new TreeViewMock({ content: true }).process('skip-content').then((result) => {
        expect(result.length).toBe(2);

        expect(result).toContainItem({ type: 'file', name: 'a', size: 3, content: 'aaa' });
        expect(result).toContainItem({ type: 'file', name: 'b', size: 4, content: 'bbbb' });
      }),
      new TreeViewMock(/*{ content: false }*/).process('skip-content').then((result) => {
        expect(result.length).toBe(2);

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

  it('should exclude directories', (done) => {
    Promise.all([
      // Remove sub-folder
      new TreeViewMock({ exclude: ['deep-dirs/folder'] }).process('deep-dirs').then((result) => {
        expect(result.length).toBe(1);
        expect(result).toContainItem({ type: 'file', name: 'a' });
        expect(result).not.toContainItem({ type: 'dir', name: 'folder' });
      }),

      // Remove deep-folder
      new TreeViewMock({ exclude: ['deep-dirs/folder/folder'] }).process('deep-dirs').then((result) => {
        expect(result.length).toBe(2);
        expect(result).toContainItem({ type: 'file', name: 'a' });
        expect(result).toContainItem({ type: 'dir', name: 'folder' });

        const subDir = result.filter(r => r.name === 'folder')[0] as Model.IDir;
        expect(subDir.content.length).toBe(1);
        expect(subDir.content).toContainItem({ type: 'file', name: 'b' });
        expect(subDir.content).not.toContainItem({ type: 'dir', name: 'folder' });
      }),

      // Check original
      new TreeViewMock({ exclude: [] }).process('deep-dirs').then((result) => {
        expect(result.length).toBe(2);
        expect(result).toContainItem({ type: 'file', name: 'a' });
        expect(result).toContainItem({ type: 'dir', name: 'folder' });

        const subDir = result.filter(r => r.name === 'folder')[0] as Model.IDir;
        expect(subDir.content.length).toBe(2);
        expect(subDir.content).toContainItem({ type: 'file', name: 'b' });
        expect(subDir.content).toContainItem({ type: 'dir', name: 'folder' });
      })
    ]).then(done);
  });

  it('should use relative path', (done) => {
    new TreeViewMock({ relative: true }).process('deep-dirs').then((result) => {
      expect(result).toContainItem({ type: 'file', path: '', name: 'a', pathname: 'a' });
      expect(result).toContainItem({ type: 'dir', path: '', name: 'folder', pathname: 'folder' });

      const subDir = result.filter(r => r.name === 'folder')[0] as Model.IDir;
      expect(subDir.content).toContainItem({ type: 'file', path: 'folder', name: 'b', pathname: 'folder/b' });
      expect(subDir.content).toContainItem({ type: 'dir', path: 'folder', name: 'folder', pathname: 'folder/folder' });

      const deepDir = subDir.content.filter(r => r.name === 'folder')[0] as Model.IDir;
      expect(deepDir.content).toContainItem({
        name: 'c', path: 'folder/folder', pathname: 'folder/folder/c', type: 'file' });
      expect(deepDir.content).toContainItem({
        name: 'd', path: 'folder/folder', pathname: 'folder/folder/d', type: 'file' });

      done();
    });
  });
});
