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
new TreeView(options).process(path, (error, json) => {
  if (error) {
    // handle errors...
  } else {
    // do some stuff...
  }
});

// Using Promise
new TreeView(options).process(path).catch(error => {
  // handle errors...
}).then(json => {
  // do some stuff...
});

// Using async/await
async function getJson() {
  let json;
  try {
    json = await new TreeView(options).process(path);
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
  .process('path/to/dir').then(json => console.log(json));
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
  "content": [{
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

## TypeScript

### Interfaces basics

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
  content: string;
  created: Date;
  modified: Date;
  size: number;
  ext: string;
  binary: boolean;
}

export interface IDir extends IRef {
  type: 'dir';
  content: TreeNode[];
  created: Date;
  modified: Date;
}

// The final output is of type: `TreeNode[]`
// and the `TreeView.process` method returns a `Promise<TreeNode[]>`
export type TreeNode = IFile | IDir | IRef;
```

### Options

```ts
export interface IOptsParam {
  // Add files content to output
  content?: boolean;
  // Use relative path
  relative?: boolean;
  // Maximum depth of directories
  depth?: boolean | number;
  // List of directory paths to exclude from output
  exclude?: string[];
  // Match files based on glob pattern
  pattern?: string[];
}
```

### Example with options

```ts
import { TreeView } from 'node-treeview';
import * as Model from 'node-treeview/model'

const options: Model.IOptsParam = { depth: 2 };
const path = 'path/to/dir';

const promise: Promise<TreeNode[]> =
  new TreeView(options).process(path);

promise.then(json => {
  json.forEach(item => {
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
import { flatten } from 'node-treeview/helper/flatten';

new TreeView().process('path/to/dir').then(json => {
  const flat = flatten(json);
  console.log(flat);
});
```

Or for JavaScript style using `require`:

```js
const { TreeView } = require('node-treeview');
const { flatten } = require('node-treeview/helper/flatten');
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
import { clean } from 'node-treeview/helper/clean';

new TreeView().process('path/to/dir').then(json => {
  const cleaned = clean(json);
  console.log(cleaned);
});
```

Or for JavaScript style using `require`:

```js
const { TreeView } = require('node-treeview');
const { clean } = require('node-treeview/helper/clean');
// ...
```

## Cli

```txt
node-treeview

Usage: node-treeview <path> [options]

Options:
  --version, -v   Show version number                                              [boolean]
  --help, -h      Show help                                                        [boolean]
  --content, -c   Add files content to output                     [boolean] [default: false]
  --relative, -r  Use relative path                               [boolean] [default: false]
  --depth, -d     Maximum depth of directories            [boolean|number]  [default: false]
  --flatten, -f   Flatten output                                  [boolean] [default: false]
  --clean, -n     Clean empty directories from output             [boolean] [default: false]
  --exclude, -e   List of directory paths to exclude from output       [array] [default: []]
  --pattern, -p   Match files based on glob pattern                    [array] [default: []]
  --output, -o    Output file path                                                  [string]
  --debug         Add debugging information to output             [boolean] [default: false]
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
