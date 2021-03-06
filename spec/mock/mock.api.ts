import * as Model from '../../src/model';

export interface IEndpoints {
  [index: string]: { [index: string]: any };
}

export function providersFactory(endpoints: IEndpoints): Model.IProviders {
  return {
    /**
     * Join non empty parts of the path.
     *
     * @example join('', './a/', './', '', 'b', './c', '') === 'a/b/c'
     */
    join(...path: any[]) {
      return path
        .map(p => p.replace(/^\.\//, ''))
        .filter(p => p)
        .join('/')
        .replace(/\/+/g, '/');
    },

    /**
     * Resolve path by adding `/root` at the begining
     *
     * @example resolve('', './a/', './', '', 'b', './c', '') === '/root/a/b/c'
     */
    resolve(...path: any[]) {
      const joined = this.join(...path);
      return joined.startsWith('/') ? joined : this.join('/root', joined);
    },

    /**
     * Remove `from` at the beginning of `to`.
     * Also remove `/` at the beginning.
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
        if (endpoint.nodes !== false) {
          cb(null, endpoint.nodes || []);
        } else {
          cb(new Error(`Unable to read directory child nodes: "${path}"`), []);
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
}
