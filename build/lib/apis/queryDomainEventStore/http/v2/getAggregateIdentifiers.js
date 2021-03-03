"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAggregateIdentifiers = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getAggregateIdentifierSchema_1 = require("../../../../common/schemas/getAggregateIdentifierSchema");
const defekt_1 = require("defekt");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const writeLine_1 = require("../../../base/writeLine");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getAggregateIdentifiers = {
    description: 'Streams all aggregate identifiers that have domain events in the store.',
    path: 'get-aggregate-identifiers',
    request: {
        query: {
            type: 'object',
            properties: {},
            required: [],
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200, 400],
        stream: true,
        body: getAggregateIdentifierSchema_1.getAggregateIdentifierSchema()
    },
    getHandler({ domainEventStore, heartbeatInterval }) {
        const querySchema = new validate_value_1.Value(getAggregateIdentifiers.request.query), responseBodySchema = new validate_value_1.Value(getAggregateIdentifiers.response.body);
        return async function (req, res) {
            try {
                try {
                    querySchema.validate(req.query, { valueName: 'requestQuery' });
                }
                catch (ex) {
                    throw new errors_1.errors.RequestMalformed(ex.message);
                }
                res.startStream({ heartbeatInterval });
                const aggregateIdentifierStream = await domainEventStore.getAggregateIdentifiers();
                for await (const aggregateIdentifier of aggregateIdentifierStream) {
                    try {
                        responseBodySchema.validate(aggregateIdentifier, { valueName: 'responseBody' });
                        writeLine_1.writeLine({ res, data: aggregateIdentifier });
                    }
                    catch {
                        logger.warn('Dropped invalid aggregate identifier.', withLogMetadata_1.withLogMetadata('api', 'queryDomainEventStore', { aggregateIdentifier }));
                    }
                }
                res.end();
                return;
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
exports.getAggregateIdentifiers = getAggregateIdentifiers;
//# sourceMappingURL=getAggregateIdentifiers.js.map