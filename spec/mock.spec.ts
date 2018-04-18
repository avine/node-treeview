// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { TreeView } from '../src/index';
import * as Model from '../src/model';

import { providers } from './mock/mock.api';
import { DATE } from './mock/mock.endpoints';

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
        name: 'a.css', path: '/root/files', pathname: '/root/files/a.css', depth: 0,
        type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED,
        size: 3, ext: 'css', binary: false, content: 'aaa'
      });
      expect(tree).toContainItem({
        name: 'b.js', path: '/root/files', pathname: '/root/files/b.js', depth: 0,
        type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED,
        size: 4, ext: 'js', binary: false, content: 'bbbb'
      });
      done();
    });
  });

  it('should exclude hidden files by default', (done) => {
    new TreeViewMock(/*{ all: false }*/).process('./hidden').then((tree) => {
      expect(tree.length).toBe(1);

      expect(tree).not.toContainItem({ type: 'dir', name: '.git' });
      expect(tree).not.toContainItem({ type: 'file', name: '.gitignore' });
      expect(tree).toContainItem({ type: 'file', name: 'README.md' });
      done();
    });
  });

  it('should include hidden files on demand', (done) => {
    new TreeViewMock({ all: true }).process('./hidden').then((tree) => {
      expect(tree.length).toBe(3);

      expect(tree).toContainItem({ type: 'dir', name: '.git' });
      expect(tree).toContainItem({ type: 'file', name: '.gitignore' });
      expect(tree).toContainItem({ type: 'file', name: 'README.md' });
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
        name: 'a', path: '/root/dirs', pathname: '/root/dirs/a', depth: 0,
        type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, nodes: []
      });
      expect(tree).toContainItem({
        name: 'b', path: '/root/dirs', pathname: '/root/dirs/b', depth: 0,
        type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, nodes: []
      });
      done();
    });
  });

  it('should find sub-directory', (done) => {
    new TreeViewMock({ content: true }).process('./sub-dirs').then((tree) => {
      expect(tree).toContainItem({ path: '/root/sub-dirs', name: 'a', type: 'file', depth: 0 });
      expect(tree).toContainItem({ path: '/root/sub-dirs', name: 'b', type: 'dir', depth: 0 });

      const filtered = tree.filter(item => item.name === 'b');
      const sub = filtered[0] as Model.IDir;
      expect(sub.nodes).toContainItem({ path: '/root/sub-dirs/b', name: 'c', type: 'file', content: 'ccc', depth: 1 });
      expect(sub.nodes).toContainItem({ path: '/root/sub-dirs/b', name: 'd', type: 'file', content: 'ddd', depth: 1 });

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

      tree.forEach((item) => {
        expect(item.error instanceof Error).toBeTruthy();

        if (item.name === 'a') {
          // When file content is not readable, the `content` property is set to an empty string
          expect((item as Model.IFile).content).toEqual('');
        } else if (item.name === 'b') {
          // When dir nodes is not readable, the `nodes` property is set to an empty array
          expect((item as Model.IDir).nodes).toEqual([]);
        }
      });

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
        expect(tree).toContainItem({ type: 'dir', name: 'folder', nodes: [], depth: 0 });
      }),

      new TreeViewMock({ depth: 1 }).process('./deep-dirs').then((tree) => {
        const sub = tree.filter(item => item.name === 'folder')[0] as Model.IDir;

        expect(sub.nodes).toContainItem({ type: 'file', name: 'b' });
        expect(sub.nodes).toContainItem({ type: 'dir', name: 'folder', nodes: [], depth: 1 });
      }),

      new TreeViewMock({ depth: 2 }).process('./deep-dirs').then((tree) => {
        const sub = tree.filter(item => item.name === 'folder')[0] as Model.IDir;
        const deep = sub.nodes.filter(item => item.name === 'folder')[0] as Model.IDir;

        expect(deep.nodes).toContainItem({ type: 'file', name: 'c', depth: 2 });
        expect(deep.nodes).toContainItem({ type: 'file', name: 'd', depth: 2 });
      })
    ]).then(done);
  });

  it('should use relative path', (done) => {
    new TreeViewMock({ relative: true }).process('./deep-dirs').then((tree) => {
      expect(tree).toContainItem({ type: 'file', path: '', name: 'a', pathname: 'a' });
      expect(tree).toContainItem({ type: 'dir', path: '', name: 'folder', pathname: 'folder' });

      const sub = tree.filter(item => item.name === 'folder')[0] as Model.IDir;
      expect(sub.nodes).toContainItem({
        type: 'file', path: 'folder', name: 'b', pathname: 'folder/b'
      });
      expect(sub.nodes).toContainItem({
        type: 'dir', path: 'folder', name: 'folder', pathname: 'folder/folder'
      });

      const deep = sub.nodes.filter(item => item.name === 'folder')[0] as Model.IDir;
      expect(deep.nodes).toContainItem({
        name: 'c', path: 'folder/folder', pathname: 'folder/folder/c', type: 'file'
      });
      expect(deep.nodes).toContainItem({
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
      const sub = tree.filter(item => item.name === 'folder')[0] as Model.IDir;
      expect(sub.nodes.length).toBe(1);
      expect(sub.nodes).not.toContainItem({ type: 'file', name: 'b' });
      expect(sub.nodes).toContainItem({ type: 'dir', name: 'folder' });

      // Keep files `./deep-dirs/folder/folder/c` and  `./deep-dirs/folder/folder/d`
      const deep = sub.nodes.filter(item => item.name === 'folder')[0] as Model.IDir;
      expect(deep.nodes.length).toBe(2);
      expect(deep.nodes).toContainItem({ type: 'file', name: 'c' });
      expect(deep.nodes).toContainItem({ type: 'file', name: 'd' });
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

      const sub = tree.filter(item => item.name === 'folder')[0] as Model.IDir;
      expect(sub.nodes.length).toBe(1);
      expect(sub.nodes).toContainItem({ type: 'file', name: 'b' });
      expect(sub.nodes).not.toContainItem({ type: 'dir', name: 'folder' });
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

        const sub = tree.filter(item => item.name === 'folder')[0] as Model.IDir;
        expect(sub.nodes.length).toBe(2);
        expect(sub.nodes).toContainItem({ type: 'file', name: 'b' });
        expect(sub.nodes).toContainItem({ type: 'dir', name: 'folder' });

        const deep = sub.nodes.filter(item => item.name === 'folder')[0] as Model.IDir;
        expect(deep.nodes.length).toBe(2);
        expect(deep.nodes).toContainItem({ type: 'file', name: 'c' });
        expect(deep.nodes).toContainItem({ type: 'file', name: 'd' });
      })
    ]).then(done);
  });

  it('should match glob pattern', (done) => {
    Promise.all([
      // Check without pattern
      new TreeViewMock().process('./glob').then((tree) => {
        expect(tree).toContainItem({ type: 'file', path: '/root/glob', name: 'a.html' });

        const sub = tree.filter(item => item.name === 'b')[0] as Model.IDir;
        expect(sub.nodes).toContainItem({ type: 'file', path: '/root/glob/b', name: 'c.css' });
        expect(sub.nodes).toContainItem({ type: 'file', path: '/root/glob/b', name: 'd.html' });
      }),

      new TreeViewMock({ glob: ['**/*.html'] }).process('./glob').then((tree) => {
        expect(tree).toContainItem({ type: 'file', path: '/root/glob', name: 'a.html' });

        const sub = tree.filter(item => item.name === 'b')[0] as Model.IDir;
        expect(sub.nodes).not.toContainItem({ type: 'file', path: '/root/glob/b', name: 'c.css' });
        expect(sub.nodes).toContainItem({ type: 'file', path: '/root/glob/b', name: 'd.html' });
      }),

      new TreeViewMock({ glob: ['**/*.css'] }).process('./glob').then((tree) => {
        expect(tree).not.toContainItem({ type: 'file', path: '/root/glob', name: 'a.html' });

        const sub = tree.filter(item => item.name === 'b')[0] as Model.IDir;
        expect(sub.nodes).toContainItem({ type: 'file', path: '/root/glob/b', name: 'c.css' });
        expect(sub.nodes).not.toContainItem({ type: 'file', path: '/root/glob/b', name: 'd.html' });
      }),

      new TreeViewMock({ glob: ['**/*.js'] }).process('./glob').then((tree) => {
        expect(tree).not.toContainItem({ type: 'file', path: '/root/glob', name: 'a.html' });

        const sub = tree.filter(item => item.name === 'b')[0] as Model.IDir;
        expect(sub.nodes).not.toContainItem({ type: 'file', path: '/root/glob/b', name: 'c.css' });
        expect(sub.nodes).not.toContainItem({ type: 'file', path: '/root/glob/b', name: 'd.html' });
      })
    ]).then(done);
  });

  it('should sort tree', (done) => {
    const getNames = (tree: Model.TreeNode[]) => [tree[0].name, tree[1].name, tree[2].name, tree[3].name, tree[4].name];
    Promise.all([
      new TreeViewMock(/* sort: Model.Sorting.Alpha }*/).process('./sort').then((tree) => {
        expect(getNames(tree)).toEqual(['a', 'b', 'c', 'd', 'e']);
      }),

      new TreeViewMock({ sort: Model.Sorting.FileFirst }).process('./sort').then((tree) => {
        // 'a' is in error and always pushed at the end
        expect(getNames(tree)).toEqual(['c', 'd', 'b', 'e', 'a']);
      }),

      new TreeViewMock({ sort: Model.Sorting.DirFirst }).process('./sort').then((tree) => {
        // 'a' is in error and always pushed at the end
        expect(getNames(tree)).toEqual(['b', 'e', 'c', 'd', 'a']);
      })
    ]).then(done);
  });
});

