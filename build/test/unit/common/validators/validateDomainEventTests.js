"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const buildDomainEvent_1 = require("../../../../lib/common/utils/test/buildDomainEvent");
const DomainEvent_1 = require("../../../../lib/common/elements/DomainEvent");
const errors_1 = require("../../../../lib/common/errors");
const getTestApplicationDirectory_1 = require("../../../shared/applications/getTestApplicationDirectory");
const loadApplication_1 = require("../../../../lib/common/application/loadApplication");
const uuid_1 = require("uuid");
const validateDomainEvent_1 = require("../../../../lib/common/validators/validateDomainEvent");
suite('validateDomainEvent', () => {
    const applicationDirectory = getTestApplicationDirectory_1.getTestApplicationDirectory({ name: 'base' });
    const user = {
        id: 'jane.doe',
        claims: { sub: 'jane.doe' }
    };
    const domainEvent = buildDomainEvent_1.buildDomainEvent({
        aggregateIdentifier: {
            context: { name: 'sampleContext' },
            aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
        },
        name: 'executed',
        data: {
            strategy: 'succeed'
        },
        metadata: {
            initiator: { user },
            revision: 1
        }
    });
    let application;
    suiteSetup(async () => {
        application = await loadApplication_1.loadApplication({ applicationDirectory });
    });
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateDomainEvent_1.validateDomainEvent({ domainEvent, application });
        }).is.not.throwing();
    });
    test(`throws an error if the domainEvent's context doesn't exist in the application definition.`, async () => {
        assertthat_1.assert.that(() => {
            validateDomainEvent_1.validateDomainEvent({
                domainEvent: new DomainEvent_1.DomainEvent({
                    ...domainEvent,
                    aggregateIdentifier: {
                        context: { name: 'someContext' },
                        aggregate: domainEvent.aggregateIdentifier.aggregate
                    }
                }),
                application
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.ContextNotFound.code &&
            ex.message === `Context 'someContext' not found.`);
    });
    test(`throws an error if the domainEvent's aggregate doesn't exist in the application definition.`, async () => {
        assertthat_1.assert.that(() => {
            validateDomainEvent_1.validateDomainEvent({
                domainEvent: new DomainEvent_1.DomainEvent({
                    ...domainEvent,
                    aggregateIdentifier: {
                        context: domainEvent.aggregateIdentifier.context,
                        aggregate: {
                            name: 'someAggregate',
                            id: uuid_1.v4()
                        }
                    }
                }),
                application
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.AggregateNotFound.code &&
            ex.message === `Aggregate 'sampleContext.someAggregate' not found.`);
    });
    test(`throws an error if the domainEvent doesn't exist in the application definition.`, async () => {
        assertthat_1.assert.that(() => {
            validateDomainEvent_1.validateDomainEvent({
                domainEvent: new DomainEvent_1.DomainEvent({
                    ...domainEvent,
                    name: 'someDomainEvent'
                }),
                application
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.DomainEventNotFound.code &&
            ex.message === `Domain event 'sampleContext.sampleAggregate.someDomainEvent' not found.`);
    });
    test(`throws an error if the domainEvent's data doesn't match its schema.`, async () => {
        assertthat_1.assert.that(() => {
            validateDomainEvent_1.validateDomainEvent({
                domainEvent: new DomainEvent_1.DomainEvent({
                    ...domainEvent,
                    data: {
                        foo: ''
                    }
                }),
                application
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.DomainEventMalformed.code &&
            ex.message === `Missing required property: strategy (at domainEvent.data.strategy).`);
    });
});
//# sourceMappingURL=validateDomainEventTests.js.map