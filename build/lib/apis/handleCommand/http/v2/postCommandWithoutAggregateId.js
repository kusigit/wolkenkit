"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postCommandWithoutAggregateId = void 0;
const ClientMetadata_1 = require("../../../../common/utils/http/ClientMetadata");
const Command_1 = require("../../../../common/elements/Command");
const CommandWithMetadata_1 = require("../../../../common/elements/CommandWithMetadata");
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getCommandSchema_1 = require("../../../../common/schemas/getCommandSchema");
const defekt_1 = require("defekt");
const uuid_1 = require("uuid");
const validateCommand_1 = require("../../../../common/validators/validateCommand");
const validateContentType_1 = require("../../../base/validateContentType");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const postCommandWithoutAggregateId = {
    description: 'Accepts a command for further processing.',
    path: ':contextName/:aggregateName/:commandName',
    request: {
        body: { type: 'object' }
    },
    response: {
        statusCodes: [200, 400, 401, 415],
        body: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                aggregateIdentifier: {
                    type: 'object',
                    properties: {
                        aggregate: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', format: 'uuid' }
                            },
                            required: ['id'],
                            additionalProperties: false
                        }
                    },
                    required: ['aggregate'],
                    additionalProperties: false
                }
            },
            required: ['id', 'aggregateIdentifier'],
            additionalProperties: false
        }
    },
    getHandler({ onReceiveCommand, application }) {
        const responseBodySchema = new validate_value_1.Value(postCommandWithoutAggregateId.response.body);
        return async function (req, res) {
            try {
                validateContentType_1.validateContentType({
                    expectedContentType: 'application/json',
                    req
                });
                const aggregateId = uuid_1.v4();
                const command = new Command_1.Command({
                    aggregateIdentifier: {
                        context: {
                            name: req.params.contextName
                        },
                        aggregate: {
                            name: req.params.aggregateName,
                            id: aggregateId
                        }
                    },
                    name: req.params.commandName,
                    data: req.body
                });
                try {
                    new validate_value_1.Value(getCommandSchema_1.getCommandSchema()).validate(command, { valueName: 'command' });
                }
                catch (ex) {
                    throw new errors_1.errors.RequestMalformed(ex.message);
                }
                validateCommand_1.validateCommand({ command, application });
                const commandId = uuid_1.v4();
                const commandWithMetadata = new CommandWithMetadata_1.CommandWithMetadata({
                    ...command,
                    id: commandId,
                    metadata: {
                        causationId: commandId,
                        correlationId: commandId,
                        timestamp: Date.now(),
                        client: new ClientMetadata_1.ClientMetadata({ req }),
                        initiator: { user: req.user }
                    }
                });
                logger.debug('Received command.', withLogMetadata_1.withLogMetadata('api', 'handleCommand', { command: commandWithMetadata }));
                await onReceiveCommand({ command: commandWithMetadata });
                const response = {
                    id: commandId,
                    aggregateIdentifier: {
                        aggregate: {
                            id: commandWithMetadata.aggregateIdentifier.aggregate.id
                        }
                    }
                };
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
exports.postCommandWithoutAggregateId = postCommandWithoutAggregateId;
//# sourceMappingURL=postCommandWithoutAggregateId.js.map