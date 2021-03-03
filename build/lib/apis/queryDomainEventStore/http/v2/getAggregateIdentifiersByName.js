"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAggregateIdentifiersByName = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getAggregateIdentifierSchema_1 = require("../../../../common/schemas/getAggregateIdentifierSchema");
const defekt_1 = require("defekt");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const writeLine_1 = require("../../../base/writeLine");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getAggregateIdentifiersByName = {
    description: 'Streams all aggregate identifiers matching the given name that have domain events in the store.',
    path: 'get-aggregate-identifiers-by-name',
    request: {
        query: {
            type: 'object',
            properties: {
                contextName: { type: 'string', minLength: 1 },
                aggregateName: { type: 'string', minLength: 1 }
            },
            required: ['contextName', 'aggregateName'],
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200, 400],
        stream: true,
        body: getAggregateIdentifierSchema_1.getAggregateIdentifierSchema()
    },
    getHandler({ domainEventStore, heartbeatInterval }) {
        const querySchema = new validate_value_1.Value(getAggregateIdentifiersByName.request.query), responseBodySchema = new validate_value_1.Value(getAggregateIdentifiersByName.response.body);
        return async function (req, res) {
            try {
                try {
                    querySchema.validate(req.query, { valueName: 'requestQuery' });
                }
                catch (ex) {
                    throw new errors_1.errors.RequestMalformed(ex.message);
                }
                res.startStream({ heartbeatInterval });
                const aggregateIdentifierStream = await domainEventStore.getAggregateIdentifiersByName({
                    contextName: req.query.contextName,
                    aggregateName: req.query.aggregateName
                });
                for await (const aggregateIdentifier of aggregateIdentifierStream) {
                    try {
                        responseBodySchema.validate(aggregateIdentifier, { valueName: 'responseBody' });
                        writeLine_1.writeLine({ res, data: aggregateIdentifier });
                    }
                    catch {
                        logger.warn('Dropped invalid aggregate identifier.', withLogMetadata_1.withLogMetadata('api', 'queryDomainEventStore', { aggregateIdentifier }));
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
exports.getAggregateIdentifiersByName = getAggregateIdentifiersByName;
//# sourceMappingURL=getAggregateIdentifiersByName.js.map