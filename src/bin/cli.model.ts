import * as Model from '../model';

export interface IDebug {
  opts: Model.IOpts;
  path: string;
  helper: {
    clean: boolean;
    flatten: boolean;
    pretty: boolean | string;
  };
  output: DebugOutput;
  outputPath?: string;
}

/**
 * Most of the time debug output is of type `Model.TreeNode[]`.
 * When option `pretty` is given, output is of type string.
 */
export type DebugOutput = Model.TreeNode[] | string;
