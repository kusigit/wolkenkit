"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const validateNotificationsDefinition_1 = require("../../../../lib/common/validators/validateNotificationsDefinition");
suite('validateNotificationsDefinition', () => {
    const notificationsDefinition = {
        sampleNotification: {
            isAuthorized() {
                return true;
            }
        }
    };
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateNotificationsDefinition_1.validateNotificationsDefinition({ notificationsDefinition });
        }).is.not.throwing();
    });
    test('throws an error if the given notifications definition is not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateNotificationsDefinition_1.validateNotificationsDefinition({ notificationsDefinition: undefined });
        }).is.throwing((ex) => ex.code === errors_1.errors.NotificationsDefinitionMalformed.code &&
            ex.message === `Notifications definition is not an object.`);
    });
    test('throws an error if a malformed notification handler is found.', async () => {
        assertthat_1.assert.that(() => {
            validateNotificationsDefinition_1.validateNotificationsDefinition({
                notificationsDefinition: {
                    sampleHandler: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.NotificationsDefinitionMalformed.code &&
            ex.message === `Notification handler 'sampleHandler' is malformed: Notification handler is not an object.`);
    });
    test('throws an error if a notification handler without is authorized function is found.', async () => {
        assertthat_1.assert.that(() => {
            validateNotificationsDefinition_1.validateNotificationsDefinition({
                notificationsDefinition: {
                    sampleHandler: {}
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.NotificationsDefinitionMalformed.code &&
            ex.message === `Notification handler 'sampleHandler' is malformed: Function 'isAuthorized' is missing.`);
    });
});
//# sourceMappingURL=validateNotificationsDefinitionTests.js.map