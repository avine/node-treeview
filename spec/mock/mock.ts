
export const DATE = {
  MODIFIED: new Date(),
  CREATED: new Date( new Date().getTime() - 1000 * 60 * 60)
};

export const readdir = (path: any, cb: any) => {
  // cb('MOCK READDIR CALLBACK');

  cb(null, [
    'a',
    'b',
    'c'
  ]);
};

export const readFile = (path: any, cb: any) => {
  let data = 'unknown';

  switch (path) {
    case '/a': data = 'Content of a'; break;
    case '/b': data = 'Content of b'; break;
    case '/c': data = 'Content of c'; break;
  }
  cb(null, data);
};

export const stat = (path: any, cb: any) => {
  const stats = {
    birthtime: DATE.CREATED,
    mtime: DATE.MODIFIED,
    size: 55,
    isFile() { return true; },
    isDirectory() { return false; }
  };
  cb(null, stats);
};

export const normalize = (path: string) => path;

export const sep = '/';

/*
export const mock = [
    {
      name: 'a',
      path: 'C:\\Users\\stefr\\Documents\\Workspace\\node-treeview\\sample\\contents',
      created: '2017-10-23T07:57:21.477Z',
      modified: '2017-10-23T08:59:08.980Z',
      type: 'file',
      size: 3,
      content: 'aaa'
    },
    {
      name: 'sub2',
      path: 'C:\\Users\\stefr\\Documents\\Workspace\\node-treeview\\sample\\contents',
      created: '2017-10-23T07:57:21.493Z',
      modified: '2017-10-23T07:57:21.494Z',
      type: 'dir',
      content: [
        {
          name: 'd',
          path: 'C:\\Users\\stefr\\Documents\\Workspace\\node-treeview\\sample\\contents\\sub2',
          created: '2017-10-23T07:57:21.493Z',
          modified: '2017-10-23T08:59:05.065Z',
          type: 'file',
          size: 3,
          content: 'ddd'
        },
        {
          name: 'e',
          path: 'C:\\Users\\stefr\\Documents\\Workspace\\node-treeview\\sample\\contents\\sub2',
          created: '2017-10-23T07:57:21.494Z',
          modified: '2017-10-23T08:59:06.935Z',
          type: 'file',
          size: 3,
          content: 'eee'
        }
      ]
    },
    {
      name: 'sub1',
      path: 'C:\\Users\\stefr\\Documents\\Workspace\\node-treeview\\sample\\contents',
      created: '2017-10-23T07:57:21.484Z',
      modified: '2017-10-23T07:57:21.485Z',
      type: 'dir',
      content: [
        {
          name: 'c',
          path: 'C:\\Users\\stefr\\Documents\\Workspace\\node-treeview\\sample\\contents\\sub1',
          created: '2017-10-23T07:57:21.485Z',
          modified: '2017-10-23T08:53:50.284Z',
          type: 'file',
          size: 3,
          content: 'ccc'
        },
        {
          name: 'deep',
          path: 'C:\\Users\\stefr\\Documents\\Workspace\\node-treeview\\sample\\contents\\sub1',
          created: '2017-10-23T07:57:21.485Z',
          modified: '2017-10-23T07:57:21.492Z',
          type: 'dir',
          content: [
            {
              name: 'e',
              path: 'C:\\Users\\stefr\\Documents\\Workspace\\node-treeview\\sample\\contents\\sub1\\deep',
              created: '2017-10-23T07:57:21.485Z',
              modified: '2017-10-23T08:58:59.617Z',
              type: 'file',
              size: 3,
              content: 'eee'
            },
            {
              name: 'f',
              path: 'C:\\Users\\stefr\\Documents\\Workspace\\node-treeview\\sample\\contents\\sub1\\deep',
              created: '2017-10-23T07:57:21.492Z',
              modified: '2017-10-23T08:59:01.745Z',
              type: 'file',
              size: 3,
              content: 'fff'
            }
          ]
        }
      ]
    },
    {
      name: 'b',
      path: 'C:\\Users\\stefr\\Documents\\Workspace\\node-treeview\\sample\\contents',
      created: '2017-10-23T07:57:21.477Z',
      modified: '2017-10-23T08:59:11.538Z',
      type: 'file',
      size: 3,
      content: 'bbb'
    }
  ]
*/
