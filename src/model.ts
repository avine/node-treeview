export interface Ref {
  name: string;
  path: string;
  error?: any;
}  

export interface File extends Ref {
  type: 'file';
  content: string;
  created: Date;
  modified: Date;
  size: number;
}

export interface Dir extends Ref {
  type: 'dir';
  content: (File | Dir)[];
  created: Date;
  modified: Date;
}

export interface Err {
  error: any;
}

export interface Opts {
  content: boolean | number;
  depth: boolean | number;
}

export interface OptsParam {
  content?: boolean | number;
  depth?: boolean | number;
}

export interface Cb {
  (result: any): any;
}

export interface Stats {
  size: number;
  birthtime: Date;
  mtime: Date;
  isDirectory(): boolean;
  isFile(): boolean;
}

export type Item = File | Dir;
