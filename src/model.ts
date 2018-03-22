// Basic interface of files and directories
// Will be part of the outout when resource is unreadable
export interface IRef {
  name: string;
  path: string;
  pathname: string;
  error?: any;
}

export interface IFile extends IRef {
  type: 'file';
  content: string;
  created: Date;
  modified: Date;
  size: number;
  ext: string;
  binary: boolean;
}

export interface IDir extends IRef {
  type: 'dir';
  content: TreeNode[];
  created: Date;
  modified: Date;
}

export interface IOpts {
  // Include hidden files in output
  all: boolean;
  // Include files content in output
  content: boolean;
  // Use relative path
  relative: boolean;
  // Maximum depth of directories
  depth: boolean | number;
  // List of directory paths to include in output
  include: string[];
  // List of directory paths to exclude from output
  exclude: string[];
  // Match files based on glob pattern
  glob: string[];
}

// Like `IOpts` interface but with all properties optional
export interface IOptsParam {
  all?: boolean;
  content?: boolean;
  relative?: boolean;
  depth?: boolean | number;
  include?: string[];
  exclude?: string[];
  glob?: string[];
}

// Like require('fs').Stats interface
export interface IStats {
  size: number;
  birthtime: Date;
  mtime: Date;
  isDirectory(): boolean;
  isFile(): boolean;
}

export interface IProviders {
  // Like require('path') functions
  join(...paths: string[]): string;
  resolve(...pathSegments: any[]): string;
  relative(from: string, to: string): string;

  // Like require('fs') functions
  readFile(
    path: string, options: { encoding: string; flag?: string; },
    callback: (err: Err, data: string) => void
  ): void;
  readdir(path: string, callback: (err: Err, files: string[]) => void): void;
  stat(path: string, callback: (err: Err, stats: IStats) => void): void;
}

export type Item = IFile | IDir;
export type TreeNode = Item | IRef;

export type Listener = (data: TreeNode, opts: IOpts) => void;

export type Cb = (error: Err, tree?: TreeNode[]) => any;
export type Err = Error | null | undefined;
