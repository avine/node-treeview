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

export interface IProviders {
  // Like require('path')
  sep: string;
  normalize(p: string): string;

  // Like require('fs')
  readFile(path: string, callback: (err: NodeJS.ErrnoException, data: Buffer) => void): void;
  readdir(path: string, callback: (err: NodeJS.ErrnoException, files: string[]) => void): void;
  stat(path: string, callback: (err: NodeJS.ErrnoException, stats: IStats) => void): void;
}

export type Item = IFile | IDir;

export type TreeNode = Item | IRef;

export type Cb = (result: any) => any;
