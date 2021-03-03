"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postMessage = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const defekt_1 = require("defekt");
const validateContentType_1 = require("../../../base/validateContentType");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const postMessage = {
    description: 'Publishes a message.',
    path: '',
    request: {
        body: {
            type: 'object',
            properties: {
                channel: { type: 'string', minLength: 1 },
                message: { type: 'object' }
            },
            required: ['channel', 'message'],
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200, 415],
        body: { type: 'object' }
    },
    getHandler({ onReceiveMessage }) {
        const requestBodySchema = new validate_value_1.Value(postMessage.request.body), responseBodySchema = new validate_value_1.Value(postMessage.response.body);
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
                const { channel, message } = req.body;
                logger.debug('Received message.', withLogMetadata_1.withLogMetadata('api', 'publishMessage', { channel, message }));
                await onReceiveMessage({ channel, message });
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
                    default: {
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'publishMessage', { error }));
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
exports.postMessage = postMessage;
//# sourceMappingURL=postMessage.js.map