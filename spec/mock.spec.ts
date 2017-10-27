// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { customMatchers } from './matchers/matchers';
import { TreeView } from '../src/index';

import { providers } from './mock/mock-api';

class TreeViewMock extends TreeView {
  inject() {
    this.providers = providers;
  }
}

describe('TreeViewMock', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should works!', (done) => {
    new TreeViewMock().process('test1').then((result) => {
      expect(result).toContainItem({
        name: 'a', content: 'aaa'
      });
      done();
    }, (error) => {
      // tslint:disable-next-line:no-console
      console.log('Failure', error);
      done();
    });
  });

});
