"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const validateCommandHandler_1 = require("../../../../lib/common/validators/validateCommandHandler");
suite('validateCommandHandler', () => {
    const commandHandler = {
        isAuthorized() {
            // Intentionally left blank.
        },
        handle() {
            // Intentionally left blank.
        },
        getDocumentation() {
            // Intentionally left blank.
        },
        getSchema() {
            // Intentionally left blank.
        }
    };
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateCommandHandler_1.validateCommandHandler({ commandHandler });
        }).is.not.throwing();
    });
    test('throws an error if the given command handler is not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateCommandHandler_1.validateCommandHandler({ commandHandler: undefined });
        }).is.throwing((ex) => ex.code === errors_1.errors.CommandHandlerMalformed.code && ex.message === `Property 'commandHandler' is not an object.`);
    });
    test('throws an error if isAuthorized is missing.', async () => {
        assertthat_1.assert.that(() => {
            validateCommandHandler_1.validateCommandHandler({ commandHandler: {
                    ...commandHandler,
                    isAuthorized: undefined
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.CommandHandlerMalformed.code && ex.message === `Function 'isAuthorized' is missing.`);
    });
    test('throws an error if isAuthorized is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateCommandHandler_1.validateCommandHandler({ commandHandler: {
                    ...commandHandler,
                    isAuthorized: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.CommandHandlerMalformed.code && ex.message === `Property 'isAuthorized' is not a function.`);
    });
    test('throws an error if handle is missing.', async () => {
        assertthat_1.assert.that(() => {
            validateCommandHandler_1.validateCommandHandler({ commandHandler: {
                    ...commandHandler,
                    handle: undefined
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.CommandHandlerMalformed.code && ex.message === `Function 'handle' is missing.`);
    });
    test('throws an error if handle is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateCommandHandler_1.validateCommandHandler({ commandHandler: {
                    ...commandHandler,
                    handle: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.CommandHandlerMalformed.code && ex.message === `Property 'handle' is not a function.`);
    });
    test('throws an error if getDocumentation is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateCommandHandler_1.validateCommandHandler({ commandHandler: {
                    ...commandHandler,
                    getDocumentation: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.CommandHandlerMalformed.code && ex.message === `Property 'getDocumentation' is not a function.`);
    });
    test('throws an error if getSchema is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateCommandHandler_1.validateCommandHandler({ commandHandler: {
                    ...commandHandler,
                    getSchema: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.CommandHandlerMalformed.code && ex.message === `Property 'getSchema' is not a function.`);
    });
});
//# sourceMappingURL=validateCommandHandlerTests.js.map