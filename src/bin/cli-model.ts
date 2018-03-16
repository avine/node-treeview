import * as Model from '../model';

export interface IDebug {
  opts: Model.IOpts;
  path: string;
  flatten: boolean;
  clean: boolean;
  output: Model.TreeNode[];
  outputPath?: string;
}
