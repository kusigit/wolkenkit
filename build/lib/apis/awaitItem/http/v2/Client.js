"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const errors_1 = require("../../../../common/errors");
const FilterHeartbeatsTransform_1 = require("../../../../common/utils/http/FilterHeartbeatsTransform");
const flaschenpost_1 = require("flaschenpost");
const HttpClient_1 = require("../../../shared/HttpClient");
const ParseJsonTransform_1 = require("../../../../common/utils/http/ParseJsonTransform");
const stream_to_string_1 = __importDefault(require("stream-to-string"));
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const stream_1 = require("stream");
const logger = flaschenpost_1.flaschenpost.getLogger();
class Client extends HttpClient_1.HttpClient {
    constructor({ protocol = 'http', hostName, portOrSocket, path = '/', createItemInstance = ({ item }) => item }) {
        super({ protocol, hostName, portOrSocket, path });
        this.createItemInstance = createItemInstance;
    }
    async awaitItem() {
        const { data, status } = await this.axios({
            method: 'get',
            url: this.url,
            responseType: 'stream'
        });
        if (status !== 200) {
            const error = JSON.parse(await stream_to_string_1.default(data));
            logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api-client', 'awaitItem', { error, status }));
            throw new errors_1.errors.UnknownError();
        }
        const passThrough = new stream_1.PassThrough({ objectMode: true });
        const { item, metadata } = await new Promise((resolve, reject) => {
            let unsubscribe;
            const onData = (nextItem) => {
                unsubscribe();
                resolve(nextItem);
            };
            const onError = (err) => {
                unsubscribe();
                reject(err);
            };
            unsubscribe = () => {
                passThrough.off('data', onData);
                passThrough.off('error', onError);
                passThrough.off('close', onError);
            };
            passThrough.on('data', onData);
            passThrough.on('error', onError);
            passThrough.on('close', () => {
                const error = new errors_1.errors.StreamClosedUnexpectedly();
                onError(error);
            });
            const jsonParser = new ParseJsonTransform_1.ParseJsonTransform();
            const heartbeatFilter = new FilterHeartbeatsTransform_1.FilterHeartbeatsTransform();
            stream_1.pipeline(data, jsonParser, heartbeatFilter, passThrough, (err) => {
                if (err) {
                    logger.error('An error occured during stream piping.', withLogMetadata_1.withLogMetadata('api-client', 'awaitItem', { err }));
                    reject(err);
                }
            });
        });
        return {
            item: this.createItemInstance({ item }),
            metadata
        };
    }
    async renewLock({ discriminator, token }) {
        const { status, data } = await this.axios({
            method: 'post',
            url: `${this.url}/renew-lock`,
            data: { discriminator, token },
            validateStatus() {
                return true;
            }
        });
        if (status === 200) {
            return;
        }
        switch (data.code) {
            case errors_1.errors.TokenMismatch.code: {
                throw new errors_1.errors.TokenMismatch(data.message);
            }
            case errors_1.errors.RequestMalformed.code: {
                throw new errors_1.errors.RequestMalformed(data.message);
            }
            case errors_1.errors.ItemNotFound.code: {
                throw new errors_1.errors.ItemNotFound(data.message);
            }
            case errors_1.errors.ItemNotLocked.code: {
                throw new errors_1.errors.ItemNotLocked(data.message);
            }
            default: {
                logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api-client', 'awaitItem', { error: data, status }));
                throw new errors_1.errors.UnknownError();
            }
        }
    }
    async acknowledge({ discriminator, token }) {
        const { status, data } = await this.axios({
            method: 'post',
            url: `${this.url}/acknowledge`,
            data: { discriminator, token },
            validateStatus() {
                return true;
            }
        });
        if (status === 200) {
            return;
        }
        switch (data.code) {
            case errors_1.errors.TokenMismatch.code: {
                throw new errors_1.errors.TokenMismatch(data.message);
            }
            case errors_1.errors.RequestMalformed.code: {
                throw new errors_1.errors.RequestMalformed(data.message);
            }
            case errors_1.errors.ItemNotFound.code: {
                throw new errors_1.errors.ItemNotFound(data.message);
            }
            case errors_1.errors.ItemNotLocked.code: {
                throw new errors_1.errors.ItemNotLocked(data.message);
            }
            default: {
                logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api-client', 'awaitItem', { error: data, status }));
                throw new errors_1.errors.UnknownError();
            }
        }
    }
    async defer({ discriminator, token, priority }) {
        const { status, data } = await this.axios({
            method: 'post',
            url: `${this.url}/defer`,
            data: { discriminator, token, priority },
            validateStatus() {
                return true;
            }
        });
        if (status === 200) {
            return;
        }
        switch (data.code) {
            case errors_1.errors.TokenMismatch.code: {
                throw new errors_1.errors.TokenMismatch(data.message);
            }
            case errors_1.errors.RequestMalformed.code: {
                throw new errors_1.errors.RequestMalformed(data.message);
            }
            case errors_1.errors.ItemNotFound.code: {
                throw new errors_1.errors.ItemNotFound(data.message);
            }
            case errors_1.errors.ItemNotLocked.code: {
                throw new errors_1.errors.ItemNotLocked(data.message);
            }
            default: {
                logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api-client', 'awaitItem', { error: data, status }));
                throw new errors_1.errors.UnknownError();
            }
        }
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map