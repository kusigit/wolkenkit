"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const validateAggregateDefinition_1 = require("../../../../lib/common/validators/validateAggregateDefinition");
suite('validateAggregateDefinition', () => {
    /* eslint-disable @typescript-eslint/no-extraneous-class, @typescript-eslint/no-useless-constructor */
    class AggregateState {
        constructor() {
            // Intentionally left blank.
        }
    }
    /* eslint-enable @typescript-eslint/no-extraneous-class, @typescript-eslint/no-useless-constructor */
    const aggregateDefinition = {
        getInitialState: () => new AggregateState(),
        commandHandlers: {},
        domainEventHandlers: {}
    };
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateAggregateDefinition_1.validateAggregateDefinition({ aggregateDefinition });
        }).is.not.throwing();
    });
    test('throws an error if getInitialState is missing.', async () => {
        assertthat_1.assert.that(() => {
            validateAggregateDefinition_1.validateAggregateDefinition({
                aggregateDefinition: {
                    ...aggregateDefinition,
                    getInitialState: undefined
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.AggregateDefinitionMalformed.code &&
            ex.message === `Function 'getInitialState' is missing.`);
    });
    test('throws an error if getInitialState is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateAggregateDefinition_1.validateAggregateDefinition({
                aggregateDefinition: {
                    ...aggregateDefinition,
                    getInitialState: {}
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.AggregateDefinitionMalformed.code &&
            ex.message === `Property 'getInitialState' is not a function.`);
    });
    test('throws an error if the command handlers are missing.', async () => {
        assertthat_1.assert.that(() => {
            validateAggregateDefinition_1.validateAggregateDefinition({
                aggregateDefinition: {
                    ...aggregateDefinition,
                    commandHandlers: undefined
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.AggregateDefinitionMalformed.code &&
            ex.message === `Object 'commandHandlers' is missing.`);
    });
    test('throws an error if the command handlers are not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateAggregateDefinition_1.validateAggregateDefinition({
                aggregateDefinition: {
                    ...aggregateDefinition,
                    commandHandlers: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.AggregateDefinitionMalformed.code &&
            ex.message === `Property 'commandHandlers' is not an object.`);
    });
    test('throws an error if a malformed command handler is found.', async () => {
        assertthat_1.assert.that(() => {
            validateAggregateDefinition_1.validateAggregateDefinition({
                aggregateDefinition: {
                    ...aggregateDefinition,
                    commandHandlers: {
                        sampleCommand: false
                    }
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.AggregateDefinitionMalformed.code &&
            ex.message === `Command handler 'sampleCommand' is malformed: Property 'commandHandler' is not an object.`);
    });
    test('throws an error if the domain event handlers are missing.', async () => {
        assertthat_1.assert.that(() => {
            validateAggregateDefinition_1.validateAggregateDefinition({
                aggregateDefinition: {
                    ...aggregateDefinition,
                    domainEventHandlers: undefined
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.AggregateDefinitionMalformed.code &&
            ex.message === `Object 'domainEventHandlers' is missing.`);
    });
    test('throws an error if the domain event handlers are not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateAggregateDefinition_1.validateAggregateDefinition({
                aggregateDefinition: {
                    ...aggregateDefinition,
                    domainEventHandlers: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.AggregateDefinitionMalformed.code &&
            ex.message === `Property 'domainEventHandlers' is not an object.`);
    });
    test('throws an error if a malformed domain event handler is found.', async () => {
        assertthat_1.assert.that(() => {
            validateAggregateDefinition_1.validateAggregateDefinition({
                aggregateDefinition: {
                    ...aggregateDefinition,
                    domainEventHandlers: {
                        sampleDomainEvent: false
                    }
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.AggregateDefinitionMalformed.code &&
            ex.message === `Domain event handler 'sampleDomainEvent' is malformed: Property 'domainEventHandler' is not an object.`);
    });
});
//# sourceMappingURL=validateAggregateDefinitionTests.js.map