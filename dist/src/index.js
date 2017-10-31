"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
class TreeView {
    constructor(opts) {
        this.opts = { encoding: 'utf8', content: true, depth: false };
        Object.assign(this.opts, opts || {});
        this.inject();
    }
    static addTime(item, stats) {
        item.created = stats.birthtime;
        item.modified = stats.mtime;
    }
    static skipHidden(files) {
        return files.filter(file => file[0] !== '.');
    }
    inject() {
        this.providers = { normalize: path_1.normalize, readFile: fs_1.readFile, readdir: fs_1.readdir, sep: path_1.sep, stat: fs_1.stat };
    }
    process(path, cb) {
        const p = this.walk(this.providers.normalize(path));
        if (cb)
            p.then(result => cb(null, result), error => cb(error));
        return p;
    }
    walk(path, list = [], depth = 0) {
        return new Promise((resolve, reject) => {
            this.providers.readdir(path, (error, files) => {
                if (error) {
                    reject(error);
                    return;
                }
                files = TreeView.skipHidden(files);
                let pending = files.length;
                if (!pending) {
                    resolve(list);
                    return;
                }
                const tasks = [];
                files.forEach((name) => {
                    const item = { name, path };
                    this.providers.stat(this.getPath(item), (err, stats) => {
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
                            else if (stats.isDirectory()) {
                                task = this.addDir(item, depth);
                                list.push(item);
                            }
                            if (task)
                                tasks.push(task);
                        }
                        pending -= 1;
                        if (!pending)
                            Promise.all(tasks).then(() => resolve(list));
                    });
                });
            });
        });
    }
    getPath(item) {
        return item.path + this.providers.sep + item.name;
    }
    addFile(item, stats) {
        item.type = 'file';
        item.size = stats.size;
        if (this.opts.content) {
            return this.addContent(item);
        }
        return null;
    }
    addContent(item) {
        return new Promise(resolve => this.providers.readFile(this.getPath(item), {
            encoding: this.opts.encoding
        }, (error, data) => {
            if (error) {
                item.error = error;
            }
            else {
                item.content = data.toString();
            }
            resolve();
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
