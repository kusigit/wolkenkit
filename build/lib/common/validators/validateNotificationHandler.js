"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNotificationHandler = void 0;
const errors_1 = require("../errors");
const lodash_1 = require("lodash");
const validateNotificationHandler = function ({ notificationHandler }) {
    if (!lodash_1.isObjectLike(notificationHandler)) {
        throw new errors_1.errors.NotificationHandlerMalformed(`Notification handler is not an object.`);
    }
    if (lodash_1.isUndefined(notificationHandler.isAuthorized)) {
        throw new errors_1.errors.NotificationHandlerMalformed(`Function 'isAuthorized' is missing.`);
    }
    if (!lodash_1.isFunction(notificationHandler.isAuthorized)) {
        throw new errors_1.errors.NotificationHandlerMalformed(`Property 'isAuthorized' is not a function.`);
    }
    if (!lodash_1.isUndefined(notificationHandler.getDocumentation) && !lodash_1.isFunction(notificationHandler.getDocumentation)) {
        throw new errors_1.errors.NotificationHandlerMalformed(`Property 'getDocumentation' is not a function.`);
    }
    if (!lodash_1.isUndefined(notificationHandler.getDataSchema) && !lodash_1.isFunction(notificationHandler.getDataSchema)) {
        throw new errors_1.errors.NotificationHandlerMalformed(`Property 'getDataSchema' is not a function.`);
    }
    if (!lodash_1.isUndefined(notificationHandler.getMetadataSchema) && !lodash_1.isFunction(notificationHandler.getMetadataSchema)) {
        throw new errors_1.errors.NotificationHandlerMalformed(`Property 'getMetadataSchema' is not a function.`);
    }
};
exports.validateNotificationHandler = validateNotificationHandler;
//# sourceMappingURL=validateNotificationHandler.js.map