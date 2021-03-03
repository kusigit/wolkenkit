"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInfrastructureDefinition = void 0;
const errors_1 = require("../errors");
const lodash_1 = require("lodash");
const validateInfrastructureDefinition = function ({ infrastructureDefinition }) {
    if (!lodash_1.isObjectLike(infrastructureDefinition)) {
        throw new errors_1.errors.InfrastructureDefinitionMalformed('Infrastructure definition is not an object.');
    }
    if (lodash_1.isUndefined(infrastructureDefinition.setupInfrastructure)) {
        throw new errors_1.errors.InfrastructureDefinitionMalformed(`Function 'setupInfrastructure' is missing.`);
    }
    if (!lodash_1.isFunction(infrastructureDefinition.setupInfrastructure)) {
        throw new errors_1.errors.InfrastructureDefinitionMalformed(`Property 'setupInfrastructure' is not a function.`);
    }
    if (lodash_1.isUndefined(infrastructureDefinition.getInfrastructure)) {
        throw new errors_1.errors.InfrastructureDefinitionMalformed(`Function 'getInfrastructure' is missing.`);
    }
    if (!lodash_1.isFunction(infrastructureDefinition.getInfrastructure)) {
        throw new errors_1.errors.InfrastructureDefinitionMalformed(`Property 'getInfrastructure' is not a function.`);
    }
};
exports.validateInfrastructureDefinition = validateInfrastructureDefinition;
//# sourceMappingURL=validateInfrastructureDefinition.js.map