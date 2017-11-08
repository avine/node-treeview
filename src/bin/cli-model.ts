import * as Model from '../model';

export interface IDebug {
  opts: Model.IOpts;
  path: string;
  flatten: boolean;
  output: Model.TreeNode[];
}
