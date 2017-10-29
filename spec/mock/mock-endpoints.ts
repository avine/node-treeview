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

  'dirs':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['a', 'b'] },
  'dirs/a':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: [] },
  'dirs/b':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: [] },

  'not-found':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['oups'] },

  'not-readable':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['a', 'b'] },
  'not-readable/a':
    { type: 'file', content: false },
  'not-readable/b':
    { type: 'dir', content: false },

  };

export default entrepoints;
