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
}

export interface IOptsParam {
  content?: boolean | number;
  depth?: boolean | number;
}

// Like require('fs').Stats
export interface IStats {
  size: number;
  birthtime: Date;
  mtime: Date;
  isDirectory(): boolean;
  isFile(): boolean;
}

 // TODO: improve interface
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

export type Cb = (result: any) => any;
