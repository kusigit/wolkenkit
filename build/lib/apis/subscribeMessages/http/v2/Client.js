"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const errors_1 = require("../../../../common/errors");
const FilterHeartbeatsTransform_1 = require("../../../../common/utils/http/FilterHeartbeatsTransform");
const flaschenpost_1 = require("flaschenpost");
const HttpClient_1 = require("../../../shared/HttpClient");
const ParseJsonTransform_1 = require("../../../../common/utils/http/ParseJsonTransform");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const stream_1 = require("stream");
const logger = flaschenpost_1.flaschenpost.getLogger();
class Client extends HttpClient_1.HttpClient {
    constructor({ protocol = 'http', hostName, portOrSocket, path = '/' }) {
        super({ protocol, hostName, portOrSocket, path });
    }
    async getMessages({ channel }) {
        const { data, status } = await this.axios({
            method: 'get',
            url: `${this.url}/${channel}`,
            responseType: 'stream'
        });
        if (status !== 200) {
            throw new errors_1.errors.UnknownError(data.message);
        }
        const passThrough = new stream_1.PassThrough({ objectMode: true });
        const jsonParser = new ParseJsonTransform_1.ParseJsonTransform();
        const heartbeatFilter = new FilterHeartbeatsTransform_1.FilterHeartbeatsTransform();
        return stream_1.pipeline(data, jsonParser, heartbeatFilter, passThrough, (err) => {
            if (err) {
                // Do not handle errors explicitly. The returned stream will just close.
                logger.error('An error occured during stream piping.', withLogMetadata_1.withLogMetadata('api-client', 'subscribeMessages', { err }));
            }
        });
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map