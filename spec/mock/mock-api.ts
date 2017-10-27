import * as Model from '../../src/model';

import endpoints from './mock-endpoints';

export const providers: Model.IProviders = {
  sep: '/',

  normalize(path: string) {
    return path;
  },

  readFile(path: string, options, cb) {
    const endpoint = endpoints[path];
    if (endpoint && endpoint.type === 'file') {
      cb(null, endpoint.content || '');
      return;
    }
    cb(new Error('No such file'), '');
  },

  readdir(path, cb) {
    const endpoint = endpoints[path];
    if (endpoint && endpoint.type === 'dir') {
      cb(null, endpoint.content || '');
      return;
    }
    cb(new Error('No such dir'), []);
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
    cb(new Error('No such stat'));
  }
};
