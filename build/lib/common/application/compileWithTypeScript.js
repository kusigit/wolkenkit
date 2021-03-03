"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileWithTypeScript = void 0;
const errors_1 = require("../errors");
const shelljs_1 = require("shelljs");
const exists_1 = require("../utils/fs/exists");
const common_tags_1 = require("common-tags");
const compileWithTypeScript = async function ({ sourceDirectory, targetDirectory }) {
    if (!await exists_1.exists({ path: sourceDirectory })) {
        throw new errors_1.errors.CompilationFailed('Source folder does not exist.');
    }
    const shellQuote = process.platform === 'win32' ? `"` : `'`;
    const { code, stdout, stderr } = shelljs_1.exec(common_tags_1.oneLine `
    npx tsc
      --module CommonJS
      --noEmitOnError
      --outDir ${shellQuote}${targetDirectory}${shellQuote}
  `, { cwd: sourceDirectory });
    if (code !== 0) {
        throw new errors_1.errors.CompilationFailed('Compilation failed.', {
            data: { stdout, stderr }
        });
    }
};
exports.compileWithTypeScript = compileWithTypeScript;
//# sourceMappingURL=compileWithTypeScript.js.map