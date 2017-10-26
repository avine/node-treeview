// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { TreeView } from '../src/index';
import { customMatchers } from './matchers/matchers';

describe('treeview', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should list files (Promise interface)', (done) => {
    TreeView.process('sample/contents/sub2').then((result) => {
      expect(result).toContainItem({ name: 'd', type: 'file' });
      expect(result).toContainItem({ name: 'e', type: 'file' });
      done();
    });
  });

  it('should list files and dir (callback interface)', (done) => {
    TreeView.process('sample/contents/sub1', (result) => {
      expect(result).toContainItem({ name: 'c', type: 'file' });
      expect(result).toContainItem({ name: 'deep', type: 'dir' });
      done();
    });
  });

});
