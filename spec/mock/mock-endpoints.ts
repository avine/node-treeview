// tslint:disable:object-literal-key-quotes

export const DATE = {
  MODIFIED: new Date(),
  CREATED: new Date( new Date().getTime() - 1000 * 60 * 60)
};

const entrepoints: { [index: string]: { [index: string]: any } } = {

  'empty-dir':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: [] },

  'files':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['a', 'b'] },
  'files/a':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: 'aaa', size: 3 },
  'files/b':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: 'bbbb', size: 4 },

  'skip-hidden':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['.hidden', 'visible'] },
  'skip-hidden/.hidden':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: 'xxx', size: 3 },
  'skip-hidden/visible':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: 'ok', size: 2 },

  'binary':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['a.txt', 'b.png'] },
  'binary/a.txt':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: '', size: 0 },
  'binary/b.png':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: '', size: 0 },

  'dirs':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['a', 'b'] },
  'dirs/a':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: [] },
  'dirs/b':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: [] },

  'sub-dirs':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['a', 'b'] },
  'sub-dirs/a':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: 'aaa', size: 3 },
  'sub-dirs/b':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['c', 'd'] },
  'sub-dirs/b/c':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: 'ccc', size: 3 },
  'sub-dirs/b/d':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: 'ddd', size: 3 },

  'sub-dir-not-found':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['oups'] },

  'not-readable-eagerly':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: false },

  'not-readable-lazily':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['a', 'b'] },
  'not-readable-lazily/a':
    { type: 'file', content: false },
  'not-readable-lazily/b':
    { type: 'dir', content: false },

  'skip-content':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['a', 'b'] },
  'skip-content/a':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: 'aaa', size: 3 },
  'skip-content/b':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: 'bbbb', size: 4 },

   // In order to check the `flatten` helper (especially the `.sort()` part),
   // some contents are unordered (*):
   //     - ['folder', 'b'] instead of ['b', 'folder']
   //     - ['d', 'c'] instead of ['c', 'd']
   // (see `helper.spec.ts` for more details)
  'deep-dirs':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['a', 'folder'] },
  'deep-dirs/a':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: 'a', size: 1 },
  'deep-dirs/folder':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['folder', 'b'] }, // (*) unordered
  'deep-dirs/folder/b':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: 'bb', size: 2 },
  'deep-dirs/folder/folder':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['d', 'c'] }, // (*) unordered
  'deep-dirs/folder/folder/c':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: 'ccc', size: 3 },
  'deep-dirs/folder/folder/d':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: 'dddd', size: 4 },

  };

export default entrepoints;
