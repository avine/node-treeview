
import { resolve } from 'path';
import { appendFile, copy, move, remove } from 'fs-extra';

// tslint:disable:no-console

const doAndWait = (action: () => Promise<void>) =>
  new Promise<void>(done => action().then(() => {
    setTimeout(done, 0);
  }));

doAndWait(() => copy(resolve('spec/fixture'), resolve('dist/tmp')))
  .then(() => doAndWait(() => move(resolve('dist/tmp/a'), resolve('dist/tmp/z'))))
  .then(() => doAndWait(() => move(resolve('dist/tmp/sub/deep'), resolve('dist/tmp/sub/purple'))))
  .then(() => doAndWait(() => appendFile(resolve('dist/tmp/sub/b.txt'), 'BBB', { encoding: 'utf8' })));
