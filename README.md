# node-treeview
A filesystem tree view for node.

- written in TypeScript
- 100% test coverage using Jasmine

[![Build Status](https://travis-ci.org/avine/node-treeview.svg?branch=master)](https://travis-ci.org/avine/node-treeview)

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
      "binary": false,
      "content": "file3 content"
    }, {
      "name": "logo.png",
      "path": "path/to/dir/subdir",
      "created": "2017-10-23T18:29:29.000Z",
      "modified": "2017-10-23T18:29:29.000Z",
      "type": "file",
      "size": 325,
      "binary": true,
      "content": "iVBORw0KGgoAAAANSUh..." //-> base64
    }]
  }
]
```

## Options

```ts
export interface IOpts {
  // Add files content to output
  content: boolean;
  // Maximum depth of directories
  depth: boolean | number;
  // List of directory paths to exclude from output
  exclude: string[];
  // Use relative path
  relative: boolean;
}
```

## Cli

```txt
node-treeview

Usage: node-treeview <path> [options]

Options:
  --version       Show version number                                       [boolean]
  --content, -c   Add files content to output.              [boolean] [default: true]
  --depth, -d     Maximum depth of directories. Use a boolean or a number.
                                                                     [default: false]
  --relative, -r  Use relative path.                       [boolean] [default: false]
  --exclude, -e   List of directory paths to exclude from output.
                                                                [array] [default: []]
  --help, -h      Show help                                                 [boolean]
```

## License

MIT @ [Avine](https://avine.io)
