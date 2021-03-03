"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientMetadata = void 0;
const errors_1 = require("../../errors");
const lodash_1 = require("lodash");
class ClientMetadata {
    constructor({ req }) {
        var _a;
        if (!req.token || !req.user) {
            throw new errors_1.errors.NotAuthenticated('Client information missing in request.');
        }
        this.token = req.token;
        this.user = { id: req.user.id, claims: req.user.claims };
        const headers = req.headers['x-forwarded-for'];
        const header = lodash_1.isArray(headers) ? headers[0] : headers;
        this.ip = (_a = header !== null && header !== void 0 ? header : req.connection.remoteAddress) !== null && _a !== void 0 ? _a : '0.0.0.0';
    }
}
exports.ClientMetadata = ClientMetadata;
//# sourceMappingURL=ClientMetadata.js.map