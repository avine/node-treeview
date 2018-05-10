// Basic interface of files and directories
// Will be part of the outout when resource is unreadable
export interface IRef {
  name: string;
  path: string;
  pathname: string;
  depth: number;
  error?: any;
}

export interface IFile extends IRef {
  type: 'file';
  created: Date;
  modified: Date;
  size: number;
  ext: string;
  binary: boolean;
  content?: string;
}

export interface IDir extends IRef {
  type: 'dir';
  created: Date;
  modified: Date;
  nodes: TreeNode[];
}

export interface IOpts {
  // Include hidden files in output
  all: boolean;
  // Include files content in output
  content: boolean;
  // Maximum depth of directories
  depth: number;
  // Use relative path
  relative: boolean;
  // List of directory paths to include in output
  include: string[];
  // List of directory paths to exclude from output
  exclude: string[];
  // Match files based on glob pattern
  glob: string[];
  // Sort output
  sort: Sorting;
}

// Like `IOpts` interface but with all properties optional
export interface IOptsParam {
  all?: boolean;
  content?: boolean;
  depth?: number;
  relative?: boolean;
  include?: string[];
  exclude?: string[];
  glob?: string[];
  sort?: Sorting;
}

// Tree sorting type
export enum Sorting {
  Alpha,
  FileFirst,
  DirFirst
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

export interface ISearch {
  include?: string[];
  exclude?: string[];
  glob?: string[];
}

export interface ICtx extends ISearch {
  rootPath: string;
  getPath: (item: IRef) => string;
  path: string;
  depth: number;
}

export interface IResult {
  rootPath: string;
  tree: TreeNode[];
}

export interface IMatch {
  item: TreeNode;
  parentNodes: TreeNode[];
}

export type Item = IFile | IDir;
export type TreeNode = Item | IRef;

export type Event
  = 'item'
  | 'ready'
  | 'tree'
  | 'add'
  | 'change'
  | 'unlink'
  | 'all';

export type OnTree = (tree: TreeNode[]) => void;
export type OnItem = (item: TreeNode) => void;
export type OnItemCtx = (item: TreeNode, ctx: ICtx) => void;

export type OnAll = (event: Event, data: TreeNode[] | TreeNode, ctx?: ICtx) => void;

export type ProcessCb = (error: Err, tree?: TreeNode[]) => any;
export type Err = Error | null | undefined;

export type WatchFn = (rootPath: string, cb: WatchCb, debounceTime?: number) => { close: () => void; };
export type WatchCb = (fullpaths: string[]) => void;
