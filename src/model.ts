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
  binary: boolean;
}

export interface IDir extends IRef {
  type: 'dir';
  content: Item[];
  created: Date;
  modified: Date;
}

export interface IOpts {
  // Add files content to output
  content: boolean;
  // Maximum depth of directories
  depth: boolean | number;
  // List of directory paths to exclude from output.
  exclude: string[];
  // Use relative path
  relative: boolean;
}
export interface IOptsParam {
  content?: boolean;
  depth?: boolean | number;
  exclude?: string[];
  relative?: boolean;
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
  resolve(...pathSegments: any[]): string;
  relative(from: string, to: string): string;

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
