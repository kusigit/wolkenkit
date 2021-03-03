"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const validateNotificationHandler_1 = require("../../../../lib/common/validators/validateNotificationHandler");
suite('validateNotificationHandler', () => {
    const notificationHandler = {
        isAuthorized() {
            return true;
        }
    };
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateNotificationHandler_1.validateNotificationHandler({ notificationHandler });
        }).is.not.throwing();
    });
    test('throws an error if the given notification handler is not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateNotificationHandler_1.validateNotificationHandler({ notificationHandler: undefined });
        }).is.throwing((ex) => ex.code === errors_1.errors.NotificationHandlerMalformed.code &&
            ex.message === `Notification handler is not an object.`);
    });
    test('throws an error if the notification handler has no is authorized function.', async () => {
        assertthat_1.assert.that(() => {
            validateNotificationHandler_1.validateNotificationHandler({
                notificationHandler: {}
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.NotificationHandlerMalformed.code &&
            ex.message === `Function 'isAuthorized' is missing.`);
    });
    test(`throws an error if the notification handler's is authorized property is not a function.`, async () => {
        assertthat_1.assert.that(() => {
            validateNotificationHandler_1.validateNotificationHandler({
                notificationHandler: {
                    isAuthorized: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.NotificationHandlerMalformed.code &&
            ex.message === `Property 'isAuthorized' is not a function.`);
    });
    test(`throws an error if the notification handler's get data schema property is not a function.`, async () => {
        assertthat_1.assert.that(() => {
            validateNotificationHandler_1.validateNotificationHandler({
                notificationHandler: {
                    ...notificationHandler,
                    getDataSchema: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.NotificationHandlerMalformed.code &&
            ex.message === `Property 'getDataSchema' is not a function.`);
    });
    test(`throws an error if the notification handler's get metadata schema property is not a function.`, async () => {
        assertthat_1.assert.that(() => {
            validateNotificationHandler_1.validateNotificationHandler({
                notificationHandler: {
                    ...notificationHandler,
                    getMetadataSchema: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.NotificationHandlerMalformed.code &&
            ex.message === `Property 'getMetadataSchema' is not a function.`);
    });
    test(`throws an error if the notification handler's get description property is not a function.`, async () => {
        assertthat_1.assert.that(() => {
            validateNotificationHandler_1.validateNotificationHandler({
                notificationHandler: {
                    ...notificationHandler,
                    getDocumentation: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.NotificationHandlerMalformed.code &&
            ex.message === `Property 'getDocumentation' is not a function.`);
    });
});
//# sourceMappingURL=validateNotificationHandlerTests.js.map