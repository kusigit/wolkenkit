"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicationRoot = void 0;
const errors_1 = require("../errors");
const fs_1 = __importDefault(require("fs"));
const isErrnoException_1 = require("../utils/isErrnoException");
const path_1 = __importDefault(require("path"));
const getApplicationRoot = async function ({ directory }) {
    try {
        await fs_1.default.promises.access(directory, fs_1.default.constants.R_OK);
    }
    catch (ex) {
        if (isErrnoException_1.isErrnoException(ex) && ex.code === 'ENOENT') {
            throw new errors_1.errors.DirectoryNotFound();
        }
        throw ex;
    }
    const packageJsonPath = path_1.default.join(directory, 'package.json');
    try {
        await fs_1.default.promises.access(packageJsonPath, fs_1.default.constants.R_OK);
    }
    catch (ex) {
        if (isErrnoException_1.isErrnoException(ex) && ex.code === 'ENOENT') {
            const upperDirectory = path_1.default.join(directory, '..');
            if (upperDirectory === directory) {
                throw new errors_1.errors.ApplicationNotFound();
            }
            return await getApplicationRoot({ directory: upperDirectory });
        }
        throw ex;
    }
    return directory;
};
exports.getApplicationRoot = getApplicationRoot;
//# sourceMappingURL=getApplicationRoot.js.map