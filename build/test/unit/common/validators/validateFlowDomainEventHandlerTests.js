"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const validateFlowDomainEventHandler_1 = require("../../../../lib/common/validators/validateFlowDomainEventHandler");
suite('validateFlowDomainEventHandler', () => {
    const domainEventHandler = {
        isRelevant() {
            return true;
        },
        handle() {
            // Intentionally left blank.
        }
    };
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateFlowDomainEventHandler_1.validateFlowDomainEventHandler({ domainEventHandler });
        }).is.not.throwing();
    });
    test('throws an error if the given domain event handler is not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateFlowDomainEventHandler_1.validateFlowDomainEventHandler({ domainEventHandler: undefined });
        }).is.throwing((ex) => ex.code === errors_1.errors.FlowDomainEventHandlerMalformed.code && ex.message === `Property 'domainEventHandler' is not an object.`);
    });
    test('throws an error if is relevant is missing.', async () => {
        assertthat_1.assert.that(() => {
            validateFlowDomainEventHandler_1.validateFlowDomainEventHandler({ domainEventHandler: {
                    ...domainEventHandler,
                    isRelevant: undefined
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.FlowDomainEventHandlerMalformed.code && ex.message === `Function 'isRelevant' is missing.`);
    });
    test('throws an error if is relevant is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateFlowDomainEventHandler_1.validateFlowDomainEventHandler({ domainEventHandler: {
                    ...domainEventHandler,
                    isRelevant: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.FlowDomainEventHandlerMalformed.code && ex.message === `Property 'isRelevant' is not a function.`);
    });
    test('throws an error if handle is missing.', async () => {
        assertthat_1.assert.that(() => {
            validateFlowDomainEventHandler_1.validateFlowDomainEventHandler({ domainEventHandler: {
                    ...domainEventHandler,
                    handle: undefined
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.FlowDomainEventHandlerMalformed.code && ex.message === `Function 'handle' is missing.`);
    });
    test('throws an error if handle is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateFlowDomainEventHandler_1.validateFlowDomainEventHandler({ domainEventHandler: {
                    ...domainEventHandler,
                    handle: {}
                } });
        }).is.throwing((ex) => ex.code === errors_1.errors.FlowDomainEventHandlerMalformed.code && ex.message === `Property 'handle' is not a function.`);
    });
});
//# sourceMappingURL=validateFlowDomainEventHandlerTests.js.map