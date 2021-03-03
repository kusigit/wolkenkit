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
    async postMessage({ channel, message }) {
        const { status, data } = await this.axios({
            method: 'post',
            url: `${this.url}/`,
            data: { channel, message }
        });
        if (status === 200) {
            return;
        }
        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api-client', 'publishMessage', { error: data, status }));
        throw new errors_1.errors.UnknownError();
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map