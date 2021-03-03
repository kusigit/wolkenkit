"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVersionNumber = void 0;
const errors_1 = require("../../../../common/errors");
const getVersionNumber = function ({ version }) {
    // Check for version of form 'x.y.z'.
    let versions = /\d+\.\d+\.\d+/u.exec(version);
    if (versions && versions.length > 0) {
        return versions[0];
    }
    // Check for version of form 'x.y'.
    versions = /\d+\.\d+/u.exec(version);
    if (versions && versions.length > 0) {
        return versions[0];
    }
    throw new errors_1.errors.InvalidOperation(`Failed to extract version number from '${version}'.`);
};
exports.getVersionNumber = getVersionNumber;
//# sourceMappingURL=getVersionNumber.js.map