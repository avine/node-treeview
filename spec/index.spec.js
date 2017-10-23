/* eslint-env jasmine */

const treeview = require('../index');

describe('treeview', () => {

  it('should list files', done => {
    treeview('sample/contents/sub2').then(result => {
      expect(result).toEqual([{name: 'd'}, {name: 'e'}]);
      done();
    });
  });

});
