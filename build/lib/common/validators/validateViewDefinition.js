"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateViewDefinition = void 0;
const errors_1 = require("../errors");
const validateNotificationSubscriber_1 = require("./validateNotificationSubscriber");
const validateQueryHandler_1 = require("./validateQueryHandler");
const lodash_1 = require("lodash");
const validateViewDefinition = function ({ viewDefinition }) {
    if (!lodash_1.isObjectLike(viewDefinition)) {
        throw new errors_1.errors.ViewDefinitionMalformed(`View handler is not an object.`);
    }
    if (lodash_1.isUndefined(viewDefinition.queryHandlers)) {
        throw new errors_1.errors.ViewDefinitionMalformed(`Object 'queryHandlers' is missing.`);
    }
    if (!lodash_1.isObjectLike(viewDefinition.queryHandlers)) {
        throw new errors_1.errors.ViewDefinitionMalformed(`Property 'queryHandlers' is not an object.`);
    }
    for (const [queryName, queryHandler] of Object.entries(viewDefinition.queryHandlers)) {
        try {
            validateQueryHandler_1.validateQueryHandler({ queryHandler });
        }
        catch (ex) {
            throw new errors_1.errors.ViewDefinitionMalformed(`Query handler '${queryName}' is malformed: ${ex.message}`);
        }
    }
    if (!lodash_1.isUndefined(viewDefinition.notificationSubscribers)) {
        if (!lodash_1.isObjectLike(viewDefinition.notificationSubscribers)) {
            throw new errors_1.errors.ViewDefinitionMalformed(`Property 'notificationSubscribers' is not an object.`);
        }
        for (const [notificationSubscriberName, notificationSubscriber] of Object.entries(viewDefinition.notificationSubscribers)) {
            try {
                validateNotificationSubscriber_1.validateNotificationSubscriber({ notificationSubscriber });
            }
            catch (ex) {
                throw new errors_1.errors.ViewDefinitionMalformed(`Notification subscriber '${notificationSubscriberName}' is malformed: ${ex.message}`);
            }
        }
    }
    if (!lodash_1.isUndefined(viewDefinition.enhancers)) {
        if (!lodash_1.isArray(viewDefinition.enhancers)) {
            throw new errors_1.errors.ViewDefinitionMalformed(`Property 'enhancers' is not an array.`);
        }
        for (const [index, enhancer] of viewDefinition.enhancers.entries()) {
            if (!lodash_1.isFunction(enhancer)) {
                throw new errors_1.errors.ViewDefinitionMalformed(`View enhancer at index '${index}' is not a function.`);
            }
        }
    }
};
exports.validateViewDefinition = validateViewDefinition;
//# sourceMappingURL=validateViewDefinition.js.map