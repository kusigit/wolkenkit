"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryFileStore = void 0;
const errors_1 = require("../../../common/errors");
const stream_1 = require("stream");
class InMemoryFileStore {
    constructor() {
        this.files = {};
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async create(options) {
        return new InMemoryFileStore();
    }
    async addFile({ id, name, contentType, stream }) {
        if (this.files[id]) {
            throw new errors_1.errors.FileAlreadyExists();
        }
        const chunks = [];
        let contentLength = 0;
        for await (const chunk of stream) {
            chunks.push(chunk);
            contentLength += chunk.length;
        }
        const data = Buffer.concat(chunks), metadata = { id, name, contentType, contentLength };
        this.files[id] = {
            data,
            metadata
        };
        return metadata;
    }
    async getFile({ id }) {
        const file = this.files[id];
        if (!file) {
            throw new errors_1.errors.FileNotFound();
        }
        const stream = stream_1.Readable.from(file.data);
        return stream;
    }
    async getMetadata({ id }) {
        const file = this.files[id];
        if (!file) {
            throw new errors_1.errors.FileNotFound();
        }
        return file.metadata;
    }
    async removeFile({ id }) {
        const file = this.files[id];
        if (!file) {
            throw new errors_1.errors.FileNotFound();
        }
        Reflect.deleteProperty(this.files, id);
    }
    // eslint-disable-next-line class-methods-use-this
    async setup() {
        // There is nothing to do here.
    }
    // eslint-disable-next-line class-methods-use-this
    async destroy() {
        // There is nothing to do here.
    }
}
exports.InMemoryFileStore = InMemoryFileStore;
//# sourceMappingURL=InMemoryFileStore.js.map