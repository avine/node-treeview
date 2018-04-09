import * as Model from '../model';

/**
 * Clean empty directories from the tree
 */
export function clean(tree: Model.TreeNode[]): Model.TreeNode[] {
  return tree.filter((item: Model.TreeNode) => {
    if ((item as Model.IDir).type === 'dir') {
      if ((item as Model.IDir).nodes && (item as Model.IDir).nodes.length) {
        return clean((item as Model.IDir).nodes).length;
      }
      return false;
    }
    return true;
  });
}
