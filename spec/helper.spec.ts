// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

import { TreeView } from '../src/index';
import * as Model from '../src/model';

import { providers } from './mock/mock-api';

import { customMatchers } from './matchers/matchers';

import { flatten } from '../src/helper/flatten';
import { isBinaryPath } from '../src/helper/binary';

class TreeViewMock extends TreeView {
  inject() {
    this.providers = providers;
  }
}

// tslint:disable-next-line:no-console
// const log = (data: any) => console.log(JSON.stringify(data, undefined, 2));

describe('TreeView helper', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should flatten result', (done) => {
    new TreeViewMock().process('deep-dirs').then((result) => {
      const flat = flatten(result);

      // Check that `flat` is flatten and ordered
      expect([flat[0]]).toContainItem({ type: 'file', path: 'deep-dirs', name: 'a' });
      expect([flat[1]]).toContainItem({ type: 'file', path: 'deep-dirs/folder', name: 'b' });
      expect([flat[2]]).toContainItem({ type: 'file', path: 'deep-dirs/folder/folder', name: 'c' });
      expect([flat[3]]).toContainItem({ type: 'file', path: 'deep-dirs/folder/folder', name: 'd' });

      done();
    });
  });

  it('should check binary extensions', () => {
    expect(isBinaryPath('azerty')).toBeFalsy();
    expect(isBinaryPath('.azerty')).toBeFalsy();
    expect(isBinaryPath('azerty.txt')).toBeFalsy();

    expect(isBinaryPath('azerty.doc')).toBeTruthy();
    expect(isBinaryPath('azerty.pdf')).toBeTruthy();
    expect(isBinaryPath('azerty.png')).toBeTruthy();
  });
});
