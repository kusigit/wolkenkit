"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeValueQueryHandler = void 0;
const errors_1 = require("../errors");
const getErrorService_1 = require("../services/getErrorService");
const getLoggerService_1 = require("../services/getLoggerService");
const validateQueryHandlerIdentifier_1 = require("../validators/validateQueryHandlerIdentifier");
const validate_value_1 = require("validate-value");
const executeValueQueryHandler = async function ({ application, queryHandlerIdentifier, options, services }) {
    var _a;
    validateQueryHandlerIdentifier_1.validateQueryHandlerIdentifier({ application, queryHandlerIdentifier });
    const queryHandler = application.views[queryHandlerIdentifier.view.name].queryHandlers[queryHandlerIdentifier.name];
    if (queryHandler.type !== 'value') {
        throw new errors_1.errors.QueryHandlerTypeMismatch();
    }
    const optionsSchema = new validate_value_1.Value(queryHandler.getOptionsSchema ? queryHandler.getOptionsSchema() : {}), resultSchema = new validate_value_1.Value(queryHandler.getResultItemSchema ? queryHandler.getResultItemSchema() : {});
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
    const result = await queryHandler.handle(options, {
        client: services.client,
        error: getErrorService_1.getErrorService({ errors: ['NotFound'] }),
        infrastructure: application.infrastructure,
        logger: loggerService
    });
    const isAuthorizedServices = {
        client: services.client,
        logger: loggerService
    };
    if (!queryHandler.isAuthorized(result, isAuthorizedServices)) {
        throw new errors_1.errors.QueryNotAuthorized();
    }
    try {
        resultSchema.validate(result, { valueName: 'result' });
    }
    catch (ex) {
        throw new errors_1.errors.QueryResultInvalid(ex.message);
    }
    return result;
};
exports.executeValueQueryHandler = executeValueQueryHandler;
//# sourceMappingURL=executeValueQueryHandler.js.map