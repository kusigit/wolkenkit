"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const validateQueryHandler_1 = require("../../../../lib/common/validators/validateQueryHandler");
suite('validateQueryHandler', () => {
    const queryHandler = {
        type: 'stream',
        isAuthorized() {
            // Intentionally left blank.
        },
        handle() {
            // Intentionally left blank.
        }
    };
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateQueryHandler_1.validateQueryHandler({ queryHandler });
        }).is.not.throwing();
    });
    test('throws an error if the given query handler is not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateQueryHandler_1.validateQueryHandler({ queryHandler: undefined });
        }).is.throwing((ex) => ex.code === errors_1.errors.QueryHandlerMalformed.code && ex.message === `Query handler is not an object.`);
    });
    test('throws an error if type is missing.', async () => {
        assertthat_1.assert.that(() => {
            validateQueryHandler_1.validateQueryHandler({ queryHandler: {
                    ...queryHandler,
                    type: undefined
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.QueryHandlerMalformed.code && ex.message === `Property 'type' is missing.`);
    });
    test('throws an error if type is an invalid value.', async () => {
        assertthat_1.assert.that(() => {
            validateQueryHandler_1.validateQueryHandler({ queryHandler: {
                    ...queryHandler,
                    type: 'invalid'
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.QueryHandlerMalformed.code && ex.message === `Property 'type' must either be 'value' or 'stream'.`);
    });
    test('throws an error if handle is missing.', async () => {
        assertthat_1.assert.that(() => {
            validateQueryHandler_1.validateQueryHandler({ queryHandler: {
                    ...queryHandler,
                    handle: undefined
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.QueryHandlerMalformed.code && ex.message === `Function 'handle' is missing.`);
    });
    test('throws an error if handle is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateQueryHandler_1.validateQueryHandler({ queryHandler: {
                    ...queryHandler,
                    handle: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.QueryHandlerMalformed.code && ex.message === `Property 'handle' is not a function.`);
    });
    test('throws an error if isAuthorized is missing.', async () => {
        assertthat_1.assert.that(() => {
            validateQueryHandler_1.validateQueryHandler({ queryHandler: {
                    ...queryHandler,
                    isAuthorized: undefined
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.QueryHandlerMalformed.code && ex.message === `Function 'isAuthorized' is missing.`);
    });
    test('throws an error if isAuthorized is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateQueryHandler_1.validateQueryHandler({ queryHandler: {
                    ...queryHandler,
                    isAuthorized: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.QueryHandlerMalformed.code && ex.message === `Property 'isAuthorized' is not a function.`);
    });
    test('throws an error if getDocumentation is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateQueryHandler_1.validateQueryHandler({ queryHandler: {
                    ...queryHandler,
                    getDocumentation: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.QueryHandlerMalformed.code && ex.message === `Property 'getDocumentation' is not a function.`);
    });
    test('throws an error if getOptionsSchema is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateQueryHandler_1.validateQueryHandler({ queryHandler: {
                    ...queryHandler,
                    getOptionsSchema: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.QueryHandlerMalformed.code && ex.message === `Property 'getOptionsSchema' is not a function.`);
    });
    test('throws an error if getItemSchema is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateQueryHandler_1.validateQueryHandler({ queryHandler: {
                    ...queryHandler,
                    getItemSchema: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.QueryHandlerMalformed.code && ex.message === `Property 'getItemSchema' is not a function.`);
    });
});
//# sourceMappingURL=validateQueryHandlerTests.js.map