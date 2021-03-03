"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFlowDomainEventHandler = void 0;
const errors_1 = require("../errors");
const lodash_1 = require("lodash");
const validateFlowDomainEventHandler = function ({ domainEventHandler }) {
    if (!lodash_1.isObjectLike(domainEventHandler)) {
        throw new errors_1.errors.FlowDomainEventHandlerMalformed(`Property 'domainEventHandler' is not an object.`);
    }
    if (lodash_1.isUndefined(domainEventHandler.isRelevant)) {
        throw new errors_1.errors.FlowDomainEventHandlerMalformed(`Function 'isRelevant' is missing.`);
    }
    if (!lodash_1.isFunction(domainEventHandler.isRelevant)) {
        throw new errors_1.errors.FlowDomainEventHandlerMalformed(`Property 'isRelevant' is not a function.`);
    }
    if (lodash_1.isUndefined(domainEventHandler.handle)) {
        throw new errors_1.errors.FlowDomainEventHandlerMalformed(`Function 'handle' is missing.`);
    }
    if (!lodash_1.isFunction(domainEventHandler.handle)) {
        throw new errors_1.errors.FlowDomainEventHandlerMalformed(`Property 'handle' is not a function.`);
    }
};
exports.validateFlowDomainEventHandler = validateFlowDomainEventHandler;
//# sourceMappingURL=validateFlowDomainEventHandler.js.map