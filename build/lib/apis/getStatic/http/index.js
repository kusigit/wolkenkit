"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApi = void 0;
const compression_1 = __importDefault(require("compression"));
const errors_1 = require("../../../common/errors");
const exists_1 = require("../../../common/utils/fs/exists");
const fs_1 = __importDefault(require("fs"));
const getApiBase_1 = require("../../base/getApiBase");
const flaschenpost_1 = require("flaschenpost");
const express_1 = __importDefault(require("express"));
const getApi = async function ({ corsOrigin, directory }) {
    const api = await getApiBase_1.getApiBase({
        request: {
            headers: { cors: { origin: corsOrigin } },
            body: { parser: false },
            query: { parser: { useJson: false } }
        },
        response: {
            headers: { cache: false }
        }
    });
    if (!await exists_1.exists({ path: directory })) {
        throw new errors_1.errors.DirectoryNotFound(`Directory '${directory}' not found.`);
    }
    if (!(await fs_1.default.promises.stat(directory)).isDirectory()) {
        throw new errors_1.errors.DirectoryNotFound(`Path '${directory}' is not a directory.`);
    }
    api.use(compression_1.default());
    api.use(flaschenpost_1.getMiddleware());
    api.use('/', express_1.default.static(directory));
    return { api };
};
exports.getApi = getApi;
//# sourceMappingURL=index.js.map