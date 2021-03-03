"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withLogMetadata = void 0;
const errors_1 = require("../../errors");
const withLogMetadata = function (sourceType, sourceName, metadata = {}) {
    if (sourceName.length === 0) {
        throw new errors_1.errors.InvalidOperation('Source name needs to be at least 1 character long. But it really should be more.');
    }
    return {
        sourceType,
        sourceName,
        ...metadata
    };
};
exports.withLogMetadata = withLogMetadata;
//# sourceMappingURL=withLogMetadata.js.map