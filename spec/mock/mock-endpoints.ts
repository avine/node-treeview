// tslint:disable:object-literal-key-quotes

export const DATE = {
  MODIFIED: new Date(),
  CREATED: new Date( new Date().getTime() - 1000 * 60 * 60)
};

const entrepoints: { [index: string]: { [index: string]: any } } = {

  'test1':
    { type: 'dir', created: DATE.CREATED, modified: DATE.MODIFIED, content: ['a'] },

  'test1/a':
    { type: 'file', created: DATE.CREATED, modified: DATE.MODIFIED, content: 'aaa', size: 3 },

};

export default entrepoints;
