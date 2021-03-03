"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const validateViewDefinition_1 = require("../../../../lib/common/validators/validateViewDefinition");
suite('validateViewDefinition', () => {
    const viewDefinition = {
        queryHandlers: {}
    };
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateViewDefinition_1.validateViewDefinition({ viewDefinition });
        }).is.not.throwing();
    });
    test('throws an error if the given view definition is not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateViewDefinition_1.validateViewDefinition({ viewDefinition: undefined });
        }).is.throwing((ex) => ex.code === errors_1.errors.ViewDefinitionMalformed.code && ex.message === `View handler is not an object.`);
    });
    test('throws an error if query handlers are missing.', async () => {
        assertthat_1.assert.that(() => {
            validateViewDefinition_1.validateViewDefinition({
                viewDefinition: {
                    ...viewDefinition,
                    queryHandlers: undefined
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.ViewDefinitionMalformed.code &&
            ex.message === `Object 'queryHandlers' is missing.`);
    });
    test('throws an error if query handlers are not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateViewDefinition_1.validateViewDefinition({
                viewDefinition: {
                    ...viewDefinition,
                    queryHandlers: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.ViewDefinitionMalformed.code &&
            ex.message === `Property 'queryHandlers' is not an object.`);
    });
    test('throws an error if a malformed query handler is found.', async () => {
        assertthat_1.assert.that(() => {
            validateViewDefinition_1.validateViewDefinition({
                viewDefinition: {
                    ...viewDefinition,
                    queryHandlers: {
                        sampleQuery: false
                    }
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.ViewDefinitionMalformed.code &&
            ex.message === `Query handler 'sampleQuery' is malformed: Query handler is not an object.`);
    });
    test('throws an error if notification subscribers are not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateViewDefinition_1.validateViewDefinition({
                viewDefinition: {
                    ...viewDefinition,
                    notificationSubscribers: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.ViewDefinitionMalformed.code &&
            ex.message === `Property 'notificationSubscribers' is not an object.`);
    });
    test('throws an error if a malformed notification subscriber is found.', async () => {
        assertthat_1.assert.that(() => {
            validateViewDefinition_1.validateViewDefinition({
                viewDefinition: {
                    ...viewDefinition,
                    notificationSubscribers: {
                        sampleNotificationSubscriber: false
                    }
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.ViewDefinitionMalformed.code &&
            ex.message === `Notification subscriber 'sampleNotificationSubscriber' is malformed: Notification subscriber is not an object.`);
    });
});
//# sourceMappingURL=validateViewDefinitionTests.js.map