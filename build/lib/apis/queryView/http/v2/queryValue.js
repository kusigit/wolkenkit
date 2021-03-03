"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryValue = void 0;
const ClientMetadata_1 = require("../../../../common/utils/http/ClientMetadata");
const errors_1 = require("../../../../common/errors");
const executeValueQueryHandler_1 = require("../../../../common/domain/executeValueQueryHandler");
const flaschenpost_1 = require("flaschenpost");
const getClientService_1 = require("../../../../common/services/getClientService");
const defekt_1 = require("defekt");
const validateQueryHandlerIdentifier_1 = require("../../../../common/validators/validateQueryHandlerIdentifier");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const queryValue = {
    description: 'Queries a view and returns a value.',
    path: ':viewName/value/:queryName',
    request: {
        query: {
            type: 'object',
            properties: {},
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200, 400, 404]
    },
    getHandler({ application }) {
        return async function (req, res) {
            try {
                const queryHandlerIdentifier = {
                    view: { name: req.params.viewName },
                    name: req.params.queryName
                };
                validateQueryHandlerIdentifier_1.validateQueryHandlerIdentifier({ application, queryHandlerIdentifier });
                const queryResultItem = await executeValueQueryHandler_1.executeValueQueryHandler({
                    application,
                    queryHandlerIdentifier,
                    options: req.query,
                    services: {
                        client: getClientService_1.getClientService({ clientMetadata: new ClientMetadata_1.ClientMetadata({ req }) })
                    }
                });
                res.status(200).json(queryResultItem);
                return;
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
                        logger.error('An invalid query result was caught.', withLogMetadata_1.withLogMetadata('api', 'queryView', { error }));
                        res.status(404).json({
                            code: errors_1.errors.NotFound.code
                        });
                        break;
                    }
                    case errors_1.errors.QueryNotAuthorized.code: {
                        res.status(404).json({
                            code: errors_1.errors.NotFound.code
                        });
                        break;
                    }
                    case errors_1.errors.NotFound.code: {
                        res.status(404).json({
                            code: error.code
                        });
                        break;
                    }
                    default: {
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'queryView', { error }));
                        res.status(500).json({
                            code: error.code
                        });
                    }
                }
            }
        };
    }
};
exports.queryValue = queryValue;
//# sourceMappingURL=queryValue.js.map