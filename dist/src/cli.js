#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const index_1 = require("./index");
const log = (data) => process.stdout.write(JSON.stringify(data, undefined, 2) + '\n');
// `content` and `depth` arguments validation
const booleanOrNumber = (arg) => {
    const strArg = arg.toString();
    switch (strArg) {
        case 'true': return true;
        case 'false': return false;
    }
    const numArg = parseInt(strArg, 10);
    if (!isNaN(numArg))
        return numArg;
    throw new Error(`Boolean or number expected, but got "${arg}" instead!`);
};
yargs
    .locale('en')
    .usage('Usage: $0 <path> [options]')
    .demandCommand(1, 'Error: argument <path> is missing!')
    .option('content', {
    alias: 'c',
    describe: 'Add files content to output. Use a boolean or a number in bytes.',
    coerce: booleanOrNumber,
    default: true
}).option('depth', {
    alias: 'd',
    describe: 'Maximum depth of directories. Use a boolean or a number.',
    coerce: booleanOrNumber,
    default: false
}).option('relative', {
    alias: 'r',
    describe: 'Use relative path.',
    type: 'boolean',
    default: false
}).option('exclude', {
    alias: 'e',
    describe: 'List of directory paths to exclude from output.',
    type: 'array',
    default: []
}).option('encoding', {
    describe: 'Set files encoding.',
    type: 'string',
    default: 'utf8'
})
    .help('help')
    .alias('help', 'h');
// log(yargs.argv); // For debugging
const path = yargs.argv._[0];
const { content, depth, relative, encoding, exclude } = yargs.argv;
if (path) {
    new index_1.TreeView({ content, depth, relative, encoding, exclude })
        .process(path)
        .then(result => log(result))
        .catch((error) => {
        // tslint:disable-next-line:no-console
        console.log(error.toString());
        process.exit(1);
    });
}
