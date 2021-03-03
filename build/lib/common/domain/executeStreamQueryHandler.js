"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeStreamQueryHandler = void 0;
const errors_1 = require("../errors");
const flaschenpost_1 = require("flaschenpost");
const getLoggerService_1 = require("../services/getLoggerService");
const validateQueryHandlerIdentifier_1 = require("../validators/validateQueryHandlerIdentifier");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../utils/logging/withLogMetadata");
const stream_1 = require("stream");
const logger = flaschenpost_1.flaschenpost.getLogger();
const executeStreamQueryHandler = async function ({ application, queryHandlerIdentifier, options, services }) {
    var _a;
    validateQueryHandlerIdentifier_1.validateQueryHandlerIdentifier({ application, queryHandlerIdentifier });
    const queryHandler = application.views[queryHandlerIdentifier.view.name].queryHandlers[queryHandlerIdentifier.name];
    if (queryHandler.type !== 'stream') {
        throw new errors_1.errors.QueryHandlerTypeMismatch();
    }
    const optionsSchema = new validate_value_1.Value(queryHandler.getOptionsSchema ? queryHandler.getOptionsSchema() : {}), resultItemSchema = new validate_value_1.Value(queryHandler.getResultItemSchema ? queryHandler.getResultItemSchema() : {});
    try {
        optionsSchema.validate(options, { valueName: 'queryHandlerOptions' });
    }
    catch (ex) {
        throw new errors_1.errors.QueryOptionsInvalid(ex.message);
    }
    const loggerService = (_a = services.logger) !== null && _a !== void 0 ? _a : getLoggerService_1.getLoggerService({
        fileName: `<app>/server/views/${queryHandlerIdentifier.view.name}/queryHandlers/${queryHandlerIdentifier.name}`,
        packageManifest: application.packageManifest
    });
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const resultStream = await queryHandler.handle(options, {
        client: services.client,
        infrastructure: application.infrastructure,
        logger: loggerService
    });
    const isAuthorizedServices = {
        client: services.client,
        logger: loggerService
    };
    const validateStream = new stream_1.Transform({
        objectMode: true,
        transform(resultItem, encoding, callback) {
            if (!queryHandler.isAuthorized(resultItem, isAuthorizedServices)) {
                return callback(null);
            }
            try {
                resultItemSchema.validate(resultItem, { valueName: 'resultItem' });
            }
            catch (ex) {
                const error = new errors_1.errors.QueryResultInvalid(ex.message);
                logger.warn(`An invalid item was omitted from a stream query handler's response.`, withLogMetadata_1.withLogMetadata('common', 'executeStreamQueryHandler', { error }));
                return callback(null);
            }
            return callback(null, resultItem);
        }
    });
    stream_1.pipeline(resultStream, validateStream, (err) => {
        if (err) {
            logger.error('An error occured during stream piping.', withLogMetadata_1.withLogMetadata('common', 'executeStreamQueryHandler', { err }));
        }
    });
    return validateStream;
};
exports.executeStreamQueryHandler = executeStreamQueryHandler;
//# sourceMappingURL=executeStreamQueryHandler.js.map