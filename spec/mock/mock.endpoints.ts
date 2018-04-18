// tslint:disable:object-literal-key-quotes

import { IEndpoints } from './mock.api';

export const DATE = {
  CREATED: new Date(new Date().getTime() - 1000 * 60 * 60),
  MODIFIED: new Date()
};

const endpoints: IEndpoints = {
  '/root/empty-dir': { type: 'dir', nodes: [] },

  '/root/files': { type: 'dir', nodes: ['a.css', 'b.js'] },
  '/root/files/a.css': { type: 'file', content: 'aaa', size: 3 },
  '/root/files/b.js': { type: 'file', content: 'bbbb', size: 4 },

  '/root/hidden': { type: 'dir', nodes: ['.git', '.gitignore', 'README.md'] },
  '/root/hidden/.git': { type: 'dir', nodes: [] },
  '/root/hidden/.gitignore': { type: 'file', content: 'node_modules/', size: 13 },
  '/root/hidden/README.md': { type: 'file', content: '# Hello World!', size: 14 },

  '/root/binary': { type: 'dir', nodes: ['a.txt', 'b.png'] },
  '/root/binary/a.txt': { type: 'file', content: '', size: 0 },
  '/root/binary/b.png': { type: 'file', content: '', size: 0 },

  '/root/dirs': { type: 'dir', nodes: ['a', 'b'] },
  '/root/dirs/a': { type: 'dir', nodes: [] },
  '/root/dirs/b': { type: 'dir', nodes: [] },

  '/root/sub-dirs': { type: 'dir', nodes: ['a', 'b'] },
  '/root/sub-dirs/a': { type: 'file', content: 'aaa', size: 3 },
  '/root/sub-dirs/b': { type: 'dir', nodes: ['c', 'd'] },
  '/root/sub-dirs/b/c': { type: 'file', content: 'ccc', size: 3 },
  '/root/sub-dirs/b/d': { type: 'file', content: 'ddd', size: 3 },

  '/root/sub-dirs-alt': { type: 'dir', nodes: ['w', 'x'] },
  '/root/sub-dirs-alt/w': { type: 'file', content: 'www', size: 3 },
  '/root/sub-dirs-alt/x': { type: 'dir', nodes: ['y', 'z'] },
  '/root/sub-dirs-alt/x/y': { type: 'file', content: 'yyy', size: 3 },
  '/root/sub-dirs-alt/x/z': { type: 'file', content: 'zzz', size: 3 },

  '/root/sub-dir-not-found': { type: 'dir', nodes: ['oups'] },

  '/root/not-readable-eagerly': { type: 'dir', nodes: false },

  '/root/not-readable-lazily': { type: 'dir', nodes: ['a', 'b'] },
  '/root/not-readable-lazily/a': { type: 'file', content: false },
  '/root/not-readable-lazily/b': { type: 'dir', nodes: false },

  '/root/skip-content': { type: 'dir', nodes: ['a', 'b'] },
  '/root/skip-content/a': { type: 'file', content: 'aaa', size: 3 },
  '/root/skip-content/b': { type: 'file', content: 'bbbb', size: 4 },

   // In order to check the `flatten` helper (especially the `.sort()` part),
   // some nodes are unordered (*):
   //     - ['folder', 'b'] instead of ['b', 'folder']
   //     - ['d', 'c'] instead of ['c', 'd']
   // (see `helper.spec.ts` for more details)
  '/root/deep-dirs': { type: 'dir', nodes: ['a', 'folder'] },
  '/root/deep-dirs/a': { type: 'file', content: 'a', size: 1 },
  '/root/deep-dirs/folder': { type: 'dir', nodes: ['folder', 'b'] }, // (*) unordered
  '/root/deep-dirs/folder/b': { type: 'file', content: 'bb', size: 2 },
  '/root/deep-dirs/folder/folder': { type: 'dir', nodes: ['d', 'c'] }, // (*) unordered
  '/root/deep-dirs/folder/folder/c': { type: 'file', content: 'ccc', size: 3 },
  '/root/deep-dirs/folder/folder/d': { type: 'file', content: 'dddd', size: 4 },

  '/root/sort': { type: 'dir', nodes: ['c', 'b', 'a', 'e', 'd'] }, // Notice that 'a' is in error!
  '/root/sort/c': { type: 'file', content: '', size: 0 },
  '/root/sort/b': { type: 'dir', nodes: [] },
  '/root/sort/e': { type: 'dir', nodes: [] },
  '/root/sort/d': { type: 'file', content: '', size: 0 },

  '/root/clean': { type: 'dir', nodes: ['a', 'b', 'c', 'd'] },
  '/root/clean/a': { type: 'file', content: 'aaa', size: 3 },
  '/root/clean/b': { type: 'dir', nodes: [] }, // empty!
  '/root/clean/c': { type: 'dir', nodes: ['e'] },
  '/root/clean/c/e': { type: 'dir', nodes: [] }, // empty!
  '/root/clean/d': { type: 'dir', nodes: ['f'] },
  '/root/clean/d/f': { type: 'file', content: 'fff', size: 3 },

  '/root/glob': { type: 'dir', nodes: ['a.html', 'b'] },
  '/root/glob/a.html': { type: 'file', content: 'aaa', size: 3 },
  '/root/glob/b': { type: 'dir', nodes: ['c.css', 'd.html'] },
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
