// tslint:disable:no-var-requires

const { resolve } = require('path');

// Root of the package that is published to NPM
const npmPkgRoot = resolve('dist/src');

// Path to the `main` entry point and the `flatten` helper
const treeViewPath = resolve(npmPkgRoot/*, './index'*/);
const flattenPath = resolve(npmPkgRoot, './helper/flatten');

const basePath = resolve('spec/fixture');

// tslint:disable-next-line:no-console
// const log = (data: any) => console.log(JSON.stringify(data, undefined, 2));

describe('TreeView require', () => {
  it('should require and use TreeView() and flatten()', (done) => {
    // Check that `TreeView` and `flatten` can be required...
    const { TreeView } = require(treeViewPath);
    const { flatten } = require(flattenPath);

    // ...and used ;-)
    new TreeView().process(basePath).then((result: any) => {
      const flat = flatten(result);
      // log(flat);
      done();
    });
  });
});
