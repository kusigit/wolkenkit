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
    async storeDomainEvents({ domainEvents }) {
        const { status, data } = await this.axios({
            method: 'post',
            url: `${this.url}/store-domain-events`,
            data: domainEvents
        });
        if (status === 200) {
            return;
        }
        switch (data.code) {
            case errors_1.errors.DomainEventMalformed.code: {
                throw new errors_1.errors.DomainEventMalformed(data.message);
            }
            case errors_1.errors.ParameterInvalid.code: {
                throw new errors_1.errors.ParameterInvalid(data.message);
            }
            case errors_1.errors.RevisionAlreadyExists.code: {
                throw new errors_1.errors.RevisionAlreadyExists(data.message);
            }
            default: {
                logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api-client', 'writeDomainEventStore', { error: data, status }));
                throw new errors_1.errors.UnknownError(data.message);
            }
        }
    }
    async storeSnapshot({ snapshot }) {
        const { status, data } = await this.axios({
            method: 'post',
            url: `${this.url}/store-snapshot`,
            data: snapshot
        });
        if (status === 200) {
            return;
        }
        switch (data.code) {
            case errors_1.errors.RequestMalformed.code: {
                throw new errors_1.errors.RequestMalformed(data.message);
            }
            case errors_1.errors.SnapshotMalformed.code: {
                throw new errors_1.errors.SnapshotMalformed(data.message);
            }
            default: {
                logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api-client', 'writeDomainEventStore', { error: data, status }));
                throw new errors_1.errors.UnknownError(data.message);
            }
        }
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map