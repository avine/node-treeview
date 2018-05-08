
import { resolve } from 'path';
import { appendFile, copy, move, remove } from 'fs-extra';

// tslint:disable:no-console

copy(resolve('spec/fixture'), resolve('dist/tmp'), () => {
  move(resolve('dist/tmp/a'), resolve('dist/tmp/z'))
    .then(() => move(resolve('dist/tmp/sub/deep'), resolve('dist/tmp/sub/purple')))
    .then(() => appendFile(resolve('dist/tmp/sub/b.txt'), 'BBB', { encoding: 'utf8' }))
    .then(() => console.log('FINISH'));
});
