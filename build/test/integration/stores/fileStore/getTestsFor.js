"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestsFor = void 0;
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const stream_to_string_1 = __importDefault(require("stream-to-string"));
const uuid_1 = require("uuid");
/* eslint-disable mocha/max-top-level-suites, mocha/no-top-level-hooks */
const getTestsFor = function ({ createFileStore }) {
    const contentType = 'application/json', name = 'someFile.json';
    let content, contentLength, fileStore, id, stream;
    setup(async () => {
        id = uuid_1.v4();
        const filePath = path_1.default.join(__dirname, '..', '..', '..', 'shared', 'files', 'someFile.json');
        content = await stream_to_string_1.default(fs_1.default.createReadStream(filePath));
        contentLength = content.length;
        stream = fs_1.default.createReadStream(filePath);
    });
    teardown(async () => {
        await fileStore.destroy();
    });
    suite('addFile', () => {
        setup(async () => {
            fileStore = await createFileStore();
            await fileStore.setup();
        });
        test('does not throw an error.', async () => {
            await assertthat_1.assert.that(async () => {
                await fileStore.addFile({ id, name, contentType, stream });
            }).is.not.throwingAsync();
        });
        test('returns the metadata.', async () => {
            const metadata = await fileStore.addFile({ id, name, contentType, stream });
            assertthat_1.assert.that(metadata).is.equalTo({ id, name, contentType, contentLength });
        });
        test('throws an error if the id is already being used.', async () => {
            await fileStore.addFile({ id, name, contentType, stream });
            await assertthat_1.assert.that(async () => {
                await fileStore.addFile({ id, name, contentType, stream });
            }).is.throwingAsync((ex) => ex.code === errors_1.errors.FileAlreadyExists.code);
        });
    });
    suite('getMetadata', () => {
        setup(async () => {
            fileStore = await createFileStore();
            await fileStore.setup();
        });
        test('throws an error if the id does not exist.', async () => {
            await assertthat_1.assert.that(async () => {
                await fileStore.getMetadata({ id });
            }).is.throwingAsync((ex) => ex.code === errors_1.errors.FileNotFound.code);
        });
        test('returns the metadata.', async () => {
            await fileStore.addFile({ id, name, contentType, stream });
            const metadata = await fileStore.getMetadata({ id });
            assertthat_1.assert.that(metadata).is.equalTo({ id, name, contentType, contentLength });
        });
    });
    suite('getFile', () => {
        setup(async () => {
            fileStore = await createFileStore();
            await fileStore.setup();
        });
        test('throws an error if the id does not exist.', async () => {
            await assertthat_1.assert.that(async () => {
                await fileStore.getFile({ id });
            }).is.throwingAsync((ex) => ex.code === errors_1.errors.FileNotFound.code);
        });
        test('returns the file stream.', async () => {
            await fileStore.addFile({ id, name, contentType, stream });
            const fileStream = await fileStore.getFile({ id });
            const fileData = await stream_to_string_1.default(fileStream);
            assertthat_1.assert.that(fileData).is.equalTo(content);
        });
    });
    suite('removeFile', () => {
        setup(async () => {
            fileStore = await createFileStore();
            await fileStore.setup();
        });
        test('throws an error if the id does not exist.', async () => {
            await assertthat_1.assert.that(async () => {
                await fileStore.removeFile({ id });
            }).is.throwingAsync((ex) => ex.code === errors_1.errors.FileNotFound.code);
        });
        test('does not throw an error.', async () => {
            await fileStore.addFile({ id, name, contentType, stream });
            await assertthat_1.assert.that(async () => {
                await fileStore.removeFile({ id });
            }).is.not.throwingAsync();
        });
    });
};
exports.getTestsFor = getTestsFor;
//# sourceMappingURL=getTestsFor.js.map