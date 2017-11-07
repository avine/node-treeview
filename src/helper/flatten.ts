import * as Model from '../model';

export function flatten(list: Model.TreeNode[]) {
  return list.reduce((acc: Model.TreeNode[], item: Model.TreeNode) => {
    if ((item as Model.IDir).type === 'dir' && (item as Model.IDir).content) {
      acc = acc.concat(flatten((item as Model.IDir).content));
    } else {
      acc.push(item);
    }
    return acc;
  }, [])
  .sort((a, b) => a.pathname > b.pathname ? 1 : -1);
}
