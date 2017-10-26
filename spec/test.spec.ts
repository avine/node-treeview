// tslint:disable-next-line:no-reference
/// <reference path='./matchers/matchers.d.ts' />

function log(data: any) {
  // tslint:disable-next-line:no-console
  console.log(JSON.stringify(data, undefined, 2));
}

import { TreeView } from '../src/index';
import { customMatchers } from './matchers/matchers';

describe('TreeView test1', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should handle path error', (done) => {
    new TreeView().process('oups').catch((error) => {
      expect(error).toBeDefined();
      done();
    });
  });

  it('should read empty dir', (done) => {
    new TreeView().process('spec/sample/test1').then((result) => {
      expect(result.length).toEqual(0);
      done();
    });
  });
});

describe('TreeView test2', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should read files', (done) => {
    new TreeView().process('spec/sample/test2/files').then((result) => {
      expect(result.length).toEqual(2);
      expect(result).toContainItem({ name: 'a', type: 'file' });
      expect(result).toContainItem({ name: 'b', type: 'file' });
      done();
    });
  });

  it('should read dirs', (done) => {
    new TreeView().process('spec/sample/test2/dirs').then((result) => {
      expect(result.length).toEqual(2);
      expect(result).toContainItem({ name: 'a', type: 'dir' });
      expect(result).toContainItem({ name: 'b', type: 'dir' });
      done();
    });
  });
});

describe('TreeView test3', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should read dir and files', (done) => {
    new TreeView().process('spec/sample/test3').then((result) => {
      expect(result.length).toEqual(4);

      expect(result).toContainItem({ name: 'c', type: 'file' });
      expect(result).toContainItem({ name: 'd', type: 'file' });

      expect(result).toContainItem({ name: 'a', type: 'dir' });
      expect(result).toContainItem({ name: 'b', type: 'dir' });

      done();
    });
  });
});

describe('TreeView all!', () => {
  beforeEach(() => jasmine.addMatchers(customMatchers));

  it('should read dir and files', (done) => {
    new TreeView().process('spec/sample').then((result) => {
      log(result);

      done();
    });
  });
});
