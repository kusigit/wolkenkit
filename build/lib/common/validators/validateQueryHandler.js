"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQueryHandler = void 0;
const errors_1 = require("../errors");
const lodash_1 = require("lodash");
const validateQueryHandler = function ({ queryHandler }) {
    if (!lodash_1.isObjectLike(queryHandler)) {
        throw new errors_1.errors.QueryHandlerMalformed(`Query handler is not an object.`);
    }
    if (lodash_1.isUndefined(queryHandler.type)) {
        throw new errors_1.errors.QueryHandlerMalformed(`Property 'type' is missing.`);
    }
    if (queryHandler.type !== 'value' && queryHandler.type !== 'stream') {
        throw new errors_1.errors.QueryHandlerMalformed(`Property 'type' must either be 'value' or 'stream'.`);
    }
    if (lodash_1.isUndefined(queryHandler.handle)) {
        throw new errors_1.errors.QueryHandlerMalformed(`Function 'handle' is missing.`);
    }
    if (!lodash_1.isFunction(queryHandler.handle)) {
        throw new errors_1.errors.QueryHandlerMalformed(`Property 'handle' is not a function.`);
    }
    if (lodash_1.isUndefined(queryHandler.isAuthorized)) {
        throw new errors_1.errors.QueryHandlerMalformed(`Function 'isAuthorized' is missing.`);
    }
    if (!lodash_1.isFunction(queryHandler.isAuthorized)) {
        throw new errors_1.errors.QueryHandlerMalformed(`Property 'isAuthorized' is not a function.`);
    }
    if (!lodash_1.isUndefined(queryHandler.getDocumentation) && !lodash_1.isFunction(queryHandler.getDocumentation)) {
        throw new errors_1.errors.QueryHandlerMalformed(`Property 'getDocumentation' is not a function.`);
    }
    if (!lodash_1.isUndefined(queryHandler.getOptionsSchema) && !lodash_1.isFunction(queryHandler.getOptionsSchema)) {
        throw new errors_1.errors.QueryHandlerMalformed(`Property 'getOptionsSchema' is not a function.`);
    }
    if (!lodash_1.isUndefined(queryHandler.getItemSchema) && !lodash_1.isFunction(queryHandler.getItemSchema)) {
        throw new errors_1.errors.QueryHandlerMalformed(`Property 'getItemSchema' is not a function.`);
    }
};
exports.validateQueryHandler = validateQueryHandler;
//# sourceMappingURL=validateQueryHandler.js.map