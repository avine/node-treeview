import { TreeNode } from '../../src/model';

export const customMatchers: jasmine.CustomMatcherFactories = {

  /**
   * This custom matcher is like:
   *    expect(...).toContain(jasmine.objectContaining(...));
   * with customized message.
   */
  toContainItem(util, customEqualityTesters) {
    return {
      compare: (actual: TreeNode[], expected: any): jasmine.CustomMatcherResult => {
        customEqualityTesters.push(customEqualityTester);
        const result: jasmine.CustomMatcherResult = {
          pass: util.contains(actual, expected, customEqualityTesters)
        };
        if (result.pass) {
          result.message = 'Expected ' + stringify(actual) + ' to NOT contains item ' + JSON.stringify(expected);
        } else {
          result.message = 'Expected ' + stringify(actual) + ' to contains item ' + JSON.stringify(expected);
        }
        return result;
      }
    };
  }

};

export const customEqualityTester = (actual: TreeNode, expected: any) => {
  for (const prop in expected) {
    if (expected.hasOwnProperty(prop)) {
      if (!jasmine.matchersUtil.equals(expected[prop], (actual as any)[prop])) {
        return false;
      }
    }
  }
  return true;
};

const stringify = (data: any) => JSON.stringify(data, undefined, 2);
