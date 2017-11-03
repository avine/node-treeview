"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const binary_1 = require("./binary");
class TreeView {
    constructor(opts) {
        this.opts = { content: true, depth: false, exclude: [], relative: false };
        this.inject();
        Object.assign(this.opts, opts || {});
        this.opts.exclude.map(path => this.providers.resolve(path));
    }
    static addTime(item, stats) {
        item.created = stats.birthtime;
        item.modified = stats.mtime;
    }
    static skipHidden(files) {
        return files.filter(file => file[0] !== '.');
    }
    inject() {
        this.providers = { resolve: path_1.resolve, relative: path_1.relative, readFile: fs_1.readFile, readdir: fs_1.readdir, stat: fs_1.stat };
    }
    process(path, cb) {
        this.rootPath = this.providers.resolve(path);
        const promise = this.walk(this.rootPath);
        if (cb)
            promise.then(result => cb(null, result), error => cb(error));
        return promise;
    }
    walk(path, list = [], depth = 0) {
        return new Promise((success, reject) => {
            this.providers.readdir(path, (error, files) => {
                if (error) {
                    reject(error);
                    return;
                }
                files = TreeView.skipHidden(files);
                let pending = files.length;
                if (!pending) {
                    success(list);
                    return;
                }
                const tasks = [];
                files.forEach((name) => {
                    const itemPath = this.opts.relative ? this.providers.relative(this.rootPath, path) : path;
                    const item = { name, path: itemPath };
                    const pathfile = this.getPath(item);
                    this.providers.stat(pathfile, (err, stats) => {
                        if (err) {
                            item.error = err;
                            list.push(item);
                        }
                        else {
                            TreeView.addTime(item, stats);
                            let task;
                            if (stats.isFile()) {
                                task = this.addFile(item, stats);
                                list.push(item);
                            }
                            else if (stats.isDirectory() && !this.opts.exclude.includes(pathfile)) {
                                task = this.addDir(item, depth);
                                list.push(item);
                            }
                            if (task)
                                tasks.push(task);
                        }
                        pending -= 1;
                        if (!pending)
                            Promise.all(tasks).then(() => success(list));
                    });
                });
            });
        });
    }
    getPath(item) {
        return this.providers.resolve(this.opts.relative ? this.rootPath : '', item.path, item.name);
    }
    addFile(item, stats) {
        item.type = 'file';
        item.size = stats.size;
        item.binary = binary_1.isBinaryPath(item.name);
        if (this.opts.content) {
            return this.addContent(item);
        }
        return null;
    }
    addContent(item) {
        return new Promise(success => this.providers.readFile(this.getPath(item), {
            encoding: item.binary ? 'base64' : 'utf8'
        }, (error, data) => {
            if (error) {
                item.error = error;
            }
            else {
                // TODO: if `this.opts.content` is a number then
                // only retrieve this number of octets...
                item.content = data.toString();
            }
            success();
        }));
    }
    addDir(item, depth) {
        item.type = 'dir';
        if (this.opts.depth === false || depth < this.opts.depth) {
            item.content = [];
            return this.walk(this.getPath(item), item.content, depth + 1)
                .catch((error) => {
                item.error = error;
                delete item.content;
                return Promise.resolve(); // Don't break the walk...
            });
        }
        return null;
    }
}
exports.TreeView = TreeView;
