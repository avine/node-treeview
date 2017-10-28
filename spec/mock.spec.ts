// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

// tslint:disable:no-console

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

  it('should handle bad path', (done) => {
    new TreeViewMock().process('oups').catch((error) => {
      expect(error instanceof Error).toBeTruthy();
      done();
    });
  });

  it('should read files and more...', (done) => {
    new TreeViewMock().process('test1').then((result) => {
      expect(result).toContainItem({ name: 'a', content: 'aaa' });
      expect(result).toContainItem({ name: 'oups' });

      expect(result[1].error instanceof Error).toBeTruthy();
      done();
    });
  });

});
