# node-treeview

Asynchronous filesystem tree view for node.

[![Build Status](https://travis-ci.org/avine/node-treeview.svg?branch=master)](https://travis-ci.org/avine/node-treeview)

## Javascript (quick start)

### Usage

```js
const { TreeView } = require('node-treeview');

// Using callback
new TreeView(options).process(path, (error, tree) => {
  if (tree) {
    // do some stuff...
  } else {
    // handle error...
  }
});

// Using Promise
new TreeView(options).process(path).then(tree => {
  // do some stuff...
}).catch(error => {
  // handle error...
});

// Using async/await
async function getTree() {
  let tree;
  try {
    tree = await new TreeView(options).process(path);
  } catch (error) {
    // handle error...
  }
  // do some stuff...
}
getTree();
```

### Example

```js
const { TreeView } = require('node-treeview');

new TreeView({ content: true, depth: 2 })
  .process('path/to/dir')
  .then(tree => console.log(tree));
```

Here is what the `json` output looks like:

```json
[{
  "name": "file1.txt",
  "path": "path/to/dir",
  "pathname": "path/to/dir/file1.txt",
  "depth": 0,
  "created": "2017-10-23T18:29:28.000Z",
  "modified": "2017-10-23T18:29:28.000Z",
  "type": "file",
  "size": 13,
  "ext": "txt",
  "binary": false,
  "content": "file1 content"
}, {
  "name": "subdir",
  "path": "path/to/dir",
  "pathname": "path/to/dir/subdir",
  "depth": 0,
  "created": "2017-10-22T10:48:48.000Z",
  "modified": "2017-10-23T18:29:29.000Z",
  "type": "dir",
  "nodes": [{
    "name": "file2.txt",
    "path": "path/to/dir/subdir",
    "pathname": "path/to/dir/subdir/file2.txt",
    "depth": 1,
    "created": "2017-10-23T18:29:28.000Z",
    "modified": "2017-10-23T18:29:29.000Z",
    "type": "file",
    "size": 13,
    "ext": "txt",
    "binary": false,
    "content": "file3 content"
  }, {
    "name": "logo.png",
    "path": "path/to/dir/subdir",
    "pathname": "path/to/dir/subdir/logo.png",
    "depth": 1,
    "created": "2017-10-23T18:29:29.000Z",
    "modified": "2017-10-23T18:29:29.000Z",
    "type": "file",
    "size": 325,
    "ext": "png",
    "binary": true,
    "content": "iVBORw0KGgoAAAANSUh..." //-> base64
  }]
}]
```

The `TreeView` lets you listen to `item` events.

> Emitted file never have `content` property,
emitted dir always have `nodes` property equal to an empty array.

```js
const { TreeView } = require('node-treeview');

new TreeView()
  .on('item', data => console.log(`${data.type}: ${data.pathname}`))
  .process('path/to/dir')
  .then(() => console.log('done!'));
```

Here is what the `txt` output looks like:

```txt
file: path/to/dir/file1.txt
dir: path/to/dir/subdir
file: path/to/dir/subdir/file2.txt
file: path/to/dir/subdir/logo.png
done!
```

The `TreeView` lets you process trees in parallel.

```js
const { TreeView } = require('node-treeview');

const treeView = new TreeView({
  relative: true
}).on('item', (data, ctx) => {
  // Listen to each emitted data in its own context
  // ('path/to/dir1' or 'path/to/dir2')
  console.log(`${ctx.rootPath} -> ${data.pathname}`);
});

Promise.all[
  // Use the same TreeView instance to process different
  // paths in parallel with the same options
  treeView.process('path/to/dir1'),
  treeView.process('path/to/dir2')
].then((trees) => {
  const [tree1, tree2] = trees;
  console.log(tree1);
  console.log(tree2);
});
```

The `TreeView` lets you watch the filesystem.

> Under the hood, the `watch` feature is provided by `fs.watch` on Mac and Windows, and `chokidar` on other platforms.

```js
const { TreeView } = require('node-treeview');

const treeView = new TreeView();

treeview
  .on('item'), (item) => {/* Item emitted (discovered, added, modified or removed) */})

  .on('ready'), (tree) => {/* Initial tree available */})

  .on('add'), (item) => {/* Item added */})
  .on('change'), (item) => {/* Item modified */})
  .on('unlink'), (item) => {/* Item removed */})

  .on('tree'), (tree) => {/* Refreshed tree available (after 'add', 'change' or 'unlink' event) */})

  .on('all'), (event, data) => {/* Listen to all events */});

// Start watching
const watcher = treeview.watch('path/to/dir');

// Stop watching after 1mn
setTimeout(watcher.close, 60000);
```

> You should NOT process trees in parallel when you watch the filesystem.
Otherwise the `watch` method will NOT work properly.

## TypeScript

### Interface overview

```ts
// Basic interface of files and directories (used for unreadable resource)
export interface IRef {
  name: string;
  path: string;
  pathname: string;
  depth: number;
  error?: any;
}

export interface IFile extends IRef {
  type: 'file';
  created: Date;
  modified: Date;
  size: number;
  ext: string;
  binary: boolean;
  content?: string;
}

export interface IDir extends IRef {
  type: 'dir';
  created: Date;
  modified: Date;
  nodes: TreeNode[];
}

// The final output is of type: `TreeNode[]`
// and the `TreeView.process` method returns a `Promise<TreeNode[]>`
export type TreeNode = IFile | IDir | IRef;

// List of emitted events
export type Event
  = 'item'
  | 'ready'
  | 'tree'
  | 'add'
  | 'change'
  | 'unlink'
  | 'all';
```

### Options

```ts
export interface IOptsParam {
  // Include hidden files in output
  all?: boolean;
  // Add files content to output
  content?: boolean;
  // Maximum depth of directories
  depth?: number;
  // Use relative path
  relative?: boolean;
  // List of directory paths to include in output
  include?: string[];
  // List of directory paths to exclude from output
  exclude?: string[];
  // Match files based on glob pattern
  glob?: string[];
  // Sort output
  sort?: Sorting;
}

// Tree sort type
export enum Sorting {
  Alpha,
  FileFirst,
  DirFirst
}
```

### Using typing

```ts
import { TreeView } from 'node-treeview';
import * as Model from 'node-treeview/model'

const options: Model.IOptsParam = { depth: 2 };
const path = 'path/to/dir';

const promise: Promise<TreeNode[]> =
  new TreeView(options).process(path);

promise.then(tree => {
  tree.forEach(item => {
    if ((item as Model.IRef).error) {
      // handle error...
    } else if ((item as Model.IDir).type === 'dir') {
      // handle directory...
    } else if ((item as Model.IFile).type === 'file') {
      // handle file...
    }
  });
});
```

## Helper

### flatten

The `flatten` helper lets you get a flat version of the tree.

```ts
import { TreeView } from 'node-treeview';
import { flatten } from 'node-treeview/helper';

new TreeView().process('path/to/dir').then(tree => {
  const flat = flatten(tree);
  console.log(flat);
});
```

Or for JavaScript style using `require`:

```js
const { TreeView } = require('node-treeview');
const { flatten } = require('node-treeview/helper');
// ...
```

Here is what the `json` output looks like:

```json
[{
  "name": "file1.txt",
  "path": "path/to/dir",
  "pathname": "path/to/dir/file1.txt",
  "depth": 0,
  "created": "2017-10-23T18:29:28.000Z",
  "modified": "2017-10-23T18:29:28.000Z",
  "type": "file",
  "size": 13,
  "ext": "txt",
  "binary": false
}, {
  "name": "file2.txt",
  "path": "path/to/dir/subdir",
  "pathname": "path/to/dir/subdir/file2.txt",
  "depth": 1,
  "created": "2017-10-23T18:29:28.000Z",
  "modified": "2017-10-23T18:29:29.000Z",
  "type": "file",
  "size": 13,
  "ext": "txt",
  "binary": false
}, {
  "name": "logo.png",
  "path": "path/to/dir/subdir",
  "pathname": "path/to/dir/subdir/logo.png",
  "depth": 1,
  "created": "2017-10-23T18:29:29.000Z",
  "modified": "2017-10-23T18:29:29.000Z",
  "type": "file",
  "size": 325,
  "ext": "png",
  "binary": true
}]
```

### clean

The `clean` helper lets you clean empty directories from the tree.

```ts
import { TreeView } from 'node-treeview';
import { clean } from 'node-treeview/helper';

new TreeView().process('path/to/dir').then(tree => {
  const cleaned = clean(tree);
  console.log(cleaned);
});
```

Or for JavaScript style using `require`:

```js
const { TreeView } = require('node-treeview');
const { clean } = require('node-treeview/helper');
// ...
```

### pretty

The `pretty` helper lets you pretty-print the tree.

```ts
import { TreeView } from 'node-treeview';
import { pretty } from 'node-treeview/helper';

new TreeView().process('path/to/dir').then(tree => {
  console.log(pretty(tree));
});
```

Here is what the `txt` output looks like:

```txt
├─ fruits
│  ├─ apple.txt
│  └─ pears.txt
└─ vegetables
   ├─ bean.txt
   ├─ potato.txt
   └─ endive.txt
```

With the `pretty` helper you have full control over how to render the tree.

```ts
import { TreeView } from 'node-treeview';
import { pretty } from 'node-treeview/helper';

new TreeView().process('path/to/dir').then(tree => {
  console.log(
    pretty(tree, (box: string, item: Model.TreeNode) => {
      if ((item as Model.IDir).type === 'dir') {
        return box + `(${item.name})`;
      } else if ((item as Model.IFile).type === 'file') {
        return box + item.name + ` [${(item as Model.IFile).size} bytes]`;
      } else {
        return box + item.name;
      }
    })
  );
});
```

Here is what the `txt` output looks like:

```txt
├─ (fruits)
│  ├─ apple.txt [51 bytes]
│  └─ pears.txt [24 bytes]
└─ (vegetables)
   ├─ bean.txt [13 bytes]
   ├─ potato.txt [87 bytes]
   └─ endive.txt [69 bytes]
```

And for quick rendering, use the predefined `renderer` functions.

```ts
import { TreeView } from 'node-treeview';
import { pretty } from 'node-treeview/helper';
import { renderer } from 'node-treeview/helper/pretty';

new TreeView().process('path/to/dir').then(tree => {
  console.log(pretty(tree, renderer.light));
  console.log(pretty(tree, renderer.dark));
});
```

## Cli

```txt
node-treeview

Usage: node-treeview <path> [options]

Options:
  --version, -v   Show version number                                             [boolean]
  --help, -h      Show help                                                       [boolean]
  --all, -a       Include hidden files in output                                  [boolean]
  --content, -c   Add files content to output                                     [boolean]
  --depth, -d     Maximum depth of directories                       [number] [default: -1]
  --relative, -r  Use relative path                                               [boolean]
  --include, -i   List of directory paths to include in output                      [array]
  --exclude, -e   List of directory paths to exclude from output                    [array]
  --glob, -g      Match files based on glob pattern                                 [array]
  --sort, -s      Sort output 0 (Alpha), 1 (FileFirst), 2 (DirFirst)  [number] [default: 0]
  --clean, -n     Clean empty directories from output                             [boolean]
  --flatten, -f   Flatten output                                                  [boolean]
  --pretty, -p    Pretty-print output                                              [string]
  --watch, -w     Watch filesystem                                                [boolean]
  --output, -o    Output file path                                                 [string]
  --debug         Add debugging information to output                             [boolean]
```

## Contribute

```bash
git clone https://github.com/avine/node-treeview.git
cd ./node-treeview
npm install
npm run all # npm run clean && npm run build && npm test
```

## License

MIT @ [Avine](https://avine.io)
