"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelCommand = void 0;
const ClientMetadata_1 = require("../../../../common/utils/http/ClientMetadata");
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getItemIdentifierSchema_1 = require("../../../../common/schemas/getItemIdentifierSchema");
const defekt_1 = require("defekt");
const validateContentType_1 = require("../../../base/validateContentType");
const validateItemIdentifier_1 = require("../../../../common/validators/validateItemIdentifier");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const cancelCommand = {
    description: 'Cancels a command that has not been processed yet.',
    path: 'cancel',
    request: {
        body: getItemIdentifierSchema_1.getItemIdentifierSchema()
    },
    response: {
        statusCodes: [200, 400, 401, 404, 415],
        body: { type: 'object' }
    },
    getHandler({ onCancelCommand, application }) {
        const requestBodySchema = new validate_value_1.Value(cancelCommand.request.body), responseBodySchema = new validate_value_1.Value(cancelCommand.response.body);
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
                const commandIdentifier = req.body;
                validateItemIdentifier_1.validateItemIdentifier({ itemIdentifier: commandIdentifier, application, itemType: 'command' });
                const commandIdentifierWithClient = {
                    ...commandIdentifier,
                    client: new ClientMetadata_1.ClientMetadata({ req })
                };
                logger.debug('Received request to cancel command.', withLogMetadata_1.withLogMetadata('api', 'handleCommand', { commandIdentifierWithClient }));
                await onCancelCommand({ commandIdentifierWithClient });
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
                    case errors_1.errors.ContextNotFound.code:
                    case errors_1.errors.AggregateNotFound.code:
                    case errors_1.errors.CommandNotFound.code: {
                        res.status(400).json({
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
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'handleCommand', { error }));
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
exports.cancelCommand = cancelCommand;
//# sourceMappingURL=cancelCommand.js.map