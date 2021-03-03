"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNotificationSubscriber = void 0;
const errors_1 = require("../errors");
const lodash_1 = require("lodash");
const validateNotificationSubscriber = function ({ notificationSubscriber }) {
    if (!lodash_1.isObjectLike(notificationSubscriber)) {
        throw new errors_1.errors.NotificationSubscriberMalformed(`Notification subscriber is not an object.`);
    }
    if (lodash_1.isUndefined(notificationSubscriber.isRelevant)) {
        throw new errors_1.errors.NotificationSubscriberMalformed(`Function 'isRelevant' is missing.`);
    }
    if (!lodash_1.isFunction(notificationSubscriber.isRelevant)) {
        throw new errors_1.errors.NotificationSubscriberMalformed(`Property 'isRelevant' is not a function.`);
    }
    if (lodash_1.isUndefined(notificationSubscriber.handle)) {
        throw new errors_1.errors.NotificationSubscriberMalformed(`Function 'handle' is missing.`);
    }
    if (!lodash_1.isFunction(notificationSubscriber.handle)) {
        throw new errors_1.errors.NotificationSubscriberMalformed(`Property 'handle' is not a function.`);
    }
};
exports.validateNotificationSubscriber = validateNotificationSubscriber;
//# sourceMappingURL=validateNotificationSubscriber.js.map