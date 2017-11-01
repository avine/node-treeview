import * as Model from '../../src/model';
import endpoints from './mock-endpoints';

export const providers: Model.IProviders = {
  /**
   * Join non empty parts of the path.
   * Remove duplicate `/` from the return.
   *
   * @example resolve('', 'a/', '', '/b', 'c', '') === 'a/b/c'
   */
  resolve(...path: any[]) {
    return path.filter(p => p).join('/').replace(/\/+/g, '/');
  },

  /**
   * Remove `from` at the beginning of `to`.
   * Also remove `/` at the beginning of the return.
   *
   * @example relative('/a/b', '/a/b/c/d') === 'c/d'
   */
  relative(from: string, to: string) {
    return to.replace(new RegExp('^' + from), '').replace(/^\//, '');
  },

  readFile(path, options, cb) {
    const endpoint = endpoints[path];
    if (endpoint && endpoint.type === 'file') {
      if (endpoint.content !== false) {
        cb(null, endpoint.content || '');
      } else {
        cb(new Error(`Unable to read file content: "${path}"`), '');
      }
    } else {
      cb(new Error(`Unable to find file: "${path}"`), '');
    }
  },

  readdir(path, cb) {
    const endpoint = endpoints[path];
    if (endpoint && endpoint.type === 'dir') {
      if (endpoint.content !== false) {
        cb(null, endpoint.content || []);
      } else {
        cb(new Error(`Unable to read directory content: "${path}"`), []);
      }
    } else {
      cb(new Error(`Unable to find directory: "${path}"`), []);
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
      cb(new Error(`Unable to retrieve stat: "${path}"`), {} as Model.IStats);
    }
  }
};
