"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFlowDefinition = void 0;
const errors_1 = require("../errors");
const validateFlowDomainEventHandler_1 = require("./validateFlowDomainEventHandler");
const lodash_1 = require("lodash");
const validateFlowDefinition = function ({ flowDefinition }) {
    if (!lodash_1.isObjectLike(flowDefinition)) {
        throw new errors_1.errors.FlowDefinitionMalformed('Flow handler is not an object.');
    }
    if (lodash_1.isUndefined(flowDefinition.domainEventHandlers)) {
        throw new errors_1.errors.FlowDefinitionMalformed(`Object 'domainEventHandlers' is missing.`);
    }
    if (!lodash_1.isObjectLike(flowDefinition.domainEventHandlers)) {
        throw new errors_1.errors.FlowDefinitionMalformed(`Property 'domainEventHandlers' is not an object.`);
    }
    for (const [domainEventHandlerName, domainEventHandler] of Object.entries(flowDefinition.domainEventHandlers)) {
        try {
            validateFlowDomainEventHandler_1.validateFlowDomainEventHandler({ domainEventHandler });
        }
        catch (ex) {
            throw new errors_1.errors.FlowDefinitionMalformed(`Domain event handler '${domainEventHandlerName}' is malformed: ${ex.message}`);
        }
    }
    if (!lodash_1.isUndefined(flowDefinition.enhancers)) {
        if (!lodash_1.isArray(flowDefinition.enhancers)) {
            throw new errors_1.errors.FlowDefinitionMalformed(`Property 'enhancers' is not an array.`);
        }
        for (const [index, enhancer] of flowDefinition.enhancers.entries()) {
            if (!lodash_1.isFunction(enhancer)) {
                throw new errors_1.errors.FlowDefinitionMalformed(`Flow enhancer at index '${index}' is not a function.`);
            }
        }
    }
};
exports.validateFlowDefinition = validateFlowDefinition;
//# sourceMappingURL=validateFlowDefinition.js.map