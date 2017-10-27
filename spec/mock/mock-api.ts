import * as Model from '../../src/model';

import endpoints from './mock-endpoints';

// TODO: improve API...
export const providers: Model.IProviders = {
  sep: '/',

  normalize(path: string) {
    return path;
  },

  readFile(path: string, options, cb) {
    const endpoint = endpoints[path];
    if (endpoint && endpoint.type === 'file') {
      if (endpoint.content !== false) {
        cb(null, endpoint.content || '');
      } else {
        cb(new Error(`Unable to read file content "${path}"`), '');
      }
      return;
    }
    cb(new Error(`No such file "${path}"`), '');
  },

  readdir(path, cb) {
    const endpoint = endpoints[path];
    if (endpoint && endpoint.type === 'dir') {
      cb(null, endpoint.content || '');
      return;
    }
    cb(new Error(`No such dir "${path}"`), []);
  },

  stat(path: string, cb) {
    const endpoint = endpoints[path];
    if (endpoint) {
      cb(null, {
        size: endpoint.size,
        birthtime: endpoint.created,
        mtime: endpoint.modified,
        isDirectory() { return endpoint.type === 'dir'; },
        isFile() { return endpoint.type === 'file'; }
      });
      return;
    }
    cb(new Error(`No such stat "${path}"`));
  }
};