describe('TreeView mock events', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should add listener', (done) => {
    const list: string[] = [];
    new TreeViewMock().listen((data) => {
      list.push(data.pathname);
    }).process('./deep-dirs').then(() => {
      expect(list.sort()).toEqual([
        // We should get 6 data!
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
      if (++count === 3) {
        treeView.removeListeners();
      }
    });
    treeView.process('./deep-dirs').then(() => {
      // We should get only 3 data instead of 6!
      expect(count).toBe(3);
      done();
    });
  });

  it('should not emit files content or dir nodes', (done) => {
    let haveContent = false;
    let haveNodes = false;

    new TreeViewMock({
      // Request the files content
      content: true
    }).listen((data) => {
      if ((data as Model.IFile).type === 'file' && 'content' in data) {
        // Emitted file should never have `content` property
        haveContent = true;
      } else if ((data as Model.IDir).type === 'dir' && (data as Model.IDir).nodes.length) {
        // Emitted dir should always have `nodes` property equal to an empty array
        haveNodes = true;
      }
    }).process('./deep-dirs').then((tree) => {
      expect(haveContent).toBeFalsy();
      expect(haveNodes).toBeFalsy();

      // Check that the `content` property was indeed computed (as required by the options)
      const file = tree.filter(item => item.name === 'a')[0] as Model.IFile;
      expect('content' in file).toBeTruthy();

      // Check that the `nodes` property was indeed computed
      const folder = tree.filter(item => item.name === 'folder')[0] as Model.IDir;
      expect(folder.nodes.length).toBeTruthy();

      done();
    });
  });

  it('should handle parallel process calls', (done) => {
    const subDirs1: string[] = [];
    const subDirs2: string[] = [];

    const treeView = new TreeViewMock({
      content: true,
      relative: true
    }).listen((data, ctx) => {
      if (ctx.rootPath === '/root/sub-dirs') subDirs1.push(data.pathname);
      if (ctx.rootPath === '/root/sub-dirs-alt') subDirs2.push(data.pathname);
    });

    Promise.all([
      // Use the same instance to process in parallel
      treeView.process('./sub-dirs'),
      treeView.process('./sub-dirs-alt')
    ]).then((trees) => {
      // Each emitted data should have the right ctx
      expect(subDirs1.sort()).toEqual(['a', 'b', 'b/c', 'b/d']);
      expect(subDirs2.sort()).toEqual(['w', 'x', 'x/y', 'x/z']);

      // Processed trees should be ok
      const [tree1, tree2] = trees;

      expect(tree1).toContainItem({ pathname: 'a', type: 'file' });
      expect(tree1).toContainItem({ pathname: 'b', type: 'dir' });
      const filtered1 = tree1.filter(item => item.name === 'b');
      const sub1 = filtered1[0] as Model.IDir;
      expect(sub1.nodes).toContainItem({ pathname: 'b/c', type: 'file', content: 'ccc' });
      expect(sub1.nodes).toContainItem({ pathname: 'b/d', type: 'file', content: 'ddd' });

      expect(tree2).toContainItem({ pathname: 'w', type: 'file' });
      expect(tree2).toContainItem({ pathname: 'x', type: 'dir' });
      const filtered2 = tree2.filter(item => item.name === 'x');
      const sub2 = filtered2[0] as Model.IDir;
      expect(sub2.nodes).toContainItem({ pathname: 'x/y', type: 'file', content: 'yyy' });
      expect(sub2.nodes).toContainItem({ pathname: 'x/z', type: 'file', content: 'zzz' });

      done();
    });
  });
});
