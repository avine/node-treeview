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

export interface IStats {
  size: number;
  birthtime: Date;
  mtime: Date;
  isDirectory(): boolean;
  isFile(): boolean;
}

export type Item = IFile | IDir;

export type Tree = Item | IRef;

export type Cb = (result: any) => any;
