"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastDomainEvent = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getAggregateIdentifierSchema_1 = require("../../../../common/schemas/getAggregateIdentifierSchema");
const getDomainEventSchema_1 = require("../../../../common/schemas/getDomainEventSchema");
const defekt_1 = require("defekt");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getLastDomainEvent = {
    description: 'Returns the last domain event.',
    path: 'last-domain-event',
    request: {
        query: {
            type: 'object',
            properties: {
                aggregateIdentifier: getAggregateIdentifierSchema_1.getAggregateIdentifierSchema()
            },
            required: ['aggregateIdentifier'],
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200, 400, 404],
        body: getDomainEventSchema_1.getDomainEventSchema()
    },
    getHandler({ domainEventStore }) {
        const querySchema = new validate_value_1.Value(getLastDomainEvent.request.query), responseBodySchema = new validate_value_1.Value(getLastDomainEvent.response.body);
        return async function (req, res) {
            try {
                const { aggregateIdentifier } = req.query;
                try {
                    querySchema.validate(req.query, { valueName: 'requestQuery' });
                }
                catch (ex) {
                    throw new errors_1.errors.AggregateIdentifierMalformed(ex.message);
                }
                const lastDomainEvent = await domainEventStore.getLastDomainEvent({ aggregateIdentifier });
                if (!lastDomainEvent) {
                    throw new errors_1.errors.DomainEventNotFound();
                }
                responseBodySchema.validate(lastDomainEvent, { valueName: 'responseBody' });
                res.json(lastDomainEvent);
            }
            catch (ex) {
                const error = defekt_1.isCustomError(ex) ?
                    ex :
                    new errors_1.errors.UnknownError(undefined, { cause: ex });
                switch (error.code) {
                    case errors_1.errors.AggregateIdentifierMalformed.code: {
                        res.status(400).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    case errors_1.errors.DomainEventNotFound.code: {
                        res.status(404).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    default: {
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'queryDomainEventStore', { error }));
                        return res.status(400).json({
                            code: error.code,
                            message: error.message
                        });
                    }
                }
            }
        };
    }
};
exports.getLastDomainEvent = getLastDomainEvent;
//# sourceMappingURL=getLastDomainEvent.js.map