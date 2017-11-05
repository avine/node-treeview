import * as Model from './model';
export declare class TreeView {
    private static addTime(item, stats);
    private static skipHidden(files);
    opts: Model.IOpts;
    providers: Model.IProviders;
    rootPath: string;
    constructor(opts?: Model.IOptsParam);
    inject(): void;
    process(path: string, cb?: Model.Cb): Promise<Model.TreeNode[]>;
    private walk(path, list?, depth?);
    private getPath(item);
    private addFile(item, stats);
    private addContent(item);
    private addDir(item, depth);
}
