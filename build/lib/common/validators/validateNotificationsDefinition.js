"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNotificationsDefinition = void 0;
const errors_1 = require("../errors");
const lodash_1 = require("lodash");
const validateNotificationHandler_1 = require("./validateNotificationHandler");
const validateNotificationsDefinition = function ({ notificationsDefinition }) {
    if (!lodash_1.isObjectLike(notificationsDefinition)) {
        throw new errors_1.errors.NotificationsDefinitionMalformed('Notifications definition is not an object.');
    }
    for (const [notificationHandlerName, notificationHandler] of Object.entries(notificationsDefinition)) {
        try {
            validateNotificationHandler_1.validateNotificationHandler({ notificationHandler });
        }
        catch (ex) {
            throw new errors_1.errors.NotificationsDefinitionMalformed(`Notification handler '${notificationHandlerName}' is malformed: ${ex.message}`);
        }
    }
};
exports.validateNotificationsDefinition = validateNotificationsDefinition;
//# sourceMappingURL=validateNotificationsDefinition.js.map