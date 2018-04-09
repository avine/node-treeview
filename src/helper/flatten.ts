import * as Model from '../model';

export function flatten(tree: Model.TreeNode[]) {
  return tree.reduce((acc: Model.TreeNode[], item: Model.TreeNode) => {
    if ((item as Model.IDir).type === 'dir' && (item as Model.IDir).nodes) {
      acc = acc.concat(flatten((item as Model.IDir).nodes));
    } else {
      acc.push(item);
    }
    return acc;
  }, [])
  .sort((a, b) => a.path > b.path ? 1 : (a.path < b.path ? -1 : (a.name > b.name ? 1 : -1)));
}
