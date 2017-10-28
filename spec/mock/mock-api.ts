import * as Model from '../../src/model';
import endpoints from './mock-endpoints';

// TODO: improve API...
export const providers: Model.IProviders = {
  sep: '/',

  normalize(path) {
    return path;
  },

  readFile(path, options, cb) {
    const endpoint = endpoints[path];
    if (endpoint && endpoint.type === 'file') {
      cb(null, endpoint.content || '');
    } else {
      cb(new Error(`Unable to read file content: "${path}"`), '');
    }
  },

  readdir(path, cb) {
    const endpoint = endpoints[path];
    if (endpoint && endpoint.type === 'dir') {
      cb(null, endpoint.content || []);
    } else {
      cb(new Error(`Unable to read directory content: "${path}"`), []);
    }
  },

  stat(path: string, cb) {
    const endpoint = endpoints[path];
    if (endpoint) {
      const stat: any = {
        birthtime: endpoint.created,
        mtime: endpoint.modified,
        isDirectory() { return endpoint.type === 'dir'; },
        isFile() { return endpoint.type === 'file'; }
      };
      if (endpoint.type === 'file') {
        stat.size = endpoint.size || 0;
      }
      cb(null, stat);
    } else {
      cb(new Error(`Unable to retrieve stat: "${path}"`));
    }
  }
};
