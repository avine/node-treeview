// tslint:disable:object-literal-key-quotes

export const DATE = {
  CREATED: new Date(new Date().getTime() - 1000 * 60 * 60),
  MODIFIED: new Date()
};

export interface IEndpoints {
  [index: string]: { [index: string]: any };
}

const endpoints: IEndpoints = {
  '/root/empty-dir': { type: 'dir', content: [] },

  '/root/files': { type: 'dir', content: ['a', 'b'] },
  '/root/files/a': { type: 'file', content: 'aaa', size: 3 },
  '/root/files/b': { type: 'file', content: 'bbbb', size: 4 },

  '/root/hidden': { type: 'dir', content: ['.git', '.gitignore', 'README.md'] },
  '/root/hidden/.git': { type: 'dir', content: [] },
  '/root/hidden/.gitignore': { type: 'file', content: 'node_modules/', size: 13 },
  '/root/hidden/README.md': { type: 'file', content: '# Hello World!', size: 14 },

  '/root/binary': { type: 'dir', content: ['a.txt', 'b.png'] },
  '/root/binary/a.txt': { type: 'file', content: '', size: 0 },
  '/root/binary/b.png': { type: 'file', content: '', size: 0 },

  '/root/dirs': { type: 'dir', content: ['a', 'b'] },
  '/root/dirs/a': { type: 'dir', content: [] },
  '/root/dirs/b': { type: 'dir', content: [] },

  '/root/sub-dirs': { type: 'dir', content: ['a', 'b'] },
  '/root/sub-dirs/a': { type: 'file', content: 'aaa', size: 3 },
  '/root/sub-dirs/b': { type: 'dir', content: ['c', 'd'] },
  '/root/sub-dirs/b/c': { type: 'file', content: 'ccc', size: 3 },
  '/root/sub-dirs/b/d': { type: 'file', content: 'ddd', size: 3 },

  '/root/sub-dir-not-found': { type: 'dir', content: ['oups'] },

  '/root/not-readable-eagerly': { type: 'dir', content: false },

  '/root/not-readable-lazily': { type: 'dir', content: ['a', 'b'] },
  '/root/not-readable-lazily/a': { type: 'file', content: false },
  '/root/not-readable-lazily/b': { type: 'dir', content: false },

  '/root/skip-content': { type: 'dir', content: ['a', 'b'] },
  '/root/skip-content/a': { type: 'file', content: 'aaa', size: 3 },
  '/root/skip-content/b': { type: 'file', content: 'bbbb', size: 4 },

   // In order to check the `flatten` helper (especially the `.sort()` part),
   // some contents are unordered (*):
   //     - ['folder', 'b'] instead of ['b', 'folder']
   //     - ['d', 'c'] instead of ['c', 'd']
   // (see `helper.spec.ts` for more details)
  '/root/deep-dirs': { type: 'dir', content: ['a', 'folder'] },
  '/root/deep-dirs/a': { type: 'file', content: 'a', size: 1 },
  '/root/deep-dirs/folder': { type: 'dir', content: ['folder', 'b'] }, // (*) unordered
  '/root/deep-dirs/folder/b': { type: 'file', content: 'bb', size: 2 },
  '/root/deep-dirs/folder/folder': { type: 'dir', content: ['d', 'c'] }, // (*) unordered
  '/root/deep-dirs/folder/folder/c': { type: 'file', content: 'ccc', size: 3 },
  '/root/deep-dirs/folder/folder/d': { type: 'file', content: 'dddd', size: 4 },

  '/root/clean': { type: 'dir', content: ['a', 'b', 'c', 'd'] },
  '/root/clean/a': { type: 'file', content: 'aaa', size: 3 },
  '/root/clean/b': { type: 'dir', content: [] }, // empty!
  '/root/clean/c': { type: 'dir', content: ['e'] },
  '/root/clean/c/e': { type: 'dir', content: [] }, // empty!
  '/root/clean/d': { type: 'dir', content: ['f'] },
  '/root/clean/d/f': { type: 'file', content: 'fff', size: 3 },

  '/root/glob': { type: 'dir', content: ['a.html', 'b'] },
  '/root/glob/a.html': { type: 'file', content: 'aaa', size: 3 },
  '/root/glob/b': { type: 'dir', content: ['c.css', 'd.html'] },
  '/root/glob/b/c.css': { type: 'file', content: 'ccc', size: 3 },
  '/root/glob/b/d.html': { type: 'file', content: 'ddd', size: 3 },
};

for (const path in endpoints) {
  if (endpoints.hasOwnProperty(path)) {
    endpoints[path].created = DATE.CREATED;
    endpoints[path].modified = DATE.MODIFIED;
  }
}

export default endpoints;
