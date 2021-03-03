"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const validateDomainEventHandler_1 = require("../../../../lib/common/validators/validateDomainEventHandler");
suite('validateDomainEventHandler', () => {
    const domainEventHandler = {
        isAuthorized() {
            // Intentionally left blank.
        },
        handle() {
            // Intentionally left blank.
        }
    };
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateDomainEventHandler_1.validateDomainEventHandler({ domainEventHandler });
        }).is.not.throwing();
    });
    test('throws an error if the given domain event handler is not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateDomainEventHandler_1.validateDomainEventHandler({ domainEventHandler: undefined });
        }).is.throwing((ex) => ex.code === errors_1.errors.DomainEventHandlerMalformed.code && ex.message === `Property 'domainEventHandler' is not an object.`);
    });
    test('throws an error if handle is missing.', async () => {
        assertthat_1.assert.that(() => {
            validateDomainEventHandler_1.validateDomainEventHandler({ domainEventHandler: {
                    ...domainEventHandler,
                    handle: undefined
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.DomainEventHandlerMalformed.code && ex.message === `Function 'handle' is missing.`);
    });
    test('throws an error if handle is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateDomainEventHandler_1.validateDomainEventHandler({ domainEventHandler: {
                    ...domainEventHandler,
                    handle: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.DomainEventHandlerMalformed.code && ex.message === `Property 'handle' is not a function.`);
    });
    test('throws an error if isAuthorized is missing.', async () => {
        assertthat_1.assert.that(() => {
            validateDomainEventHandler_1.validateDomainEventHandler({ domainEventHandler: {
                    ...domainEventHandler,
                    isAuthorized: undefined
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.DomainEventHandlerMalformed.code && ex.message === `Function 'isAuthorized' is missing.`);
    });
    test('throws an error if isAuthorized is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateDomainEventHandler_1.validateDomainEventHandler({ domainEventHandler: {
                    ...domainEventHandler,
                    isAuthorized: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.DomainEventHandlerMalformed.code && ex.message === `Property 'isAuthorized' is not a function.`);
    });
    test('throws an error if getDocumentation is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateDomainEventHandler_1.validateDomainEventHandler({ domainEventHandler: {
                    ...domainEventHandler,
                    getDocumentation: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.DomainEventHandlerMalformed.code && ex.message === `Property 'getDocumentation' is not a function.`);
    });
    test('throws an error if getSchema is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateDomainEventHandler_1.validateDomainEventHandler({ domainEventHandler: {
                    ...domainEventHandler,
                    getSchema: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.DomainEventHandlerMalformed.code && ex.message === `Property 'getSchema' is not a function.`);
    });
    test('throws an error if filter is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateDomainEventHandler_1.validateDomainEventHandler({ domainEventHandler: {
                    ...domainEventHandler,
                    filter: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.DomainEventHandlerMalformed.code && ex.message === `Property 'filter' is not a function.`);
    });
    test('throws an error if map is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateDomainEventHandler_1.validateDomainEventHandler({ domainEventHandler: {
                    ...domainEventHandler,
                    map: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.DomainEventHandlerMalformed.code && ex.message === `Property 'map' is not a function.`);
    });
});
//# sourceMappingURL=validateDomainEventHandlerTests.js.map