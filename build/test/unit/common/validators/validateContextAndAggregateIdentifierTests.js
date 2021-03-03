"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const getTestApplicationDirectory_1 = require("../../../shared/applications/getTestApplicationDirectory");
const loadApplication_1 = require("../../../../lib/common/application/loadApplication");
const uuid_1 = require("uuid");
const validateAggregateIdentifier_1 = require("../../../../lib/common/validators/validateAggregateIdentifier");
suite('validateContextAndAggregateIdentifier', () => {
    const applicationDirectory = getTestApplicationDirectory_1.getTestApplicationDirectory({ name: 'base' });
    const aggregateIdentifier = {
        context: { name: 'sampleContext' },
        aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
    };
    let application;
    suiteSetup(async () => {
        application = await loadApplication_1.loadApplication({ applicationDirectory });
    });
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateAggregateIdentifier_1.validateAggregateIdentifier({ aggregateIdentifier, application });
        }).is.not.throwing();
    });
    test(`throws an error if the context doesn't exist in the application definition.`, async () => {
        assertthat_1.assert.that(() => {
            validateAggregateIdentifier_1.validateAggregateIdentifier({
                aggregateIdentifier: {
                    context: { name: 'someContext' },
                    aggregate: aggregateIdentifier.aggregate
                },
                application
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.ContextNotFound.code &&
            ex.message === `Context 'someContext' not found.`);
    });
    test(`throws an error if the aggregate doesn't exist in the application definition.`, async () => {
        assertthat_1.assert.that(() => {
            validateAggregateIdentifier_1.validateAggregateIdentifier({
                aggregateIdentifier: {
                    context: aggregateIdentifier.context,
                    aggregate: { name: 'someAggregate', id: uuid_1.v4() }
                },
                application
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.AggregateNotFound.code &&
            ex.message === `Aggregate 'sampleContext.someAggregate' not found.`);
    });
});
//# sourceMappingURL=validateContextAndAggregateIdentifierTests.js.map