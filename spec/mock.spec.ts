// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { customMatchers } from './matchers/matchers';
import { TreeView } from '../src/index';
import { normalize, readFile, readdir, sep, stat, DATE } from './mock/mock';

class TreeViewMock extends TreeView {
  inject() {
    this.providers = { normalize, readFile, readdir, sep, stat };
  }
}

describe('TreeViewMock', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should works!', (done) => {
    new TreeViewMock().process('').then((result) => {
      expect(result).toContainItem({
        name: 'a', content: 'Content of a', created: DATE.CREATED, modified: DATE.MODIFIED
      });
      done();
    }, (error) => {
      // tslint:disable-next-line:no-console
      console.log('Failure', error);
      done();
    });
  });

});
