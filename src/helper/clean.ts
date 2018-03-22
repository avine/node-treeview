import * as Model from '../model';

/**
 * Clean empty directories from the tree
 */
export function clean(tree: Model.TreeNode[]): Model.TreeNode[] {
  return tree.filter((item: Model.TreeNode) => {
    if ((item as Model.IDir).type === 'dir') {
      if ((item as Model.IDir).content && (item as Model.IDir).content.length) {
        return clean((item as Model.IDir).content).length;
      }
      return false;
    }
    return true;
  });
}
