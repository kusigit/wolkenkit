"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const getTestApplicationDirectory_1 = require("../../../shared/applications/getTestApplicationDirectory");
const loadApplication_1 = require("../../../../lib/common/application/loadApplication");
const validateFlowNames_1 = require("../../../../lib/common/validators/validateFlowNames");
suite('validateFlowNames', () => {
    const applicationDirectory = getTestApplicationDirectory_1.getTestApplicationDirectory({ name: 'base' });
    let application;
    suiteSetup(async () => {
        application = await loadApplication_1.loadApplication({ applicationDirectory });
    });
    test('does not throw an error if well-known flow names are given.', async () => {
        assertthat_1.assert.that(() => {
            validateFlowNames_1.validateFlowNames({ flowNames: ['sampleFlow'], application });
        }).is.not.throwing();
    });
    test('throws an error if an unknown flow is given.', async () => {
        assertthat_1.assert.that(() => {
            validateFlowNames_1.validateFlowNames({
                flowNames: ['nonExistent'],
                application
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.FlowNotFound.code &&
            ex.message === `Flow 'nonExistent' not found.`);
    });
});
//# sourceMappingURL=validateFlowNamesTests.js.map