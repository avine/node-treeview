import { watch as cWatchProvider } from 'chokidar';
import { watch as fWatchProvider } from 'fs';
import { relative, resolve } from 'path';

import * as Model from './model';

export const cWatch: Model.Watch = (rootPath: string, cb: Model.WatchCb, debounceTime = 100) => {
  let fullpaths: string[] = [];
  let timeout: NodeJS.Timer | null = null;

  const options = { ignoreInitial: true };

  const watcher = cWatchProvider(rootPath, options);
  watcher.on('all', (event, filename) => {
    if (!['change', 'add', 'addDir', 'unlink', 'unlinkDir'].includes(event)) {
      return;
    }
    const fullpath = resolve(rootPath, relative(rootPath, filename));
    if (!fullpaths.includes(fullpath)) {
      fullpaths.push(fullpath);
    }
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      cb(fullpaths);
      fullpaths = [];
    }, debounceTime);
  });

  return { close: () => watcher.close() };
};

export const fWatch: Model.Watch = (rootPath: string, cb: Model.WatchCb, debounceTime = 100) => {
  let fullpaths: string[] = [];
  let timeout: NodeJS.Timer | null = null;

  const options = { recursive: true }; // Warning: Only supported on MacOS and Windows!

  const watcher = fWatchProvider(rootPath, options, (event, filename) => {
    const fullpath = resolve(rootPath, filename);
    if (!fullpaths.includes(fullpath)) {
      fullpaths.push(fullpath);
    }
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      cb(fullpaths);
      fullpaths = [];
    }, debounceTime);
  });

  return { close: () => watcher.close() };
};

const fsWatchSupport = process.platform === 'darwin' || process.platform === 'win32';
export const DEF_PROVIDER = fsWatchSupport ? 'fs' : 'chokidar';
const watch = fsWatchSupport ? fWatch : cWatch;
export default watch;
