# node-treeview

Asynchronous filesystem tree view for node.

- 100% TypeScript
- 100% Jasmine test coverage

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
    // handle errors...
  }
});

// Using Promise
new TreeView(options).process(path).then(tree => {
  // do some stuff...
}).catch(error => {
  // handle errors...
});

// Using async/await
async function getJson() {
  let tree;
  try {
    tree = await new TreeView(options).process(path);
  } catch (error) {
    // handle errors...
  }
  // do some stuff...
}
getJson();
```

### Example

```js
const { TreeView } = require('node-treeview');

new TreeView({ content: true, depth: 2 })
  .process('path/to/dir')
  .then(tree => console.log(tree));
```

The output looks like the following `json`:

```json
[{
  "name": "file1.txt",
  "path": "path/to/dir",
  "pathname": "path/to/dir/file1.txt",
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
  "created": "2017-10-22T10:48:48.000Z",
  "modified": "2017-10-23T18:29:29.000Z",
  "type": "dir",
  "nodes": [{
    "name": "file2.txt",
    "path": "path/to/dir/subdir",
    "pathname": "path/to/dir/subdir/file2.txt",
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

It is also possible to listen to events.

Note:
Emitted file never have `content` property.
Emitted dir always have `nodes` property equal to an empty array.

```js
const { TreeView } = require('node-treeview');

new TreeView()
  .listen(data => console.log(`${data.type}: ${data.pathname}`))
  .process('path/to/dir')
  .then(() => console.log('done!'));
```

Output:

```txt
file: path/to/dir/file1.txt
dir: path/to/dir/subdir
file: path/to/dir/subdir/file2.txt
file: path/to/dir/subdir/logo.png
done!
```

## TypeScript

### Interface overview

```ts
// Basic interface of files and directories (used for unreadable resource)
export interface IRef {
  name: string;
  path: string;
  pathname: string;
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
```

### Options

```ts
export interface IOptsParam {
  // Include hidden files in output
  all?: boolean;
  // Add files content to output
  content?: boolean;
  // Use relative path
  relative?: boolean;
  // Maximum depth of directories
  depth?: number;
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

### Using type

```ts
import { TreeView } from 'node-treeview';
import * as Model from 'node-treeview/model'

const options: Model.IOptsParam = { depth: 2 };
const path = 'path/to/dir';

const promise: Promise<TreeNode[]> =
  new TreeView(options).process(path);

promise.then(tree => {
  tree.forEach(item => {
    if ((item as Model.IDir).type === 'dir') {
      // do some stuff...
    } else if ((item as Model.IFile).type === 'file') {
      // do some stuff...
    }  else if ((item as Model.IRef).error) {
      // do some stuff...
    }
  });
});
```

## Helper

### flatten

If you need a flat version of the tree, use the `flatten` helper.

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

The output looks like the following `json`:

```json
[{
  "name": "file1.txt",
  "path": "path/to/dir",
  "pathname": "path/to/dir/file1.txt",
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
  "created": "2017-10-23T18:29:29.000Z",
  "modified": "2017-10-23T18:29:29.000Z",
  "type": "file",
  "size": 325,
  "ext": "png",
  "binary": true
}]
```

### clean

If you need to clean empty directories from the tree, use the `clean` helper.

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

If you need to pretty-print the tree, use the `pretty` helper.

```ts
import { TreeView } from 'node-treeview';
import { pretty } from 'node-treeview/helper';

new TreeView().process('path/to/dir').then(tree => {
  console.log(pretty(tree));
});
```

The output looks like the following `txt`:

```txt
├─ fruits
│  ├─ apple.txt
│  └─ pears.txt
└─ vegetables
   ├─ bean.txt
   ├─ potato.txt
   └─ endive.txt
```

And you have full control over how to render the tree.

```ts
import { TreeView } from 'node-treeview';
import { pretty } from 'node-treeview/helper';
import { renderer } from 'node-treeview/helper/pretty';

new TreeView().process('path/to/dir').then(tree => {
  console.log(pretty(tree, renderer.light));
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
  --relative, -r  Use relative path                                               [boolean]
  --depth, -d     Maximum depth of directories                       [number] [default: -1]
  --include, -i   List of directory paths to include in output                      [array]
  --exclude, -e   List of directory paths to exclude from output                    [array]
  --glob, -g      Match files based on glob pattern                                 [array]
  --sort, -s      Sort output 0 (Alpha), 1 (FileFirst), 2 (DirFirst)  [number] [default: 0]
  --clean, -n     Clean empty directories from output                             [boolean]
  --flatten, -f   Flatten output                                                  [boolean]
  --pretty, -p    Pretty-print output                                              [string]
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
