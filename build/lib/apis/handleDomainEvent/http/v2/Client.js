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
    async postDomainEvent({ flowNames, domainEvent }) {
        const { status, data } = await this.axios({
            method: 'post',
            url: `${this.url}/`,
            data: { flowNames, domainEvent }
        });
        if (status === 200) {
            return;
        }
        switch (data.code) {
            case errors_1.errors.FlowNotFound.code: {
                throw new errors_1.errors.FlowNotFound(data.message);
            }
            case errors_1.errors.ContextNotFound.code: {
                throw new errors_1.errors.ContextNotFound(data.message);
            }
            case errors_1.errors.AggregateNotFound.code: {
                throw new errors_1.errors.AggregateNotFound(data.message);
            }
            case errors_1.errors.DomainEventNotFound.code: {
                throw new errors_1.errors.DomainEventNotFound(data.message);
            }
            case errors_1.errors.DomainEventMalformed.code: {
                throw new errors_1.errors.DomainEventMalformed(data.message);
            }
            default: {
                logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api-client', 'handleDomainEvent', { error: data, status }));
                throw new errors_1.errors.UnknownError();
            }
        }
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map