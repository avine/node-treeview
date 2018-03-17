// tslint:disable:object-literal-key-quotes

export const DATE = {
  CREATED: new Date(new Date().getTime() - 1000 * 60 * 60),
  MODIFIED: new Date()
};

export interface IEndpoints {
  [index: string]: { [index: string]: any };
}

const endpoints: IEndpoints = {
  'empty-dir': { type: 'dir', content: [] },

  'files': { type: 'dir', content: ['a', 'b'] },
  'files/a': { type: 'file', content: 'aaa', size: 3 },
  'files/b': { type: 'file', content: 'bbbb', size: 4 },

  'skip-hidden': { type: 'dir', content: ['.hidden', 'visible'] },
  'skip-hidden/.hidden': { type: 'file', content: 'xxx', size: 3 },
  'skip-hidden/visible': { type: 'file', content: 'ok', size: 2 },

  'binary': { type: 'dir', content: ['a.txt', 'b.png'] },
  'binary/a.txt': { type: 'file', content: '', size: 0 },
  'binary/b.png': { type: 'file', content: '', size: 0 },

  'dirs': { type: 'dir', content: ['a', 'b'] },
  'dirs/a': { type: 'dir', content: [] },
  'dirs/b': { type: 'dir', content: [] },

  'sub-dirs': { type: 'dir', content: ['a', 'b'] },
  'sub-dirs/a': { type: 'file', content: 'aaa', size: 3 },
  'sub-dirs/b': { type: 'dir', content: ['c', 'd'] },
  'sub-dirs/b/c': { type: 'file', content: 'ccc', size: 3 },
  'sub-dirs/b/d': { type: 'file', content: 'ddd', size: 3 },

  'sub-dir-not-found': { type: 'dir', content: ['oups'] },

  'not-readable-eagerly': { type: 'dir', content: false },

  'not-readable-lazily': { type: 'dir', content: ['a', 'b'] },
  'not-readable-lazily/a': { type: 'file', content: false },
  'not-readable-lazily/b': { type: 'dir', content: false },

  'skip-content': { type: 'dir', content: ['a', 'b'] },
  'skip-content/a': { type: 'file', content: 'aaa', size: 3 },
  'skip-content/b': { type: 'file', content: 'bbbb', size: 4 },

   // In order to check the `flatten` helper (especially the `.sort()` part),
   // some contents are unordered (*):
   //     - ['folder', 'b'] instead of ['b', 'folder']
   //     - ['d', 'c'] instead of ['c', 'd']
   // (see `helper.spec.ts` for more details)
  'deep-dirs': { type: 'dir', content: ['a', 'folder'] },
  'deep-dirs/a': { type: 'file', content: 'a', size: 1 },
  'deep-dirs/folder': { type: 'dir', content: ['folder', 'b'] }, // (*) unordered
  'deep-dirs/folder/b': { type: 'file', content: 'bb', size: 2 },
  'deep-dirs/folder/folder': { type: 'dir', content: ['d', 'c'] }, // (*) unordered
  'deep-dirs/folder/folder/c': { type: 'file', content: 'ccc', size: 3 },
  'deep-dirs/folder/folder/d': { type: 'file', content: 'dddd', size: 4 },

  'clean': { type: 'dir', content: ['a', 'b', 'c', 'd'] },
  'clean/a': { type: 'file', content: 'aaa', size: 3 },
  'clean/b': { type: 'dir', content: [] }, // empty!
  'clean/c': { type: 'dir', content: ['e'] },
  'clean/c/e': { type: 'dir', content: [] }, // empty!
  'clean/d': { type: 'dir', content: ['f'] },
  'clean/d/f': { type: 'file', content: 'fff', size: 3 },

  'pattern': { type: 'dir', content: ['a.html', 'b'] },
  'pattern/a.html': { type: 'file', content: 'aaa', size: 3 },
  'pattern/b': { type: 'dir', content: ['c.css', 'd.html'] },
  'pattern/b/c.css': { type: 'file', content: 'ccc', size: 3 },
  'pattern/b/d.html': { type: 'file', content: 'ddd', size: 3 },
};

for (const path in endpoints) {
  if (endpoints.hasOwnProperty(path)) {
    endpoints[path].created = DATE.CREATED;
    endpoints[path].modified = DATE.MODIFIED;
  }
}

export default endpoints;
