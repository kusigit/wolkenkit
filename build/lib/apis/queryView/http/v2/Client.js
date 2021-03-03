"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const HttpClient_1 = require("../../../shared/HttpClient");
const ParseJsonTransform_1 = require("../../../../common/utils/http/ParseJsonTransform");
const stream_to_string_1 = __importDefault(require("stream-to-string"));
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const stream_1 = require("stream");
const logger = flaschenpost_1.flaschenpost.getLogger();
class Client extends HttpClient_1.HttpClient {
    constructor({ protocol = 'http', hostName, portOrSocket, path = '/' }) {
        super({ protocol, hostName, portOrSocket, path });
    }
    async getDescription() {
        const { data, status } = await this.axios({
            method: 'get',
            url: `${this.url}/description`
        });
        if (status === 200) {
            return data;
        }
        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api-client', 'queryView', { error: data, status }));
        throw new errors_1.errors.UnknownError();
    }
    async queryStream({ viewName, queryName, queryOptions = {} }) {
        const { data, status } = await this.axios({
            method: 'get',
            url: `${this.url}/${viewName}/stream/${queryName}`,
            params: queryOptions,
            paramsSerializer(params) {
                return Object.entries(params).
                    map(([key, value]) => `${key}=${JSON.stringify(value)}`).
                    join('&');
            },
            responseType: 'stream'
        });
        if (status !== 200) {
            const error = JSON.parse(await stream_to_string_1.default(data));
            switch (error.code) {
                case errors_1.errors.ViewNotFound.code: {
                    throw new errors_1.errors.ViewNotFound(error.message);
                }
                case errors_1.errors.QueryHandlerNotFound.code: {
                    throw new errors_1.errors.QueryHandlerNotFound(error.message);
                }
                case errors_1.errors.QueryOptionsInvalid.code: {
                    throw new errors_1.errors.QueryOptionsInvalid(error.message);
                }
                case errors_1.errors.QueryHandlerTypeMismatch.code: {
                    throw new errors_1.errors.QueryHandlerTypeMismatch(error.message);
                }
                default: {
                    logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api-client', 'queryView', { error, status }));
                    throw new errors_1.errors.UnknownError();
                }
            }
        }
        const jsonParser = new ParseJsonTransform_1.ParseJsonTransform();
        return stream_1.pipeline(data, jsonParser, (err) => {
            if (err) {
                // Do not handle errors explicitly. The returned stream will just close.
                logger.error('An error occured during stream piping.', withLogMetadata_1.withLogMetadata('api-client', 'queryView', { err }));
            }
        });
    }
    async queryValue({ viewName, queryName, queryOptions = {} }) {
        const { data, status } = await this.axios({
            method: 'get',
            url: `${this.url}/${viewName}/value/${queryName}`,
            params: queryOptions,
            paramsSerializer(params) {
                return Object.entries(params).
                    map(([key, value]) => `${key}=${JSON.stringify(value)}`).
                    join('&');
            }
        });
        if (status !== 200) {
            switch (data.code) {
                case errors_1.errors.ViewNotFound.code: {
                    throw new errors_1.errors.ViewNotFound(data.message);
                }
                case errors_1.errors.QueryHandlerNotFound.code: {
                    throw new errors_1.errors.QueryHandlerNotFound(data.message);
                }
                case errors_1.errors.QueryOptionsInvalid.code: {
                    throw new errors_1.errors.QueryOptionsInvalid(data.message);
                }
                case errors_1.errors.QueryHandlerTypeMismatch.code: {
                    throw new errors_1.errors.QueryHandlerTypeMismatch(data.message);
                }
                case errors_1.errors.NotFound.code: {
                    throw new errors_1.errors.NotFound(data.message);
                }
                default: {
                    logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api-client', 'queryView', { error: data, status }));
                    throw new errors_1.errors.UnknownError();
                }
            }
        }
        return data;
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map