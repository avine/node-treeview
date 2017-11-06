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
    content: TreeNode[];
    created: Date;
    modified: Date;
}
export interface IOpts {
    content: boolean;
    depth: boolean | number;
    exclude: string[];
    relative: boolean;
}
export interface IOptsParam {
    content?: boolean;
    depth?: boolean | number;
    exclude?: string[];
    relative?: boolean;
}
export interface IStats {
    size: number;
    birthtime: Date;
    mtime: Date;
    isDirectory(): boolean;
    isFile(): boolean;
}
export interface IProviders {
    resolve(...pathSegments: any[]): string;
    relative(from: string, to: string): string;
    readFile(path: string, options: {
        encoding: string;
        flag?: string;
    }, callback: (err: Err, data: string) => void): void;
    readdir(path: string, callback: (err: Err, files: string[]) => void): void;
    stat(path: string, callback: (err: Err, stats: IStats) => void): void;
}
export declare type Item = IFile | IDir;
export declare type TreeNode = Item | IRef;
export declare type Cb = (error: Err, result?: any) => any;
export declare type Err = Error | null | undefined;
