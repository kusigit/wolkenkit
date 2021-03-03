"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemFileStore = void 0;
const errors_1 = require("../../../common/errors");
const exists_1 = require("../../../common/utils/fs/exists");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const stream_1 = require("stream");
const pipeline = util_1.promisify(stream_1.pipeline);
class FileSystemFileStore {
    constructor({ directory }) {
        this.directory = directory;
    }
    static async create({ directory }) {
        return new FileSystemFileStore({ directory });
    }
    async addFile({ id, name, contentType, stream }) {
        const fileDirectory = path_1.default.join(this.directory, id);
        const fileData = path_1.default.join(fileDirectory, 'data');
        const fileMetadata = path_1.default.join(fileDirectory, 'metadata.json');
        if (await exists_1.exists({ path: fileDirectory })) {
            throw new errors_1.errors.FileAlreadyExists();
        }
        await fs_1.default.promises.mkdir(fileDirectory, { recursive: true });
        const targetStream = fs_1.default.createWriteStream(fileData);
        let contentLength = 0;
        stream.on('data', (data) => {
            contentLength += data.length;
        });
        await pipeline(stream, targetStream);
        const metadata = {
            id,
            name,
            contentType,
            contentLength
        };
        await fs_1.default.promises.writeFile(fileMetadata, JSON.stringify(metadata), 'utf8');
        return metadata;
    }
    async getFile({ id }) {
        const fileDirectory = path_1.default.join(this.directory, id);
        const fileData = path_1.default.join(fileDirectory, 'data');
        if (!await exists_1.exists({ path: fileDirectory })) {
            throw new errors_1.errors.FileNotFound();
        }
        const stream = fs_1.default.createReadStream(fileData);
        return stream;
    }
    async getMetadata({ id }) {
        const fileDirectory = path_1.default.join(this.directory, id);
        const fileMetadata = path_1.default.join(fileDirectory, 'metadata.json');
        if (!await exists_1.exists({ path: fileDirectory })) {
            throw new errors_1.errors.FileNotFound();
        }
        const rawMetadata = await fs_1.default.promises.readFile(fileMetadata, 'utf8');
        const metadata = JSON.parse(rawMetadata);
        return metadata;
    }
    async removeFile({ id }) {
        const fileDirectory = path_1.default.join(this.directory, id);
        if (!await exists_1.exists({ path: fileDirectory })) {
            throw new errors_1.errors.FileNotFound();
        }
        await fs_1.default.promises.rmdir(fileDirectory, { recursive: true });
    }
    // eslint-disable-next-line class-methods-use-this
    async setup() {
        await fs_1.default.promises.mkdir(this.directory, { recursive: true });
    }
    // eslint-disable-next-line class-methods-use-this
    async destroy() {
        // There is nothing to do here.
    }
}
exports.FileSystemFileStore = FileSystemFileStore;
//# sourceMappingURL=FileSystemFileStore.js.map