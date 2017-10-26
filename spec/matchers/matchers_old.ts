////////////////
// DEPRECATED //
////////////////

import { TreeNode } from '../../src/model';

export const customMatchers: jasmine.CustomMatcherFactories = {

  toContainItem(util, customEqualityTesters) {
    return {
      compare: (actual: TreeNode[], expected: any): jasmine.CustomMatcherResult => {
        const result: jasmine.CustomMatcherResult = {
          message: 'Expected ' + JSON.stringify(actual) + ' to not contains ' + JSON.stringify(expected),
          pass: false
        };
        for (const actualItem of actual) {
          if (compareItems(actualItem, expected).areEqual) {
            // At least one of `actual` items is equal to `expected`
            result.pass = true;
            break;
          }
        }
        return result;
      },

      negativeCompare: (actual: TreeNode[], expected: any): jasmine.CustomMatcherResult => {
        const result: jasmine.CustomMatcherResult = {
          message: 'Expected ' + JSON.stringify(actual) + ' to not contains ' + JSON.stringify(expected),
          pass: true
        };
        for (const actualItem of actual) {
          if (!compareItems(actualItem, expected).areDifferent) {
            // At least one of `actual` items is not different to `expected`
            result.pass = true;
            break;
          }
        }
        return result;
      }
    };
  }

};

export const compareItems = (actual: TreeNode, expected: any) => {
  const items = {
    areDifferent: true,
    areEqual: true,
  };
  for (const prop in expected) {
    if (expected.hasOwnProperty(prop)) {
      if (expected[prop] === (actual as any)[prop]) {
        // The items are equal for at least one property
        items.areDifferent = false;
      } else {
        // The items are different for at least one property
        items.areEqual = false;
      }
    }
  }
  return items;
};
