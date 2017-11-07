// tslint:disable:no-var-requires

const { resolve } = require('path');

// The folder published to NPM is: `[node-treeview]/dist/src`
const npmPkgRoot = resolve(__dirname, '../src');

const path2Index = resolve(npmPkgRoot/*, './index'*/);
const path2Flatten = resolve(npmPkgRoot, './helper/flatten');

describe('TreeView require', () => {
  it('should require and use TreeView() and flatten()', (done) => {
    // Check that `TreeView` and `flatten` can be required...
    const TreeView = require(path2Index).TreeView;
    const flatten = require(path2Flatten).flatten;

    // ...and used ;-) [notice: we arbitrary process the current `__dirname`]
    new TreeView().process(__dirname).then((result: any) => {
      const flat = flatten(result);
      // console.log(JSON.stringify(flat, undefined, 2));
      done();
    });
  });
});
