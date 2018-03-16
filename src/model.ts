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
  // Include files content in output
  content: boolean;
  // Use relative path
  relative: boolean;
  // Maximum depth of directories
  depth: boolean | number;
  // List of directory paths to exclude from output
  exclude: string[];
  // Match files based on glob pattern
  pattern: string;
}

// Like `IOpts` interface but with all properties optional
export interface IOptsParam {
  content?: boolean;
  relative?: boolean;
  depth?: boolean | number;
  exclude?: string[];
  pattern?: string;
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

export type Cb = (error: Err, result?: any) => any;
export type Err = Error | null | undefined;
