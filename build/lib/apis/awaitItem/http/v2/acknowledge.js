"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acknowledge = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const defekt_1 = require("defekt");
const validateContentType_1 = require("../../../base/validateContentType");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const acknowledge = {
    description: 'Acknowledges an item from the queue and removes it.',
    path: 'acknowledge',
    request: {
        body: {
            type: 'object',
            properties: {
                discriminator: { type: 'string', minLength: 1 },
                token: { type: 'string', format: 'uuid' }
            },
            required: ['discriminator', 'token'],
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200, 400, 403, 404, 415],
        body: { type: 'object' }
    },
    getHandler({ priorityQueueStore }) {
        const requestBodySchema = new validate_value_1.Value(acknowledge.request.body), responseBodySchema = new validate_value_1.Value(acknowledge.response.body);
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
                const { discriminator, token } = req.body;
                await priorityQueueStore.acknowledge({
                    discriminator,
                    token
                });
                logger.debug('Acknowledged priority queue item.', withLogMetadata_1.withLogMetadata('api', 'awaitItem', { discriminator, token }));
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
                    case errors_1.errors.ItemNotLocked.code: {
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
exports.acknowledge = acknowledge;
//# sourceMappingURL=acknowledge.js.map