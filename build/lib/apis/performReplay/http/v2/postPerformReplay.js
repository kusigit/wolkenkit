"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postPerformReplay = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getAggregateIdentifierSchema_1 = require("../../../../common/schemas/getAggregateIdentifierSchema");
const defekt_1 = require("defekt");
const validateAggregateIdentifier_1 = require("../../../../common/validators/validateAggregateIdentifier");
const validateContentType_1 = require("../../../base/validateContentType");
const validateFlowNames_1 = require("../../../../common/validators/validateFlowNames");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const postPerformReplay = {
    description: 'Performs a replay.',
    path: '',
    request: {
        body: {
            type: 'object',
            properties: {
                flowNames: {
                    type: 'array',
                    items: { type: 'string', minLength: 1 },
                    minItems: 1
                },
                aggregates: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            aggregateIdentifier: getAggregateIdentifierSchema_1.getAggregateIdentifierSchema(),
                            from: { type: 'number', minimum: 1 },
                            to: { type: 'number', minimum: 1 }
                        },
                        required: ['aggregateIdentifier', 'from', 'to']
                    },
                    minItems: 1
                }
            },
            required: ['aggregates'],
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200, 400, 415],
        body: {
            type: 'object',
            properties: {},
            required: [],
            additionalProperties: false
        }
    },
    getHandler({ performReplay, application }) {
        const requestBodySchema = new validate_value_1.Value(postPerformReplay.request.body), responseBodySchema = new validate_value_1.Value(postPerformReplay.response.body);
        return async function (req, res) {
            try {
                validateContentType_1.validateContentType({
                    expectedContentType: 'application/json',
                    req
                });
                try {
                    requestBodySchema.validate(req.body, { valueName: 'requestBody' });
                }
                catch (ex) {
                    throw new errors_1.errors.RequestMalformed(ex.message);
                }
                const { flowNames = Object.keys(application.flows), aggregates } = req.body;
                validateFlowNames_1.validateFlowNames({ flowNames, application });
                for (const aggregate of aggregates) {
                    validateAggregateIdentifier_1.validateAggregateIdentifier({
                        aggregateIdentifier: aggregate.aggregateIdentifier,
                        application
                    });
                }
                logger.debug('Received request for replay.', withLogMetadata_1.withLogMetadata('api', 'performReplay', { flowNames, aggregates }));
                await performReplay({ flowNames, aggregates });
                const response = {};
                responseBodySchema.validate(response, { valueName: 'responseBody' });
                res.status(200).json(response);
            }
            catch (ex) {
                const error = defekt_1.isCustomError(ex) ?
                    ex :
                    new errors_1.errors.UnknownError(undefined, { cause: ex });
                switch (error.code) {
                    case errors_1.errors.ContentTypeMismatch.code: {
                        res.status(415).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    case errors_1.errors.RequestMalformed.code:
                    case errors_1.errors.FlowNotFound.code:
                    case errors_1.errors.ContextNotFound.code:
                    case errors_1.errors.AggregateNotFound.code: {
                        res.status(400).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    default: {
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'performReplay', { error }));
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
exports.postPerformReplay = postPerformReplay;
//# sourceMappingURL=postPerformReplay.js.map