"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDomainEventsByCausationId = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getDomainEventSchema_1 = require("../../../../common/schemas/getDomainEventSchema");
const defekt_1 = require("defekt");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const writeLine_1 = require("../../../base/writeLine");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getDomainEventsByCausationId = {
    description: 'Streams all domain events with a matching causation id.',
    path: 'domain-events-by-causation-id',
    request: {
        query: {
            type: 'object',
            properties: {
                'causation-id': { type: 'string', format: 'uuid' }
            },
            required: ['causation-id'],
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200],
        stream: true,
        body: getDomainEventSchema_1.getDomainEventSchema()
    },
    getHandler({ domainEventStore, heartbeatInterval }) {
        const querySchema = new validate_value_1.Value(getDomainEventsByCausationId.request.query), responseBodySchema = new validate_value_1.Value(getDomainEventsByCausationId.response.body);
        return async function (req, res) {
            try {
                try {
                    querySchema.validate(req.query, { valueName: 'requestQuery' });
                }
                catch (ex) {
                    throw new errors_1.errors.RequestMalformed(ex.message);
                }
                const causationId = req.query['causation-id'];
                res.startStream({ heartbeatInterval });
                const domainEventStream = await domainEventStore.getDomainEventsByCausationId({ causationId });
                for await (const domainEvent of domainEventStream) {
                    try {
                        responseBodySchema.validate(domainEvent, { valueName: 'responseBody' });
                        writeLine_1.writeLine({ res, data: domainEvent });
                    }
                    catch {
                        logger.warn('Dropped invalid domain event.', withLogMetadata_1.withLogMetadata('api', 'queryDomainEventStore', { domainEvent }));
                    }
                }
                return res.end();
            }
            catch (ex) {
                const error = defekt_1.isCustomError(ex) ?
                    ex :
                    new errors_1.errors.UnknownError(undefined, { cause: ex });
                switch (error.code) {
                    case errors_1.errors.RequestMalformed.code: {
                        res.status(400).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    default: {
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'queryDomainEventStore', { error }));
                        res.status(500).json({
                            code: error.code,
                            message: error.message
                        });
                    }
                }
            }
        };
    }
};
exports.getDomainEventsByCausationId = getDomainEventsByCausationId;
//# sourceMappingURL=getDomainEventsByCausationId.js.map