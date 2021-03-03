"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDomainEventHandler = void 0;
const errors_1 = require("../errors");
const lodash_1 = require("lodash");
const validateDomainEventHandler = function ({ domainEventHandler }) {
    if (!lodash_1.isObjectLike(domainEventHandler)) {
        throw new errors_1.errors.DomainEventHandlerMalformed(`Property 'domainEventHandler' is not an object.`);
    }
    if (lodash_1.isUndefined(domainEventHandler.handle)) {
        throw new errors_1.errors.DomainEventHandlerMalformed(`Function 'handle' is missing.`);
    }
    if (!lodash_1.isFunction(domainEventHandler.handle)) {
        throw new errors_1.errors.DomainEventHandlerMalformed(`Property 'handle' is not a function.`);
    }
    if (lodash_1.isUndefined(domainEventHandler.isAuthorized)) {
        throw new errors_1.errors.DomainEventHandlerMalformed(`Function 'isAuthorized' is missing.`);
    }
    if (!lodash_1.isFunction(domainEventHandler.isAuthorized)) {
        throw new errors_1.errors.DomainEventHandlerMalformed(`Property 'isAuthorized' is not a function.`);
    }
    if (!lodash_1.isUndefined(domainEventHandler.getDocumentation) && !lodash_1.isFunction(domainEventHandler.getDocumentation)) {
        throw new errors_1.errors.DomainEventHandlerMalformed(`Property 'getDocumentation' is not a function.`);
    }
    if (!lodash_1.isUndefined(domainEventHandler.getSchema) && !lodash_1.isFunction(domainEventHandler.getSchema)) {
        throw new errors_1.errors.DomainEventHandlerMalformed(`Property 'getSchema' is not a function.`);
    }
    if (!lodash_1.isUndefined(domainEventHandler.filter) && !lodash_1.isFunction(domainEventHandler.filter)) {
        throw new errors_1.errors.DomainEventHandlerMalformed(`Property 'filter' is not a function.`);
    }
    if (!lodash_1.isUndefined(domainEventHandler.map) && !lodash_1.isFunction(domainEventHandler.map)) {
        throw new errors_1.errors.DomainEventHandlerMalformed(`Property 'map' is not a function.`);
    }
};
exports.validateDomainEventHandler = validateDomainEventHandler;
//# sourceMappingURL=validateDomainEventHandler.js.map