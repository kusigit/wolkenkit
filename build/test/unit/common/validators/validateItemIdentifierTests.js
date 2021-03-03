"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const getTestApplicationDirectory_1 = require("../../../shared/applications/getTestApplicationDirectory");
const loadApplication_1 = require("../../../../lib/common/application/loadApplication");
const uuid_1 = require("uuid");
const validateItemIdentifier_1 = require("../../../../lib/common/validators/validateItemIdentifier");
suite('validateItemIdentifier', () => {
    const applicationDirectory = getTestApplicationDirectory_1.getTestApplicationDirectory({ name: 'base' });
    const itemIdentifier = {
        aggregateIdentifier: {
            context: { name: 'sampleContext' },
            aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
        },
        id: uuid_1.v4(),
        name: 'execute'
    };
    let application;
    suiteSetup(async () => {
        application = await loadApplication_1.loadApplication({ applicationDirectory });
    });
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateItemIdentifier_1.validateItemIdentifier({ itemIdentifier, application });
        }).is.not.throwing();
    });
    test(`throws an error if the item identifier's context doesn't exist in the application definition.`, async () => {
        assertthat_1.assert.that(() => {
            validateItemIdentifier_1.validateItemIdentifier({
                itemIdentifier: {
                    ...itemIdentifier,
                    aggregateIdentifier: {
                        context: { name: 'someContext' },
                        aggregate: itemIdentifier.aggregateIdentifier.aggregate
                    }
                },
                application
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.ContextNotFound.code &&
            ex.message === `Context 'someContext' not found.`);
    });
    test(`throws an error if the item identifier's aggregate doesn't exist in the application definition.`, async () => {
        assertthat_1.assert.that(() => {
            validateItemIdentifier_1.validateItemIdentifier({
                itemIdentifier: {
                    ...itemIdentifier,
                    aggregateIdentifier: {
                        context: itemIdentifier.aggregateIdentifier.context,
                        aggregate: {
                            name: 'someAggregate',
                            id: uuid_1.v4()
                        }
                    }
                },
                application
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.AggregateNotFound.code &&
            ex.message === `Aggregate 'sampleContext.someAggregate' not found.`);
    });
    test(`throws an error if the command identifier's name doesn't exist in the application definition.`, async () => {
        assertthat_1.assert.that(() => {
            validateItemIdentifier_1.validateItemIdentifier({
                itemIdentifier: {
                    ...itemIdentifier,
                    name: 'nonExistent'
                },
                application,
                itemType: 'command'
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.CommandNotFound.code &&
            ex.message === `Command 'sampleContext.sampleAggregate.nonExistent' not found.`);
    });
    test(`throws an error if the domain event identifier's name doesn't exist in the application definition.`, async () => {
        assertthat_1.assert.that(() => {
            validateItemIdentifier_1.validateItemIdentifier({
                itemIdentifier: {
                    ...itemIdentifier,
                    name: 'nonExistent'
                },
                application,
                itemType: 'domain-event'
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.DomainEventNotFound.code &&
            ex.message === `Domain event 'sampleContext.sampleAggregate.nonExistent' not found.`);
    });
});
//# sourceMappingURL=validateItemIdentifierTests.js.map