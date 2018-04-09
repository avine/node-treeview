import chalk from 'chalk';

import * as Model from '../model';

// --- DrawBox ---

const FILL  = '│  ';
const ITEM  = '├─ ';
const LAST  = '└─ ';
const EMPTY = '   ';

function drawBox(depth: number, empty: number[]) {
  const fill = new Array(depth).fill(FILL);
  empty.forEach(index => fill[index] = EMPTY);
  const filled = fill.join('');
  return { item: filled + ITEM, last: filled + LAST };
}

// --- Renderer ---

export type Renderer = (box: string, item: Model.TreeNode) => string;

export const DEF_RENDERER = 'default';

export const renderer = {
  [DEF_RENDERER](box: string, item: Model.TreeNode) {
    return box + item.name;
  },
  light(box: string, item: Model.TreeNode) {
    return chalk.gray(box) + ((item as Model.IDir).type === 'dir' ? chalk.gray(item.name) : item.name);
  }
};

// --- Pretty ---

function walk(tree: Model.TreeNode[], render: Renderer, depth = 0, empty: number[] = []) {
  const result: string[] = [];
  const box = drawBox(depth, empty);
  tree.forEach((item, index) => {
    const last = index === tree.length - 1;
    const current = last ? box.last : box.item;
    result.push(render(current, item));
    if ((item as Model.IDir).type === 'dir' && (item as Model.IDir).nodes) {
      result.push(...walk((item as Model.IDir).nodes, render, depth + 1, last ? [...empty, depth] : empty));
    }
  });
  return result;
}

export function pretty(tree: Model.TreeNode[], render: Renderer = renderer.default) {
  return walk(tree, render).join('\n');
}
