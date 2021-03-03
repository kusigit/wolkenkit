"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const validateFlowDefinition_1 = require("../../../../lib/common/validators/validateFlowDefinition");
suite('validateFlowDefinition', () => {
    const flowDefinition = {
        replayPolicy: 'never',
        domainEventHandlers: {}
    };
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateFlowDefinition_1.validateFlowDefinition({ flowDefinition });
        }).is.not.throwing();
    });
    test('throws an error if the given flow definition is not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateFlowDefinition_1.validateFlowDefinition({ flowDefinition: undefined });
        }).is.throwing((ex) => ex.code === errors_1.errors.FlowDefinitionMalformed.code && ex.message === 'Flow handler is not an object.');
    });
    test('throws an error if domain event handlers are missing.', async () => {
        assertthat_1.assert.that(() => {
            validateFlowDefinition_1.validateFlowDefinition({
                flowDefinition: {
                    ...flowDefinition,
                    domainEventHandlers: undefined
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.FlowDefinitionMalformed.code &&
            ex.message === `Object 'domainEventHandlers' is missing.`);
    });
    test('throws an error if domain event handlers is not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateFlowDefinition_1.validateFlowDefinition({
                flowDefinition: {
                    ...flowDefinition,
                    domainEventHandlers: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.FlowDefinitionMalformed.code &&
            ex.message === `Property 'domainEventHandlers' is not an object.`);
    });
    test('throws an error if a malformed domain event handler is found.', async () => {
        assertthat_1.assert.that(() => {
            validateFlowDefinition_1.validateFlowDefinition({
                flowDefinition: {
                    ...flowDefinition,
                    domainEventHandlers: {
                        sampleHandler: false
                    }
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.FlowDefinitionMalformed.code &&
            ex.message === `Domain event handler 'sampleHandler' is malformed: Property 'domainEventHandler' is not an object.`);
    });
});
//# sourceMappingURL=validateFlowDefinitionTests.js.map