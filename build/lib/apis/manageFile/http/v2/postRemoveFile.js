"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRemoveFile = void 0;
const ClientMetadata_1 = require("../../../../common/utils/http/ClientMetadata");
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getClientService_1 = require("../../../../common/services/getClientService");
const getErrorService_1 = require("../../../../common/services/getErrorService");
const getLoggerService_1 = require("../../../../common/services/getLoggerService");
const defekt_1 = require("defekt");
const validateContentType_1 = require("../../../base/validateContentType");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const postRemoveFile = {
    description: 'Removes a file.',
    path: 'remove-file',
    request: {
        body: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' }
            },
            required: ['id'],
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200, 400, 401, 404, 415, 500],
        body: {
            type: 'object',
            properties: {},
            required: [],
            additionalProperties: false
        }
    },
    getHandler({ application, fileStore }) {
        const requestBodySchema = new validate_value_1.Value(postRemoveFile.request.body), responseBodySchema = new validate_value_1.Value(postRemoveFile.response.body);
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
                const { id } = req.body;
                const clientService = getClientService_1.getClientService({ clientMetadata: new ClientMetadata_1.ClientMetadata({ req }) });
                const fileMetadata = await fileStore.getMetadata({ id });
                if (application.hooks.removingFile) {
                    const errorService = getErrorService_1.getErrorService({ errors: ['NotAuthenticated'] });
                    await application.hooks.removingFile(fileMetadata, {
                        client: clientService,
                        error: errorService,
                        infrastructure: application.infrastructure,
                        logger: getLoggerService_1.getLoggerService({
                            fileName: '<app>/server/hooks/removingFile',
                            packageManifest: application.packageManifest
                        })
                    });
                }
                await fileStore.removeFile({ id });
                if (application.hooks.removedFile) {
                    await application.hooks.removedFile(fileMetadata, {
                        client: clientService,
                        infrastructure: application.infrastructure,
                        logger: getLoggerService_1.getLoggerService({
                            fileName: '<app>/server/hooks/removedFile',
                            packageManifest: application.packageManifest
                        })
                    });
                }
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
                    case errors_1.errors.NotAuthenticated.code: {
                        res.status(401).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    case errors_1.errors.FileNotFound.code: {
                        res.status(404).json({
                            code: error.code,
                            message: error.message
                        });
                        break;
                    }
                    default: {
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'manageFile', { error }));
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
exports.postRemoveFile = postRemoveFile;
//# sourceMappingURL=postRemoveFile.js.map