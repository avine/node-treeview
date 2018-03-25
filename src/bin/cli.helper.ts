import chalk from 'chalk';

import { renderer, Renderer } from '../helper/pretty';

export const getDepthArg = (arg: false | string) => {
  if (arg === false) {
    return arg;
  } else {
    const numArg = parseInt(arg, 10);
    if (!isNaN(numArg)) return numArg;
  }
  exit(new Error(`Invalid "depth" argument: number expected, but got "${arg}" instead!`));
};

export const getPrettyArg = (arg: boolean | string) => {
  const strArg = arg.toString();
  switch (strArg) {
    case 'true': return true;
    case 'false': return false;
  }
  if (strArg in renderer) {
    return strArg;
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
