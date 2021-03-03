"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFile = void 0;
const ClientMetadata_1 = require("../../../../common/utils/http/ClientMetadata");
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getClientService_1 = require("../../../../common/services/getClientService");
const getErrorService_1 = require("../../../../common/services/getErrorService");
const getLoggerService_1 = require("../../../../common/services/getLoggerService");
const defekt_1 = require("defekt");
const stream_1 = require("stream");
const util_1 = require("util");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const pipeline = util_1.promisify(stream_1.pipeline);
const logger = flaschenpost_1.flaschenpost.getLogger();
const getFile = {
    description: 'Returns the requested file.',
    path: 'file/:id',
    request: {},
    response: {
        statusCodes: [200, 400, 401, 404, 500],
        stream: true
    },
    getHandler({ application, fileStore }) {
        return async function (req, res) {
            try {
                const { id } = req.params;
                try {
                    new validate_value_1.Value({
                        type: 'string',
                        format: 'uuid'
                    }).validate(id, { valueName: 'uuid' });
                }
                catch (ex) {
                    throw new errors_1.errors.RequestMalformed(ex.message);
                }
                const clientService = getClientService_1.getClientService({ clientMetadata: new ClientMetadata_1.ClientMetadata({ req }) });
                const fileMetadata = await fileStore.getMetadata({ id });
                if (application.hooks.gettingFile) {
                    const errorService = getErrorService_1.getErrorService({ errors: ['NotAuthenticated'] });
                    await application.hooks.gettingFile(fileMetadata, {
                        client: clientService,
                        error: errorService,
                        infrastructure: application.infrastructure,
                        logger: getLoggerService_1.getLoggerService({
                            fileName: '<app>/server/hooks/gettingFile',
                            packageManifest: application.packageManifest
                        })
                    });
                }
                const stream = await fileStore.getFile({ id });
                res.set('x-id', fileMetadata.id);
                res.set('x-name', fileMetadata.name);
                res.set('content-type', fileMetadata.contentType);
                res.set('content-length', String(fileMetadata.contentLength));
                res.set('content-disposition', `inline; filename=${fileMetadata.name}`);
                await pipeline(stream, res);
                try {
                    if (application.hooks.gotFile) {
                        await application.hooks.gotFile(fileMetadata, {
                            client: clientService,
                            infrastructure: application.infrastructure,
                            logger: getLoggerService_1.getLoggerService({
                                fileName: '<app>/server/hooks/gotFile',
                                packageManifest: application.packageManifest
                            })
                        });
                    }
                }
                catch (ex) {
                    logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'manageFile', { error: ex }));
                }
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
                    case errors_1.errors.FileNotFound.code: {
                        res.status(404).json({
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
exports.getFile = getFile;
//# sourceMappingURL=getFile.js.map