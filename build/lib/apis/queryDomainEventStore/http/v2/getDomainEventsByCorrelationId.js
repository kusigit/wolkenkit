"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDomainEventsByCorrelationId = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getDomainEventSchema_1 = require("../../../../common/schemas/getDomainEventSchema");
const defekt_1 = require("defekt");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const writeLine_1 = require("../../../base/writeLine");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getDomainEventsByCorrelationId = {
    description: 'Streams all domain events with a matching correlation id.',
    path: 'domain-events-by-correlation-id',
    request: {
        query: {
            type: 'object',
            properties: {
                'correlation-id': { type: 'string', format: 'uuid' }
            },
            required: ['correlation-id'],
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200],
        stream: true,
        body: getDomainEventSchema_1.getDomainEventSchema()
    },
    getHandler({ domainEventStore, heartbeatInterval }) {
        const querySchema = new validate_value_1.Value(getDomainEventsByCorrelationId.request.query), responseBodySchema = new validate_value_1.Value(getDomainEventsByCorrelationId.response.body);
        return async function (req, res) {
            try {
                try {
                    querySchema.validate(req.query, { valueName: 'requestQuery' });
                }
                catch (ex) {
                    res.status(400).end(ex.message);
                }
                const correlationId = req.query['correlation-id'];
                res.startStream({ heartbeatInterval });
                const domainEventStream = await domainEventStore.getDomainEventsByCorrelationId({ correlationId });
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
exports.getDomainEventsByCorrelationId = getDomainEventsByCorrelationId;
//# sourceMappingURL=getDomainEventsByCorrelationId.js.map