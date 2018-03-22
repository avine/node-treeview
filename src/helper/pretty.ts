import * as Model from '../model';

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

const defaultRender = (item: Model.TreeNode) => item.name;

function walk(tree: Model.TreeNode[], render = defaultRender, depth = 0, empty: number[] = []) {
  const result: string[] = [];
  const box = drawBox(depth, empty);
  tree.forEach((item, index) => {
    const last = index === tree.length - 1;
    const current = last ? box.last : box.item;
    result.push(current + render(item));
    if ((item as Model.IDir).type === 'dir') {
      result.push(...walk((item as Model.IDir).content, render, depth + 1, last ? [...empty, depth] : empty));
    }
  });
  return result;
}

export function pretty(tree: Model.TreeNode[], render = defaultRender) {
  return walk(tree, render).join('\n');
}
