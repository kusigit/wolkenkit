#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../lib/common/errors");
const flaschenpost_1 = require("flaschenpost");
const path_1 = __importDefault(require("path"));
const shelljs_1 = __importDefault(require("shelljs"));
/* eslint-disable @typescript-eslint/no-floating-promises */
(async function () {
    const logger = flaschenpost_1.flaschenpost.getLogger();
    try {
        const { code, stdout, stderr } = shelljs_1.default.exec('npx roboter build', { cwd: path_1.default.join(__dirname, '..', '..') });
        if (code !== 0) {
            throw new errors_1.errors.CompilationFailed('Failed to build wolkenkit.', { data: { stdout, stderr } });
        }
    }
    catch (ex) {
        logger.fatal('An unexpected error occured.', { err: ex });
        process.exit(1);
    }
})();
/* eslint-enable @typescript-eslint/no-floating-promises */
//# sourceMappingURL=pre.js.map