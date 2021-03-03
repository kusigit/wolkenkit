"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postAddFile = void 0;
const ClientMetadata_1 = require("../../../../common/utils/http/ClientMetadata");
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getClientService_1 = require("../../../../common/services/getClientService");
const getErrorService_1 = require("../../../../common/services/getErrorService");
const getLoggerService_1 = require("../../../../common/services/getLoggerService");
const defekt_1 = require("defekt");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const contentTypeRegex = /^\w+\/[-.\w]+(?:\+[-.\w]+)?$/u;
// eslint-disable-next-line @typescript-eslint/no-base-to-string
const contentTypeRegexAsString = contentTypeRegex.toString().slice(1, -2);
const postAddFile = {
    description: 'Adds a file.',
    path: 'add-file',
    request: {
        headers: {
            type: 'object',
            properties: {
                'x-id': { type: 'string', format: 'uuid' },
                'x-name': { type: 'string', minLength: 1 },
                'content-type': { type: 'string', pattern: contentTypeRegexAsString }
            },
            required: [],
            additionalProperties: true
        }
    },
    response: {
        statusCodes: [200, 400, 401, 409, 500],
        body: {
            type: 'object',
            properties: {},
            required: [],
            additionalProperties: false
        }
    },
    getHandler({ application, fileStore }) {
        const requestHeadersSchema = new validate_value_1.Value(postAddFile.request.headers), responseBodySchema = new validate_value_1.Value(postAddFile.response.body);
        return async function (req, res) {
            try {
                try {
                    requestHeadersSchema.validate(req.headers, { valueName: 'requestHeaders' });
                }
                catch (ex) {
                    throw new errors_1.errors.RequestMalformed(ex.message);
                }
                const clientService = getClientService_1.getClientService({ clientMetadata: new ClientMetadata_1.ClientMetadata({ req }) });
                let fileAddMetadata = {
                    id: req.headers['x-id'],
                    name: req.headers['x-name'],
                    contentType: req.headers['content-type']
                };
                if (application.hooks.addingFile) {
                    const errorService = getErrorService_1.getErrorService({ errors: ['NotAuthenticated'] });
                    fileAddMetadata = {
                        ...fileAddMetadata,
                        ...await application.hooks.addingFile(fileAddMetadata, {
                            client: clientService,
                            error: errorService,
                            infrastructure: application.infrastructure,
                            logger: getLoggerService_1.getLoggerService({
                                fileName: '<app>/server/hooks/addingFile',
                                packageManifest: application.packageManifest
                            })
                        })
                    };
                }
                const fileMetadata = await fileStore.addFile({
                    ...fileAddMetadata,
                    stream: req
                });
                if (application.hooks.addedFile) {
                    await application.hooks.addedFile(fileMetadata, {
                        client: clientService,
                        infrastructure: application.infrastructure,
                        logger: getLoggerService_1.getLoggerService({
                            fileName: '<app>/server/hooks/addedFile',
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
                    case errors_1.errors.FileAlreadyExists.code: {
                        res.status(409).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
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
exports.postAddFile = postAddFile;
//# sourceMappingURL=postAddFile.js.map