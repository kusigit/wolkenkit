"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFlowNames = void 0;
const errors_1 = require("../errors");
const validateFlowNames = function ({ flowNames, application }) {
    for (const flowName of flowNames) {
        if (!(flowName in application.flows)) {
            throw new errors_1.errors.FlowNotFound(`Flow '${flowName}' not found.`);
        }
    }
};
exports.validateFlowNames = validateFlowNames;
//# sourceMappingURL=validateFlowNames.js.map