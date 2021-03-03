"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryStream = void 0;
const ClientMetadata_1 = require("../../../../common/utils/http/ClientMetadata");
const errors_1 = require("../../../../common/errors");
const executeStreamQueryHandler_1 = require("../../../../common/domain/executeStreamQueryHandler");
const flaschenpost_1 = require("flaschenpost");
const getClientService_1 = require("../../../../common/services/getClientService");
const defekt_1 = require("defekt");
const validateQueryHandlerIdentifier_1 = require("../../../../common/validators/validateQueryHandlerIdentifier");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const writeLine_1 = require("../../../base/writeLine");
const logger = flaschenpost_1.flaschenpost.getLogger();
const queryStream = {
    description: 'Queries a view and returns a stream.',
    path: ':viewName/stream/:queryName',
    request: {
        query: {
            type: 'object',
            properties: {},
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200, 400]
    },
    getHandler({ application }) {
        return async function (req, res) {
            try {
                const queryHandlerIdentifier = {
                    view: { name: req.params.viewName },
                    name: req.params.queryName
                };
                validateQueryHandlerIdentifier_1.validateQueryHandlerIdentifier({ application, queryHandlerIdentifier });
                const resultStream = await executeStreamQueryHandler_1.executeStreamQueryHandler({
                    application,
                    queryHandlerIdentifier,
                    options: req.query,
                    services: {
                        client: getClientService_1.getClientService({ clientMetadata: new ClientMetadata_1.ClientMetadata({ req }) })
                    }
                });
                try {
                    res.startStream({ heartbeatInterval: false });
                    for await (const resultItem of resultStream) {
                        writeLine_1.writeLine({ res, data: resultItem });
                    }
                }
                catch (ex) {
                    logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'queryView', { error: ex }));
                }
                finally {
                    res.end();
                }
            }
            catch (ex) {
                const error = defekt_1.isCustomError(ex) ?
                    ex :
                    new errors_1.errors.UnknownError(undefined, { cause: ex });
                switch (error.code) {
                    case errors_1.errors.ViewNotFound.code:
                    case errors_1.errors.QueryHandlerNotFound.code:
                    case errors_1.errors.QueryOptionsInvalid.code: {
                        res.status(400).json({
                            code: error.code,
                            message: error.message
                        });
                        break;
                    }
                    case errors_1.errors.QueryHandlerTypeMismatch.code: {
                        res.status(400).json({
                            code: error.code,
                            message: 'Can not query for a stream on a value query handler.'
                        });
                        break;
                    }
                    case errors_1.errors.QueryResultInvalid.code: {
                        logger.error('An invalid query result was occured.', withLogMetadata_1.withLogMetadata('api', 'queryView', { error }));
                        res.status(500).json({
                            code: error.code
                        });
                        break;
                    }
                    default: {
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'queryView', { error }));
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
exports.queryStream = queryStream;
//# sourceMappingURL=queryStream.js.map