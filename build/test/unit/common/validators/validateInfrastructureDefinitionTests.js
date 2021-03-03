"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const validateInfrastructureDefinition_1 = require("../../../../lib/common/validators/validateInfrastructureDefinition");
suite('validateInfrastructureDefinition', () => {
    const infrastructureDefinition = {
        async setupInfrastructure() {
            // Intentionally left blank.
        },
        async getInfrastructure() {
            return {
                ask: {},
                tell: {}
            };
        }
    };
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateInfrastructureDefinition_1.validateInfrastructureDefinition({ infrastructureDefinition });
        }).is.not.throwing();
    });
    test('throws an error if the given infrastructure definition is not an object.', async () => {
        assertthat_1.assert.that(() => {
            validateInfrastructureDefinition_1.validateInfrastructureDefinition({ infrastructureDefinition: undefined });
        }).is.throwing((ex) => ex.code === errors_1.errors.InfrastructureDefinitionMalformed.code &&
            ex.message === 'Infrastructure definition is not an object.');
    });
    test('throws an error if setup infrastructure is missing.', async () => {
        assertthat_1.assert.that(() => {
            validateInfrastructureDefinition_1.validateInfrastructureDefinition({
                infrastructureDefinition: {
                    ...infrastructureDefinition,
                    setupInfrastructure: undefined
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.InfrastructureDefinitionMalformed.code &&
            ex.message === `Function 'setupInfrastructure' is missing.`);
    });
    test('throws an error if setup infrastructure is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateInfrastructureDefinition_1.validateInfrastructureDefinition({
                infrastructureDefinition: {
                    ...infrastructureDefinition,
                    setupInfrastructure: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.InfrastructureDefinitionMalformed.code &&
            ex.message === `Property 'setupInfrastructure' is not a function.`);
    });
    test('throws an error if get infrastructure is missing.', async () => {
        assertthat_1.assert.that(() => {
            validateInfrastructureDefinition_1.validateInfrastructureDefinition({
                infrastructureDefinition: {
                    ...infrastructureDefinition,
                    getInfrastructure: undefined
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.InfrastructureDefinitionMalformed.code &&
            ex.message === `Function 'getInfrastructure' is missing.`);
    });
    test('throws an error if get infrastructure is not a function.', async () => {
        assertthat_1.assert.that(() => {
            validateInfrastructureDefinition_1.validateInfrastructureDefinition({
                infrastructureDefinition: {
                    ...infrastructureDefinition,
                    getInfrastructure: false
                }
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.InfrastructureDefinitionMalformed.code &&
            ex.message === `Property 'getInfrastructure' is not a function.`);
    });
});
//# sourceMappingURL=validateInfrastructureDefinitionTests.js.map