"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorService = void 0;
const errors_1 = require("../errors");
const getErrorService = function ({ errors }) {
    const errorService = {};
    for (const error of errors) {
        errorService[error] = errors_1.errors[error];
    }
    return errorService;
};
exports.getErrorService = getErrorService;
//# sourceMappingURL=getErrorService.js.map