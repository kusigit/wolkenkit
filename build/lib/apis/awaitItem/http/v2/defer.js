"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defer = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const defekt_1 = require("defekt");
const validateContentType_1 = require("../../../base/validateContentType");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const defer = {
    description: 'Defers an item from the queue.',
    path: 'defer',
    request: {
        body: {
            type: 'object',
            properties: {
                discriminator: { type: 'string', minLength: 1 },
                token: { type: 'string', format: 'uuid' },
                priority: { type: 'number', minimum: 0 }
            },
            required: ['discriminator', 'token', 'priority'],
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200, 400, 403, 404, 415],
        body: { type: 'object' }
    },
    getHandler({ priorityQueueStore }) {
        const requestBodySchema = new validate_value_1.Value(defer.request.body), responseBodySchema = new validate_value_1.Value(defer.response.body);
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
                const { discriminator, token, priority } = req.body;
                await priorityQueueStore.defer({
                    discriminator,
                    token,
                    priority
                });
                logger.debug('Deferred priority queue item.', withLogMetadata_1.withLogMetadata('api', 'awaitItem', { discriminator, priority }));
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
                    case errors_1.errors.RequestMalformed.code: {
                        res.status(400).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    case errors_1.errors.TokenMismatch.code: {
                        res.status(403).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    case errors_1.errors.ItemNotFound.code: {
                        res.status(404).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    default: {
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'awaitItem', { error }));
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
exports.defer = defer;
//# sourceMappingURL=defer.js.map