"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const validateNotificationSubscriber_1 = require("../../../../lib/common/validators/validateNotificationSubscriber");
suite('validateNotificationSubscriber', () => {
    const notificationSubscriber = {
        isRelevant() {
            return true;
        },
        handle() {
            // Intentionally left empty.
        }
    };
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateNotificationSubscriber_1.validateNotificationSubscriber({
                notificationSubscriber
            });
        }).is.not.throwing();
    });
    test('throws an error if the notification subscriber is not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateNotificationSubscriber_1.validateNotificationSubscriber({
                notificationSubscriber: undefined
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.NotificationSubscriberMalformed.code &&
            ex.message === 'Notification subscriber is not an object.');
    });
    test('throws an error if is relevant is missing.', async () => {
        assertthat_1.assert.that(() => {
            validateNotificationSubscriber_1.validateNotificationSubscriber({ notificationSubscriber: {
                    ...notificationSubscriber,
                    isRelevant: undefined
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.NotificationSubscriberMalformed.code && ex.message === `Function 'isRelevant' is missing.`);
    });
    test('throws an error if is relevant is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateNotificationSubscriber_1.validateNotificationSubscriber({ notificationSubscriber: {
                    ...notificationSubscriber,
                    isRelevant: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.NotificationSubscriberMalformed.code && ex.message === `Property 'isRelevant' is not a function.`);
    });
    test('throws an error if handle is missing.', async () => {
        assertthat_1.assert.that(() => {
            validateNotificationSubscriber_1.validateNotificationSubscriber({ notificationSubscriber: {
                    ...notificationSubscriber,
                    handle: undefined
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.NotificationSubscriberMalformed.code && ex.message === `Function 'handle' is missing.`);
    });
    test('throws an error if handle is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateNotificationSubscriber_1.validateNotificationSubscriber({ notificationSubscriber: {
                    ...notificationSubscriber,
                    handle: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.NotificationSubscriberMalformed.code && ex.message === `Property 'handle' is not a function.`);
    });
});
//# sourceMappingURL=validateNotificationSubscriberTests.js.map