# node-treeview
A filesystem tree view for node.

- written in TypeScript
- 100% test coverage using Jasmine

![Build Status](https://travis-ci.org/avine/node-treeview.svg?branch=master)

## Usage

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

## Example

```js
const TreeView = require('node-treeview');
new TreeView({ depth: 2 }).process('path/to/dir').then(json => console.log(json));
```

The output will looks like the following `json`:

```json
[{
    "name": "file1.txt",
    "path": "path/to/dir",
    "created": "2017-10-23T18:29:28.000Z",
    "modified": "2017-10-23T18:29:28.000Z",
    "type": "file",
    "size": 13,
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
      "content": "file3 content"
    }, {
      "name": "file3.txt",
      "path": "path/to/dir/subdir",
      "created": "2017-10-23T18:29:29.000Z",
      "modified": "2017-10-23T18:29:29.000Z",
      "type": "file",
      "size": 13,
      "content": "file3 content"
    }]
  }
]
```

## Options

```ts
export interface IOpts {
   // Set file encoding (ie: 'utf8')
  encoding: string;
  // Add files content to output
  content: boolean | number;
  // Maximum depth of directories
  depth: boolean | number;
  // List of directory paths to exclude from output
  exclude: string[];
}
```

## Cli

```txt
node-treeview

Usage: node-treeview <path> [options]

Options:
  --version      Show version number                                   [boolean]
  --content, -c  Add files content to output. Use a boolean or a number in
                 bytes.                                          [default: true]
  --depth, -d    Maximum depth of directories. Use a boolean or a number.
                                                                [default: false]
  --exclude, -e  List of directory paths to exclude from output.
                                                           [array] [default: []]
  --encoding     Set files encoding.                  [string] [default: "utf8"]
  --help, -h     Show help                                             [boolean]
```
