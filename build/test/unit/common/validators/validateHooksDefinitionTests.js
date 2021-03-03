"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const uuid_1 = require("uuid");
const validateHooksDefinition_1 = require("../../../../lib/common/validators/validateHooksDefinition");
suite('validateHooksDefinition', () => {
    const hooksDefinition = {
        async addedFile() {
            // Intentionally left blank.
        },
        async addingFile() {
            return {
                name: uuid_1.v4(),
                contentType: 'text/plain'
            };
        },
        async removedFile() {
            // Intentionally left blank.
        },
        async removingFile() {
            // Intentionally left blank.
        }
    };
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateHooksDefinition_1.validateHooksDefinition({ hooksDefinition });
        }).is.not.throwing();
    });
    test('throws an error if the given hooks definition is not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateHooksDefinition_1.validateHooksDefinition({ hooksDefinition: undefined });
        }).is.throwing((ex) => ex.code === errors_1.errors.HooksDefinitionMalformed.code &&
            ex.message === 'Hooks definition is not an object.');
    });
    test('throws an error if addedFile is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateHooksDefinition_1.validateHooksDefinition({
                hooksDefinition: {
                    ...hooksDefinition,
                    addedFile: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.HooksDefinitionMalformed.code &&
            ex.message === `Property 'addedFile' is not a function.`);
    });
    test('throws an error if addingFile is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateHooksDefinition_1.validateHooksDefinition({
                hooksDefinition: {
                    ...hooksDefinition,
                    addingFile: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.HooksDefinitionMalformed.code &&
            ex.message === `Property 'addingFile' is not a function.`);
    });
    test('throws an error if removedFile is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateHooksDefinition_1.validateHooksDefinition({
                hooksDefinition: {
                    ...hooksDefinition,
                    removedFile: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.HooksDefinitionMalformed.code &&
            ex.message === `Property 'removedFile' is not a function.`);
    });
    test('throws an error if removingFile is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateHooksDefinition_1.validateHooksDefinition({
                hooksDefinition: {
                    ...hooksDefinition,
                    removingFile: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.HooksDefinitionMalformed.code &&
            ex.message === `Property 'removingFile' is not a function.`);
    });
});
//# sourceMappingURL=validateHooksDefinitionTests.js.map