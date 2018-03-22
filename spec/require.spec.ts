// tslint:disable:no-var-requires

const { resolve } = require('path');

// Root of the package that is published to NPM
const npmPkgRoot = resolve('dist/src');

// Path to the `main` entry point, the `flatten` and `clean` helpers
const treeViewPath = resolve(npmPkgRoot/*, './index'*/);
const helperPath = resolve(npmPkgRoot, './helper');

const basePath = resolve('spec/fixture');

// tslint:disable-next-line:no-console
// const log = (data: any) => console.log(JSON.stringify(data, undefined, 2));

describe('TreeView require from ./dist', () => {
  it('should require and use TreeView(), flatten() and clean()', (done) => {
    // Check that `TreeView` and `flatten` can be required...
    const { TreeView } = require(treeViewPath);
    const { clean, flatten } = require(helperPath);

    // ...and used ;-)
    new TreeView().process(basePath).then((tree: any) => {
      const flat = flatten(tree);
      const cleaned = clean(tree);
      // log(flat);
      // log(cleaned);
      done();
    });
  });
});
