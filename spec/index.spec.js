/* eslint-env jasmine */

const TreeView = require('../index');

describe('treeview', () => {

  it('should list files', done => {
    TreeView.process('sample/contents/sub2').then(result => {
      expect(result).toContain(jasmine.objectContaining({ name: 'd', type: 'file' }));
      expect(result).toContain(jasmine.objectContaining({ name: 'e', type: 'file' }));
      done();
    });
  });

  it('should list files and dir', done => {
    TreeView.process('sample/contents/sub1').then(result => {
      expect(result).toContain(jasmine.objectContaining({ name: 'c', type: 'file' }));
      expect(result).toContain(jasmine.objectContaining({ name: 'deep', type: 'directory' }));
      done();
    });
  });

});
