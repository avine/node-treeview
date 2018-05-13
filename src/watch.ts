import { watch as fWatch } from 'fs';
import { watch as cWatch } from 'chokidar';
import { relative, resolve } from 'path';

import * as Model from './model';

export const DEF_DEBOUNCE_TIME = 100; // ms

export const fWatchFn: Model.WatchFn = (rootPath: string, cb: Model.WatchCb, debounceTime = DEF_DEBOUNCE_TIME) => {
  let fullpaths: string[] = [];
  let timeout: NodeJS.Timer | null = null;

  const options = { recursive: true }; // Warning: Only supported on MacOS and Windows!

  const watcher = fWatch(rootPath, options, (event, filename) => {
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

  return {
    ready: Promise.resolve(watcher),
    close: () => watcher.close()
  };
};

export const cWatchFn: Model.WatchFn = (rootPath: string, cb: Model.WatchCb, debounceTime = DEF_DEBOUNCE_TIME) => {
  let fullpaths: string[] = [];
  let timeout: NodeJS.Timer | null = null;

  const options = { ignoreInitial: true };

  const watcher = cWatch(rootPath, options);
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

  return {
    ready: new Promise(done => watcher.on('ready', () => done(watcher))),
    close: () => watcher.close()
  };
};

const fsWatchSupport = process.platform === 'darwin' || process.platform === 'win32';

export const DEF_WATCH_MODULE = fsWatchSupport ? 'fs' : 'chokidar';

export default fsWatchSupport ? fWatchFn : cWatchFn;
