import * as Model from '../model';

export interface IDebug {
  opts: Model.IOpts;
  path: string;
  helper: {
    clean: boolean;
    flatten: boolean;
    pretty: boolean;
  };
  output: DebugOutput;
  outputPath?: string;
}

export type DebugOutput = Model.TreeNode[] | string;
