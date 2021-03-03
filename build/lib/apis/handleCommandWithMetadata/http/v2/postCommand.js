"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postCommand = void 0;
const CommandWithMetadata_1 = require("../../../../common/elements/CommandWithMetadata");
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getCommandWithMetadataSchema_1 = require("../../../../common/schemas/getCommandWithMetadataSchema");
const defekt_1 = require("defekt");
const validateCommandWithMetadata_1 = require("../../../../common/validators/validateCommandWithMetadata");
const validateContentType_1 = require("../../../base/validateContentType");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const postCommand = {
    description: 'Accepts a command with metadata for further processing.',
    path: '',
    request: {
        body: getCommandWithMetadataSchema_1.getCommandWithMetadataSchema()
    },
    response: {
        statusCodes: [200, 400, 415],
        body: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' }
            },
            required: ['id'],
            additionalProperties: false
        }
    },
    getHandler({ onReceiveCommand, application }) {
        const requestBodySchema = new validate_value_1.Value(postCommand.request.body), responseBodySchema = new validate_value_1.Value(postCommand.response.body);
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
                    throw new errors_1.errors.CommandMalformed(ex.message);
                }
                const command = new CommandWithMetadata_1.CommandWithMetadata(req.body);
                validateCommandWithMetadata_1.validateCommandWithMetadata({ command, application });
                logger.debug('Received command.', withLogMetadata_1.withLogMetadata('api', 'handleCommandWithMetadata', { command }));
                await onReceiveCommand({ command });
                const response = { id: command.id };
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
                    case errors_1.errors.ContextNotFound.code:
                    case errors_1.errors.AggregateNotFound.code:
                    case errors_1.errors.CommandNotFound.code:
                    case errors_1.errors.CommandMalformed.code: {
                        res.status(400).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    default: {
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'handleCommandWithMetadata', { error }));
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
exports.postCommand = postCommand;
//# sourceMappingURL=postCommand.js.map