"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQueryHandlerIdentifier = void 0;
const errors_1 = require("../errors");
const validateQueryHandlerIdentifier = function ({ queryHandlerIdentifier, application }) {
    const viewDefinitions = application.views;
    const { view: { name: viewName }, name } = queryHandlerIdentifier;
    if (!(viewName in viewDefinitions)) {
        throw new errors_1.errors.ViewNotFound(`View '${viewName}' not found.`);
    }
    if (!(name in viewDefinitions[viewName].queryHandlers)) {
        throw new errors_1.errors.QueryHandlerNotFound(`Query handler '${viewName}.${name}' not found.`);
    }
};
exports.validateQueryHandlerIdentifier = validateQueryHandlerIdentifier;
//# sourceMappingURL=validateQueryHandlerIdentifier.js.map