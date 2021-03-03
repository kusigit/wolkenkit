"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const HttpClient_1 = require("../../../shared/HttpClient");
const stream_to_string_1 = __importDefault(require("stream-to-string"));
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
class Client extends HttpClient_1.HttpClient {
    constructor({ protocol = 'http', hostName, portOrSocket, path = '/' }) {
        super({ protocol, hostName, portOrSocket, path });
    }
    async getFile({ id }) {
        const { status, headers, data } = await this.axios({
            method: 'get',
            url: `${this.url}/file/${id}`,
            responseType: 'stream'
        });
        if (status === 200) {
            return {
                id,
                name: headers['x-name'],
                contentType: headers['content-type'],
                stream: data
            };
        }
        const error = JSON.parse(await stream_to_string_1.default(data));
        switch (error.code) {
            case errors_1.errors.NotAuthenticated.code: {
                throw new errors_1.errors.NotAuthenticated(error.message);
            }
            case errors_1.errors.FileNotFound.code: {
                throw new errors_1.errors.FileNotFound(error.message);
            }
            default: {
                logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api-client', 'manageFile', { error, status }));
                throw new errors_1.errors.UnknownError();
            }
        }
    }
    async addFile({ id, name, contentType, stream }) {
        const { status, data } = await this.axios({
            method: 'post',
            url: `${this.url}/add-file`,
            headers: {
                'x-id': id,
                'x-name': name,
                'content-type': contentType
            },
            data: stream
        });
        if (status === 200) {
            return;
        }
        switch (data.code) {
            case errors_1.errors.NotAuthenticated.code: {
                throw new errors_1.errors.NotAuthenticated(data.message);
            }
            case errors_1.errors.FileAlreadyExists.code: {
                throw new errors_1.errors.FileAlreadyExists(data.message);
            }
            default: {
                logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api-client', 'manageFile', { error: data, status }));
                throw new errors_1.errors.UnknownError();
            }
        }
    }
    async removeFile({ id }) {
        const { status, data } = await this.axios({
            method: 'post',
            url: `${this.url}/remove-file`,
            data: { id }
        });
        if (status === 200) {
            return;
        }
        switch (data.code) {
            case errors_1.errors.NotAuthenticated.code: {
                throw new errors_1.errors.NotAuthenticated(data.message);
            }
            case errors_1.errors.FileNotFound.code: {
                throw new errors_1.errors.FileNotFound(data.message);
            }
            default: {
                logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'manageFile', { error: data, status }));
                throw new errors_1.errors.UnknownError();
            }
        }
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map