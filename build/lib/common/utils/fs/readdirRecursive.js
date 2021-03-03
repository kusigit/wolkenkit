"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readdirRecursive = void 0;
const errors_1 = require("../../errors");
const fs_1 = __importDefault(require("fs"));
// eslint-disable-next-line unicorn/import-style
const path_1 = require("path");
const readdirRecursive = async function ({ path }) {
    const directories = [];
    const files = [];
    const entries = await fs_1.default.promises.readdir(path, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            directories.push(entry.name);
            const directoryPath = path_1.join(path, entry.name);
            const { directories: subDirectories, files: subFiles } = await readdirRecursive({ path: directoryPath });
            for (const subDirectory of subDirectories) {
                directories.push(path_1.join(entry.name, subDirectory));
            }
            for (const subFile of subFiles) {
                files.push(path_1.join(entry.name, subFile));
            }
            continue;
        }
        if (entry.isFile()) {
            files.push(entry.name);
            continue;
        }
        throw new errors_1.errors.InvalidOperation(`'${path_1.join(path, entry.name)}' is neither a directory nor a file.`);
    }
    return { directories, files };
};
exports.readdirRecursive = readdirRecursive;
//# sourceMappingURL=readdirRecursive.js.map