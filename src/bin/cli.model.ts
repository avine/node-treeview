import * as Model from '../model';

export interface IDebug {
  opts: Model.IOpts;
  path: string;
  helper: IDebugHelper;
  output: DebugOutput;
  outputPath?: string;
}

export interface IDebugHelper {
  clean: boolean;
  flatten: boolean;
  pretty?: string;
}

/**
 * Most of the time debug output is of type `Model.TreeNode[]`.
 * When option `pretty` is given, output is of type string.
 */
export type DebugOutput = Model.TreeNode[] | string;
