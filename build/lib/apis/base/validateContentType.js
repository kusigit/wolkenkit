"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateContentType = void 0;
const errors_1 = require("../../common/errors");
const content_type_1 = __importDefault(require("content-type"));
const validateContentType = function ({ expectedContentType, req }) {
    let contentType;
    try {
        contentType = content_type_1.default.parse(req);
    }
    catch (ex) {
        throw new errors_1.errors.ContentTypeMismatch(`Header content-type must be ${expectedContentType}.`, { cause: ex });
    }
    if (contentType.type !== expectedContentType) {
        throw new errors_1.errors.ContentTypeMismatch(`Header content-type must be ${expectedContentType}.`);
    }
};
exports.validateContentType = validateContentType;
//# sourceMappingURL=validateContentType.js.map