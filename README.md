# node-treeview
Asynchronous filesystem tree view for node.

- 100% TypeScript
- 100% Jasmine test coverage

[![Build Status](https://travis-ci.org/avine/node-treeview.svg?branch=master)](https://travis-ci.org/avine/node-treeview)

## Javascript

### Usage

```js
const TreeView = require('node-treeview');

// Using callback interface
new TreeView(options).process(path, (error, json) => {
  // do some stuff...
});

// or Using Promise interface
new TreeView(options).process(path).then(json => {
  // do some stuff...
}).catch(error => {
  // handle errors...
});
```

### Example

```js
const TreeView = require('node-treeview');
new TreeView({ content: true, depth: 2 }).process('path/to/dir').then(json => console.log(json));
```

The output looks like the following `json`:

```json
[{
    "name": "file1.txt",
    "path": "path/to/dir",
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
    "created": "2017-10-22T10:48:48.000Z",
    "modified": "2017-10-23T18:29:29.000Z",
    "type": "dir",
    "content": [{
      "name": "file2.txt",
      "path": "path/to/dir/subdir",
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
      "created": "2017-10-23T18:29:29.000Z",
      "modified": "2017-10-23T18:29:29.000Z",
      "type": "file",
      "size": 325,
      "ext": "png",
      "binary": true,
      "content": "iVBORw0KGgoAAAANSUh..." //-> base64
    }]
  }
]
```

## TypeScript

### Interface and type (basics)

```ts
// Unreadable file or directory
export interface IRef {
  name: string;
  path: string;
  error?: any;
}

// File interface
export interface IFile extends IRef {
  type: 'file';
  content: string;
  created: Date;
  modified: Date;
  size: number;
  ext: string;
  binary: boolean;
}

// Directory interface
export interface IDir extends IRef {
  type: 'dir';
  content: TreeNode[];
  created: Date;
  modified: Date;
}

// Finally, the `TreeView.process` method returns a `Promise<TreeNode[]>`
export type TreeNode = IFile | IDir | IRef;
```

### Options

```ts
export interface IOptsParam {
  // Add files content to output
  content?: boolean;
  // Maximum depth of directories
  depth?: boolean | number;
  // List of directory paths to exclude from output
  exclude?: string[];
  // Use relative path
  relative?: boolean;
}
```

### Example

```ts
import { TreeView } from 'node-treeview';
import * as Model from 'node-treeview/model'

const options: Model.IOptsParam = { depth: 2 };
const path = 'path/to/dir';

new TreeView(options).process(path).then(json => {
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

## Cli

```txt
node-treeview

Usage: node-treeview <path> [options]

Options:
  --version       Show version number                                              [boolean]
  --content, -c   Add files content to output.                    [boolean] [default: false]
  --depth, -d     Maximum depth of directories.          [boolean | number] [default: false]
  --relative, -r  Use relative path.                              [boolean] [default: false]
  --exclude, -e   List of directory paths to exclude from output.      [array] [default: []]
  --help, -h      Show help                                                        [boolean]
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
