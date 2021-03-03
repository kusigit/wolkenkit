"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const HttpClient_1 = require("../../../shared/HttpClient");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
class Client extends HttpClient_1.HttpClient {
    constructor({ protocol = 'http', hostName, portOrSocket, path = '/' }) {
        super({ protocol, hostName, portOrSocket, path });
    }
    async postCommand({ command }) {
        const { status, data } = await this.axios({
            method: 'post',
            url: `${this.url}/`,
            data: command
        });
        if (status === 200) {
            return { id: data.id };
        }
        switch (data.code) {
            case errors_1.errors.ContextNotFound.code: {
                throw new errors_1.errors.ContextNotFound(data.message);
            }
            case errors_1.errors.AggregateNotFound.code: {
                throw new errors_1.errors.AggregateNotFound(data.message);
            }
            case errors_1.errors.CommandNotFound.code: {
                throw new errors_1.errors.CommandNotFound(data.message);
            }
            case errors_1.errors.CommandMalformed.code: {
                throw new errors_1.errors.CommandMalformed(data.message);
            }
            default: {
                logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api-client', 'handleCommandWithMetadata', { error: data, status }));
                throw new errors_1.errors.UnknownError();
            }
        }
    }
    async cancelCommand({ commandIdentifierWithClient }) {
        const { status, data } = await this.axios({
            method: 'post',
            url: `${this.url}/cancel`,
            data: commandIdentifierWithClient
        });
        if (status === 200) {
            return;
        }
        switch (data.code) {
            case errors_1.errors.ContextNotFound.code: {
                throw new errors_1.errors.ContextNotFound(data.message);
            }
            case errors_1.errors.AggregateNotFound.code: {
                throw new errors_1.errors.AggregateNotFound(data.message);
            }
            case errors_1.errors.CommandNotFound.code: {
                throw new errors_1.errors.CommandNotFound(data.message);
            }
            case errors_1.errors.ItemNotFound.code: {
                throw new errors_1.errors.ItemNotFound(data.message);
            }
            default: {
                logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api-client', 'handleCommandWithMetadata', { error: data, status }));
                throw new errors_1.errors.UnknownError();
            }
        }
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map