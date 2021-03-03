"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFileStore = void 0;
const errors_1 = require("../../common/errors");
const FileSystem_1 = require("./FileSystem");
const InMemory_1 = require("./InMemory");
const S3_1 = require("./S3");
const createFileStore = async function (options) {
    switch (options.type) {
        case 'FileSystem': {
            return FileSystem_1.FileSystemFileStore.create(options);
        }
        case 'InMemory': {
            return InMemory_1.InMemoryFileStore.create(options);
        }
        case 'S3': {
            return S3_1.S3FileStore.create(options);
        }
        default: {
            throw new errors_1.errors.DatabaseTypeInvalid();
        }
    }
};
exports.createFileStore = createFileStore;
//# sourceMappingURL=createFileStore.js.map