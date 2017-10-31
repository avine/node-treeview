export interface IRef {
  name: string;
  path: string;
  error?: any;
}

export interface IFile extends IRef {
  type: 'file';
  content: string;
  created: Date;
  modified: Date;
  size: number;
}

export interface IDir extends IRef {
  type: 'dir';
  content: Item[];
  created: Date;
  modified: Date;
}

export interface IOpts {
  encoding: string;
  content: boolean | number;
  depth: boolean | number;
  exclude: string[];
}
export interface IOptsParam {
  encoding?: string;
  content?: boolean | number;
  depth?: boolean | number;
  exclude?: string[];
}

// Like require('fs').Stats
export interface IStats {
  size: number; // FIXME: should be optional (because dir don't have size...)
  birthtime: Date;
  mtime: Date;
  isDirectory(): boolean;
  isFile(): boolean;
}

 // TODO: clarify interface
export interface IProviders {
  // Like require('path')
  sep: string;
  normalize(p: string): string;

  // Like require('fs')
  readFile(
    path: string, options: { encoding: string; flag?: string; },
    callback: (err: any, data: string) => void
  ): void;

  readdir(path: string, callback: (err: any, files: string[]) => void): void;
  stat(path: string, callback: (err: any, stats?: IStats) => void): void; // FIXME: "?" added for test...
}

export type Item = IFile | IDir;

export type TreeNode = Item | IRef;

export type Cb = (error: Error | null | undefined, result?: any) => any;
