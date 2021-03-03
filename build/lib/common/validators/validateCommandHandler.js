"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCommandHandler = void 0;
const errors_1 = require("../errors");
const lodash_1 = require("lodash");
const validateCommandHandler = function ({ commandHandler }) {
    if (!lodash_1.isObjectLike(commandHandler)) {
        throw new errors_1.errors.CommandHandlerMalformed(`Property 'commandHandler' is not an object.`);
    }
    if (lodash_1.isUndefined(commandHandler.isAuthorized)) {
        throw new errors_1.errors.CommandHandlerMalformed(`Function 'isAuthorized' is missing.`);
    }
    if (!lodash_1.isFunction(commandHandler.isAuthorized)) {
        throw new errors_1.errors.CommandHandlerMalformed(`Property 'isAuthorized' is not a function.`);
    }
    if (lodash_1.isUndefined(commandHandler.handle)) {
        throw new errors_1.errors.CommandHandlerMalformed(`Function 'handle' is missing.`);
    }
    if (!lodash_1.isFunction(commandHandler.handle)) {
        throw new errors_1.errors.CommandHandlerMalformed(`Property 'handle' is not a function.`);
    }
    if (!lodash_1.isUndefined(commandHandler.getDocumentation) && !lodash_1.isFunction(commandHandler.getDocumentation)) {
        throw new errors_1.errors.CommandHandlerMalformed(`Property 'getDocumentation' is not a function.`);
    }
    if (!lodash_1.isUndefined(commandHandler.getSchema) && !lodash_1.isFunction(commandHandler.getSchema)) {
        throw new errors_1.errors.CommandHandlerMalformed(`Property 'getSchema' is not a function.`);
    }
};
exports.validateCommandHandler = validateCommandHandler;
//# sourceMappingURL=validateCommandHandler.js.map