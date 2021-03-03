"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseImageVersionsFromDockerfile = void 0;
const errors_1 = require("../../../../common/errors");
const fs_1 = __importDefault(require("fs"));
const getBaseImageVersionsFromDockerfile = async function ({ dockerfilePath, baseImage }) {
    const dockerfile = await fs_1.default.promises.readFile(dockerfilePath, 'utf8');
    const froms = dockerfile.
        split('\n').
        filter((line) => line.startsWith(`FROM ${baseImage}:`));
    if (froms.length === 0) {
        throw new errors_1.errors.InvalidOperation(`FROM statements are missing in '${dockerfilePath}'.`);
    }
    const result = froms.map((from, index) => ({
        line: index + 1,
        version: from.split(':')[1]
    }));
    return result;
};
exports.getBaseImageVersionsFromDockerfile = getBaseImageVersionsFromDockerfile;
//# sourceMappingURL=getBaseImageVersionsFromDockerfile.js.map