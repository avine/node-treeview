/* eslint-env jasmine */

const TreeView = require('../index');

describe('treeview', () => {

  it('should list files (Promise interface)', done => {
    TreeView.process('sample/contents/sub2').then(result => {
      expect(result).toContain(jasmine.objectContaining({ name: 'd', type: 'file' }));
      expect(result).toContain(jasmine.objectContaining({ name: 'e', type: 'file' }));
      done();
    });
  });

  it('should list files and dir (callback interface)', done => {
    TreeView.process('sample/contents/sub1', result => {
      expect(result).toContain(jasmine.objectContaining({ name: 'c', type: 'file' }));
      expect(result).toContain(jasmine.objectContaining({ name: 'deep', type: 'dir' }));
      done();
    });
  });

});
