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
  // Set file encoding (ie: 'utf8')
  encoding: string;
  // Add files content to output
  content: boolean | number;
  // Maximum depth of directories
  depth: boolean | number;
  // List of directory paths to exclude from output
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
  readFile(
    path: string, options: { encoding: string; flag?: string; },
    callback: (err: Err, data: string) => void
  ): void;
  readdir(path: string, callback: (err: Err, files: string[]) => void): void;
  stat(path: string, callback: (err: Err, stats: IStats) => void): void;
}

export type Item = IFile | IDir;

export type TreeNode = Item | IRef;

export type Cb = (error: Err, result?: any) => any;

export type Err = Error | null | undefined;
