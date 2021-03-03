"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasDomainEventsWithCausationId = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const defekt_1 = require("defekt");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const hasDomainEventsWithCausationId = {
    description: 'Checks wether domain events with a given causation id exist.',
    path: 'has-domain-events-with-causation-id',
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
        body: {
            type: 'object',
            properties: {
                hasDomainEventsWithCausationId: { type: 'boolean' }
            },
            required: ['hasDomainEventsWithCausationId'],
            additionalProperties: false
        }
    },
    getHandler({ domainEventStore }) {
        const querySchema = new validate_value_1.Value(hasDomainEventsWithCausationId.request.query), responseBodySchema = new validate_value_1.Value(hasDomainEventsWithCausationId.response.body);
        return async function (req, res) {
            try {
                let causationId;
                try {
                    querySchema.validate(req.query, { valueName: 'requestQuery' });
                    causationId = req.query['causation-id'];
                }
                catch (ex) {
                    throw new errors_1.errors.RequestMalformed(ex.message);
                }
                const hasDomainEvents = await domainEventStore.hasDomainEventsWithCausationId({ causationId }), response = { hasDomainEventsWithCausationId: hasDomainEvents };
                responseBodySchema.validate(response, { valueName: 'responseBody' });
                res.json(response);
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
exports.hasDomainEventsWithCausationId = hasDomainEventsWithCausationId;
//# sourceMappingURL=hasDomainEventsWithCausationId.js.map