"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHooksDefinition = void 0;
const errors_1 = require("../errors");
const lodash_1 = require("lodash");
const validateHooksDefinition = function ({ hooksDefinition }) {
    if (!lodash_1.isObjectLike(hooksDefinition)) {
        throw new errors_1.errors.HooksDefinitionMalformed('Hooks definition is not an object.');
    }
    if (!lodash_1.isUndefined(hooksDefinition.addingFile) && !lodash_1.isFunction(hooksDefinition.addingFile)) {
        throw new errors_1.errors.HooksDefinitionMalformed(`Property 'addingFile' is not a function.`);
    }
    if (!lodash_1.isUndefined(hooksDefinition.addedFile) && !lodash_1.isFunction(hooksDefinition.addedFile)) {
        throw new errors_1.errors.HooksDefinitionMalformed(`Property 'addedFile' is not a function.`);
    }
    if (!lodash_1.isUndefined(hooksDefinition.gettingFile) && !lodash_1.isFunction(hooksDefinition.gettingFile)) {
        throw new errors_1.errors.HooksDefinitionMalformed(`Property 'gettingFile' is not a function.`);
    }
    if (!lodash_1.isUndefined(hooksDefinition.gotFile) && !lodash_1.isFunction(hooksDefinition.gotFile)) {
        throw new errors_1.errors.HooksDefinitionMalformed(`Property 'gotFile' is not a function.`);
    }
    if (!lodash_1.isUndefined(hooksDefinition.removingFile) && !lodash_1.isFunction(hooksDefinition.removingFile)) {
        throw new errors_1.errors.HooksDefinitionMalformed(`Property 'removingFile' is not a function.`);
    }
    if (!lodash_1.isUndefined(hooksDefinition.removedFile) && !lodash_1.isFunction(hooksDefinition.removedFile)) {
        throw new errors_1.errors.HooksDefinitionMalformed(`Property 'removedFile' is not a function.`);
    }
};
exports.validateHooksDefinition = validateHooksDefinition;
//# sourceMappingURL=validateHooksDefinition.js.map