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
    new TreeViewMock().process('./oups').catch((error) => {
      expect(error instanceof Error).toBeTruthy();
      if (++count === 2) done();
    });

    // Using callback interface
    new TreeViewMock().process('./oups', (error, tree) => {
      expect(error instanceof Error).toBeTruthy();
      if (++count === 2) done();
    });
  });

  it('should handle empty directory', (done) => {
    Promise.all([
      // Using promise interface
      new TreeViewMock().process('./empty-dir').then((tree) => {
        expect(tree.length).toBe(0);
      }),

      // Using callback interface
      new TreeViewMock().process('./empty-dir', (error, tree) => {
        if (tree) {
          expect(tree.length).toBe(0);
        }
      })
    ]).then(done);
  });

  it('should find files', (done) => {
    new TreeViewMock({ content: true }).process('./files').then((tree) => {
      expect(tree.length).toBe(2);

      expect(tree).toContainItem({
        binary: false, content: 'aaa', created: DATE.CREATED, modified: DATE.MODIFIED,
        name: 'a', path: '/root/files', pathname: '/root/files/a', size: 3, type: 'file'
      });
      expect(tree).toContainItem({
        binary: false, content: 'bbbb', created: DATE.CREATED, modified: DATE.MODIFIED,
        name: 'b', path: '/root/files', pathname: '/root/files/b', size: 4, type: 'file'
      });
      done();
    });
  });

  it('should skip hidden files', (done) => {
    new TreeViewMock().process('./skip-hidden').then((tree) => {
      expect(tree.length).toBe(1);

      expect(tree).not.toContainItem({ type: 'file', name: '.hidden' });
      expect(tree).toContainItem({ type: 'file', name: 'visible' });
      done();
    });
  });

  it('should check extension and binary path', (done) => {
    new TreeViewMock().process('./binary').then((tree) => {
      expect(tree).toContainItem({ type: 'file', name: 'a.txt', ext: 'txt', binary: false });
      expect(tree).toContainItem({ type: 'file', name: 'b.png', ext: 'png', binary: true });
      done();
    });
  });

  it('should find directories', (done) => {
    new TreeViewMock().process('./dirs').then((tree) => {
      expect(tree.length).toBe(2);

      expect(tree).toContainItem({
        content: [], created: DATE.CREATED, modified: DATE.MODIFIED,
        name: 'a', path: '/root/dirs', pathname: '/root/dirs/a', type: 'dir'
      });
      expect(tree).toContainItem({
        content: [], created: DATE.CREATED, modified: DATE.MODIFIED,
        name: 'b', path: '/root/dirs', pathname: '/root/dirs/b', type: 'dir'
      });
      done();
    });
  });

  it('should find sub-directory', (done) => {
    new TreeViewMock({ content: true }).process('./sub-dirs').then((tree) => {
      expect(tree).toContainItem({ path: '/root/sub-dirs', name: 'a', type: 'file' });
      expect(tree).toContainItem({ path: '/root/sub-dirs', name: 'b', type: 'dir' });

      const filtered = tree.filter(r => r.name === 'b');
      const subDir = filtered[0] as Model.IDir;
      expect(subDir.content).toContainItem({ path: '/root/sub-dirs/b', name: 'c', type: 'file', content: 'ccc' });
      expect(subDir.content).toContainItem({ path: '/root/sub-dirs/b', name: 'd', type: 'file', content: 'ddd' });

      done();
    });
  });

  it('should handle sub-directory not-found', (done) => {
    new TreeViewMock().process('./sub-dir-not-found').then((tree) => {
      expect(tree.length).toBe(1);
      expect(tree).toContainItem({ path: '/root/sub-dir-not-found', name: 'oups' });
      expect(tree[0].error instanceof Error).toBeTruthy();
      done();
    });
  });

  it('should handle immediate not-readable directory', (done) => {
    new TreeViewMock().process('./not-readable-eagerly').catch((error) => {
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
    new TreeViewMock({ content: true }).process('./not-readable-lazily').then((tree) => {
      expect(tree.length).toBe(2);

      tree.forEach(r => expect(r.error instanceof Error).toBeTruthy());
      tree.forEach(r => expect('content' in r).toBeFalsy());

      expect(tree).toContainItem({ path: '/root/not-readable-lazily', name: 'a', type: 'file' });
      expect(tree).toContainItem({ path: '/root/not-readable-lazily', name: 'b', type: 'dir' });

      expect(providers.readFile).toHaveBeenCalledTimes(1); // One for 'a'
      expect(providers.readdir).toHaveBeenCalledTimes(2); // One for 'not-readable-lazily' and another for 'b'
      done();
    });
  });
});

