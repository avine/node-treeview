import * as Model from '../model';

const FILL  = '│  ';
const ITEM  = '├─ ';
const LAST  = '└─ ';
const EMPTY = '   ';

function draw(depth: number, empty: number[]) {
  const fill = new Array(depth).fill(FILL);
  const item = [...fill, ITEM];
  const last = [...fill, LAST];
  empty.forEach(index => item[index] = last[index] = EMPTY);
  return { item: item.join(''), last: last.join('') };
}

export function pretty(
  tree: Model.TreeNode[],
  depth = 0,
  empty: number[] = []
) {
  const result: string[] = [];
  const d = draw(depth, empty);
  tree.forEach((item, index) => {
    const last = index === tree.length - 1;
    const prefix = last ? d.last : d.item;
    result.push(prefix + item.name);
    if ((item as Model.IDir).type === 'dir') {
      result.push(
        pretty(
          (item as Model.IDir).content,
          depth + 1,
          last ? [...empty, depth] : empty)
      );
    }
  });
  return result.join('\n');
}
