// tslint:disable:no-var-requires

const resolve = require('path').resolve;

// After the command `npm run build` is executed, this script location is:
//      `[node-treeview]/dist/spec/require.spec.js`.
//
// From this location, the `[node-treeview]/dist/src` folder location is:
const npmPkgRoot = resolve(__dirname, '../src');

// From `npmPkgRoot` (which is the root of the folder published to NPM),
// the packaged scripts locations are:
const indexJS = './index.js';
const flattenJS = './helper/flatten.js';
// const cliJS = './bin/cli.js';

const TreeView = require(resolve(npmPkgRoot, indexJS)).TreeView;
const flatten = require(resolve(npmPkgRoot, flattenJS)).flatten;

describe('TreeView require', () => {
  // Simply check that `TreeView` and `flatten` can be used...
  it('should find TreeView() and flatten()', (done) => {
    new TreeView().process(__dirname).then((result: any) => {
      const flat = flatten(result);
      // console.log(JSON.stringify(flat, undefined, 2));
      done();
    });
  });
});
