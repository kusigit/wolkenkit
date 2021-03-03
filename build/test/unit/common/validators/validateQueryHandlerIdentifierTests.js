"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const getTestApplicationDirectory_1 = require("../../../shared/applications/getTestApplicationDirectory");
const loadApplication_1 = require("../../../../lib/common/application/loadApplication");
const validateQueryHandlerIdentifier_1 = require("../../../../lib/common/validators/validateQueryHandlerIdentifier");
suite('validateQueryHandlerIdentifier', () => {
    const applicationDirectory = getTestApplicationDirectory_1.getTestApplicationDirectory({ name: 'base' });
    const queryHandlerIdentifier = {
        view: { name: 'sampleView' },
        name: 'all'
    };
    let application;
    suiteSetup(async () => {
        application = await loadApplication_1.loadApplication({ applicationDirectory });
    });
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateQueryHandlerIdentifier_1.validateQueryHandlerIdentifier({ queryHandlerIdentifier, application });
        }).is.not.throwing();
    });
    test(`throws an error if the query handler identifier's view doesn't exist in the application definition.`, async () => {
        assertthat_1.assert.that(() => {
            validateQueryHandlerIdentifier_1.validateQueryHandlerIdentifier({
                queryHandlerIdentifier: {
                    ...queryHandlerIdentifier,
                    view: { name: 'someView' }
                },
                application
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.ViewNotFound.code &&
            ex.message === `View 'someView' not found.`);
    });
    test(`throws an error if the query handler identifier's name doesn't exist in the application definition.`, async () => {
        assertthat_1.assert.that(() => {
            validateQueryHandlerIdentifier_1.validateQueryHandlerIdentifier({
                queryHandlerIdentifier: {
                    ...queryHandlerIdentifier,
                    name: 'someQueryHandler'
                },
                application
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.QueryHandlerNotFound.code &&
            ex.message === `Query handler 'sampleView.someQueryHandler' not found.`);
    });
});
//# sourceMappingURL=validateQueryHandlerIdentifierTests.js.map