describe('TreeView mock options', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should add files content', (done) => {
    Promise.all([
      new TreeViewMock({ content: true }).process('./skip-content').then((tree) => {
        expect(tree.length).toBe(2);

        expect(tree).toContainItem({ type: 'file', name: 'a', size: 3, content: 'aaa' });
        expect(tree).toContainItem({ type: 'file', name: 'b', size: 4, content: 'bbbb' });
      }),

      new TreeViewMock(/*{ content: false }*/).process('./skip-content').then((tree) => {
        expect(tree.length).toBe(2);

        // When `content` option is set to `false`, the `size` property is still available...
        expect(tree).toContainItem({ type: 'file', name: 'a', size: 3 });
        expect(tree).toContainItem({ type: 'file', name: 'b', size: 4 });

        // ...but the `content` property is skipped!
        tree.forEach(r => expect('content' in r).toBeFalsy());
      })
    ]).then(done);
  });

  it('should stop processing at expected depth', (done) => {
    Promise.all([
      new TreeViewMock({ depth: 0 }).process('./deep-dirs').then((tree) => {
        expect(tree).toContainItem({ type: 'file', name: 'a' });
        expect(tree).toContainItem({ type: 'dir', name: 'folder' });
        expect(tree).not.toContainItem({ type: 'dir', name: 'folder', content: ['b', 'folder'] });
      }),

      new TreeViewMock({ depth: 1 }).process('./deep-dirs').then((tree) => {
        const subDir = tree.filter(r => r.name === 'folder')[0] as Model.IDir;

        expect(subDir.content).toContainItem({ type: 'file', name: 'b' });
        expect(subDir.content).toContainItem({ type: 'dir', name: 'folder' });
        expect(subDir.content).not.toContainItem({ type: 'dir', name: 'folder', content: ['c', 'd'] });
      }),

      new TreeViewMock({ depth: 2 }).process('./deep-dirs').then((tree) => {
        const subDir = tree.filter(r => r.name === 'folder')[0] as Model.IDir;
        const deepDir = subDir.content.filter(r => r.name === 'folder')[0] as Model.IDir;

        expect(deepDir.content).toContainItem({ type: 'file', name: 'c' });
        expect(deepDir.content).toContainItem({ type: 'file', name: 'd' });
      })
    ]).then(done);
  });

  it('should use relative path', (done) => {
    new TreeViewMock({ relative: true }).process('./deep-dirs').then((tree) => {
      expect(tree).toContainItem({ type: 'file', path: '', name: 'a', pathname: 'a' });
      expect(tree).toContainItem({ type: 'dir', path: '', name: 'folder', pathname: 'folder' });

      const subDir = tree.filter(r => r.name === 'folder')[0] as Model.IDir;
      expect(subDir.content).toContainItem({
        type: 'file', path: 'folder', name: 'b', pathname: 'folder/b'
      });
      expect(subDir.content).toContainItem({
        type: 'dir', path: 'folder', name: 'folder', pathname: 'folder/folder'
      });

      const deepDir = subDir.content.filter(r => r.name === 'folder')[0] as Model.IDir;
      expect(deepDir.content).toContainItem({
        name: 'c', path: 'folder/folder', pathname: 'folder/folder/c', type: 'file'
      });
      expect(deepDir.content).toContainItem({
        name: 'd', path: 'folder/folder', pathname: 'folder/folder/d', type: 'file'
      });

      done();
    });
  });

  it('should include directories', (done) => {
    const callback = (tree: Model.TreeNode[]) => {
      // Skip file `./deep-dirs/a`
      expect(tree.length).toBe(1);
      expect(tree).not.toContainItem({ type: 'file', name: 'a' });
      expect(tree).toContainItem({ type: 'dir', name: 'folder' });

      // Skip file `./deep-dirs/folder/b`
      const subDir = tree.filter(r => r.name === 'folder')[0] as Model.IDir;
      expect(subDir.content.length).toBe(1);
      expect(subDir.content).not.toContainItem({ type: 'file', name: 'b' });
      expect(subDir.content).toContainItem({ type: 'dir', name: 'folder' });

      // Keep files `./deep-dirs/folder/folder/c` and  `./deep-dirs/folder/folder/d`
      const deepDir = subDir.content.filter(r => r.name === 'folder')[0] as Model.IDir;
      expect(deepDir.content.length).toBe(2);
      expect(deepDir.content).toContainItem({ type: 'file', name: 'c' });
      expect(deepDir.content).toContainItem({ type: 'file', name: 'd' });
    };

    Promise.all([
      // Use relative path to define the option `include` but process the tree with absolute paths.
      new TreeViewMock({
        include: ['./deep-dirs/folder/folder']/*, relative: false*/
      }).process('./deep-dirs').then(callback),

      // Use absolute path to define the option `include` but process the tree with relative paths.
      new TreeViewMock({
        include: ['/root/deep-dirs/folder/folder'], relative: true
      }).process('./deep-dirs').then(callback),
    ]).then(done);
  });

  it('should exclude directories', (done) => {
    const callback = (tree: Model.TreeNode[]) => {
      expect(tree.length).toBe(2);
      expect(tree).toContainItem({ type: 'file', name: 'a' });
      expect(tree).toContainItem({ type: 'dir', name: 'folder' });

      const subDir = tree.filter(r => r.name === 'folder')[0] as Model.IDir;
      expect(subDir.content.length).toBe(1);
      expect(subDir.content).toContainItem({ type: 'file', name: 'b' });
      expect(subDir.content).not.toContainItem({ type: 'dir', name: 'folder' });
    };

    Promise.all([
      // Remove sub-folder
      new TreeViewMock({ exclude: ['./deep-dirs/folder'] }).process('./deep-dirs').then((tree) => {
        expect(tree.length).toBe(1);
        expect(tree).toContainItem({ type: 'file', name: 'a' });
        expect(tree).not.toContainItem({ type: 'dir', name: 'folder' });
      }),

      // Remove deep-folder
      // Use relative path to define the option `exclude` but process the tree with absolute paths.
      new TreeViewMock({
        exclude: ['./deep-dirs/folder/folder']/*, relative: false*/
      }).process('./deep-dirs').then(callback),
      // Use absolute path to define the option `exclude` but process the tree with relative paths.
      new TreeViewMock({
        exclude: ['/root/deep-dirs/folder/folder'], relative: true
      }).process('./deep-dirs').then(callback),

      // Check original without any `include` or `exclude` options
      new TreeViewMock({ include: [], exclude: [] }).process('./deep-dirs').then((tree) => {
        expect(tree.length).toBe(2);
        expect(tree).toContainItem({ type: 'file', name: 'a' });
        expect(tree).toContainItem({ type: 'dir', name: 'folder' });

        const subDir = tree.filter(r => r.name === 'folder')[0] as Model.IDir;
        expect(subDir.content.length).toBe(2);
        expect(subDir.content).toContainItem({ type: 'file', name: 'b' });
        expect(subDir.content).toContainItem({ type: 'dir', name: 'folder' });

        const deepDir = subDir.content.filter(r => r.name === 'folder')[0] as Model.IDir;
        expect(deepDir.content.length).toBe(2);
        expect(deepDir.content).toContainItem({ type: 'file', name: 'c' });
        expect(deepDir.content).toContainItem({ type: 'file', name: 'd' });
      })
    ]).then(done);
  });

  it('should match glob pattern', (done) => {
    Promise.all([
      // Check without pattern
      new TreeViewMock().process('./pattern').then((tree) => {
        expect(tree).toContainItem({ type: 'file', path: '/root/pattern', name: 'a.html' });

        const subDir = tree.filter(r => r.name === 'b')[0] as Model.IDir;
        expect(subDir.content).toContainItem({ type: 'file', path: '/root/pattern/b', name: 'c.css' });
        expect(subDir.content).toContainItem({ type: 'file', path: '/root/pattern/b', name: 'd.html' });
      }),

      new TreeViewMock({ pattern: ['**/*.html'] }).process('./pattern').then((tree) => {
        expect(tree).toContainItem({ type: 'file', path: '/root/pattern', name: 'a.html' });

        const subDir = tree.filter(r => r.name === 'b')[0] as Model.IDir;
        expect(subDir.content).not.toContainItem({ type: 'file', path: '/root/pattern/b', name: 'c.css' });
        expect(subDir.content).toContainItem({ type: 'file', path: '/root/pattern/b', name: 'd.html' });
      }),

      new TreeViewMock({ pattern: ['**/*.css'] }).process('./pattern').then((tree) => {
        expect(tree).not.toContainItem({ type: 'file', path: '/root/pattern', name: 'a.html' });

        const subDir = tree.filter(r => r.name === 'b')[0] as Model.IDir;
        expect(subDir.content).toContainItem({ type: 'file', path: '/root/pattern/b', name: 'c.css' });
        expect(subDir.content).not.toContainItem({ type: 'file', path: '/root/pattern/b', name: 'd.html' });
      }),

      new TreeViewMock({ pattern: ['**/*.js'] }).process('./pattern').then((tree) => {
        expect(tree).not.toContainItem({ type: 'file', path: '/root/pattern', name: 'a.html' });

        const subDir = tree.filter(r => r.name === 'b')[0] as Model.IDir;
        expect(subDir.content).not.toContainItem({ type: 'file', path: '/root/pattern/b', name: 'c.css' });
        expect(subDir.content).not.toContainItem({ type: 'file', path: '/root/pattern/b', name: 'd.html' });
      })
    ]).then(done);
  });

  it('should add listener', (done) => {
    let list: string[] = [];
    new TreeViewMock().listen((data) => {
      list.push(data.pathname);
    }).process('./deep-dirs').then(() => {
      list = list.sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
      expect(list).toEqual([
        '/root/deep-dirs/a',
        '/root/deep-dirs/folder',
        '/root/deep-dirs/folder/b',
        '/root/deep-dirs/folder/folder',
        '/root/deep-dirs/folder/folder/c',
        '/root/deep-dirs/folder/folder/d'
      ]);
      done();
    });
  });

  it('should remove listener', (done) => {
    let count = 0;
    const treeView = new TreeViewMock();
    treeView.listen((data) => {
      if (count === 2) {
        treeView.removeListeners();
      }
      count++;
    });
    treeView.process('./deep-dirs').then(() => {
      // We should get only 3 data instead of 6!
      expect(count).toBe(3);
      done();
    });
  });
});
