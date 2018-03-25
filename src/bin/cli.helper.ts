import chalk from 'chalk';

import { renderer, Renderer } from '../helper/pretty';

export const getDepthArg = (arg: string | -1) => {
  const numArg = parseInt(arg as string, 10);
  if (!isNaN(numArg)) {
    return numArg;
  }
  exit(new Error(
    `Invalid "depth" argument: number expected, but got "${arg}" instead!`
  ));
};

export const getPrettyArg = (arg: string) => {
  if (arg === '') {
    return 'default'; // TODO: should be a constant!
  }
  if (arg in renderer) {
    return arg;
  }
  exit(new Error(
    `Invalid "pretty" argument: boolean or renderer expected, but got "${arg}" instead!\n` +
    `(pick one of the coolest renderers: "${Object.keys(renderer).join('", "')}")`
  ));
};

export function exit(error: Error) {
  process.stderr.write('\n' + chalk.red(error.toString()) + '\n\n');
  process.exit(1);
}
