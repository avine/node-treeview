import chalk from 'chalk';

import { renderer, DEF_RENDERER, Renderer } from '../helper/pretty';
import { Sorting } from '../model';

export const getDepthArg = (arg: string | number) => {
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
    return DEF_RENDERER;
  }
  if (arg in renderer) {
    return arg;
  }
  exit(new Error(
    `Invalid "pretty" argument: boolean or renderer expected, but got "${arg}" instead!\n` +
    `(pick one of the coolest renderers: "${Object.keys(renderer).join('", "')}")`
  ));
};

export const getSortArg = (arg: string | number) => {
  const numArg = parseInt(arg as string, 10);
  if (!isNaN(numArg) && Sorting[numArg]) {
    return numArg as Sorting;
  }
  exit(new Error(
    `Invalid "sort" argument: expected number ${getSortDesc()} but got "${arg}" instead!`
  ));
};

export const getSortDesc = () => {
  const desc = [];
  let i = 0;
  while (Sorting[i]) desc.push(`${i} (${Sorting[i++]})`);
  return desc.join(', ');
};

export function exit(error: Error) {
  process.stderr.write('\n' + chalk.red(error.toString()) + '\n\n');
  process.exit(1);
}
