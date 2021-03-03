"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const compileWithTypeScript_1 = require("../../../../lib/common/application/compileWithTypeScript");
const errors_1 = require("../../../../lib/common/errors");
const fs_1 = __importDefault(require("fs"));
const isolated_1 = require("isolated");
const path_1 = __importDefault(require("path"));
const common_tags_1 = require("common-tags");
suite('compileApplication', function () {
    this.timeout(10 * 1000);
    test('compiles successfully if the TypeScript code is correct.', async () => {
        const typescriptFileContent = common_tags_1.stripIndent `
      export const add = function (left: number, right: number): number {
        return left + right;
      };
    `;
        const tsconfigJson = {
            include: [
                './add.ts'
            ]
        };
        const sourceDirectory = await isolated_1.isolated();
        const targetDirectory = await isolated_1.isolated();
        await fs_1.default.promises.writeFile(path_1.default.join(sourceDirectory, 'add.ts'), typescriptFileContent, 'utf8');
        await fs_1.default.promises.writeFile(path_1.default.join(sourceDirectory, 'tsconfig.json'), JSON.stringify(tsconfigJson), 'utf8');
        await compileWithTypeScript_1.compileWithTypeScript({ sourceDirectory, targetDirectory });
        const actualJavascript = await fs_1.default.promises.readFile(path_1.default.join(targetDirectory, 'add.js'), 'utf8');
        const expectedJavascript = `${common_tags_1.stripIndent `
      "use strict";
      exports.__esModule = true;
      exports.add = void 0;
      var add = function (left, right) {
          return left + right;
      };
      exports.add = add;
    `}\n`;
        assertthat_1.assert.that(actualJavascript).is.equalTo(expectedJavascript);
    });
    test('compiles successfully if the target directory does not exist.', async () => {
        const typescriptFileContent = common_tags_1.stripIndent `
      export const add = function (left: number, right: number): number {
        return left + right;
      };
    `;
        const tsconfigJson = {
            include: [
                './add.ts'
            ]
        };
        const sourceDirectory = await isolated_1.isolated();
        const targetDirectory = path_1.default.join(await isolated_1.isolated(), 'does-not-exist');
        await fs_1.default.promises.writeFile(path_1.default.join(sourceDirectory, 'add.ts'), typescriptFileContent, 'utf8');
        await fs_1.default.promises.writeFile(path_1.default.join(sourceDirectory, 'tsconfig.json'), JSON.stringify(tsconfigJson), 'utf8');
        await compileWithTypeScript_1.compileWithTypeScript({ sourceDirectory, targetDirectory });
        const actualJavascript = await fs_1.default.promises.readFile(path_1.default.join(targetDirectory, 'add.js'), 'utf8');
        const expectedJavascript = `${common_tags_1.stripIndent `
      "use strict";
      exports.__esModule = true;
      exports.add = void 0;
      var add = function (left, right) {
          return left + right;
      };
      exports.add = add;
    `}\n`;
        assertthat_1.assert.that(actualJavascript).is.equalTo(expectedJavascript);
    });
    test('throws an error if the TypeScript code is broken.', async () => {
        const typescriptFileContent = common_tags_1.stripIndent `
      // number + number should not be a string
      export const add = function (left: number, right: number): string {
        return left + right;
      };
    `;
        const tsconfigJson = {
            include: [
                './add.ts'
            ]
        };
        const sourceDirectory = await isolated_1.isolated();
        const targetDirectory = await isolated_1.isolated();
        await fs_1.default.promises.writeFile(path_1.default.join(sourceDirectory, 'add.ts'), typescriptFileContent, 'utf8');
        await fs_1.default.promises.writeFile(path_1.default.join(sourceDirectory, 'tsconfig.json'), JSON.stringify(tsconfigJson), 'utf8');
        await assertthat_1.assert.that(async () => await compileWithTypeScript_1.compileWithTypeScript({ sourceDirectory, targetDirectory })).is.throwingAsync((ex) => ex.code === errors_1.errors.CompilationFailed.code &&
            ex.message === 'Compilation failed.');
    });
    test('throws an error if the source directory does not exist.', async () => {
        const sourceDirectory = path_1.default.join(await isolated_1.isolated(), 'does-not-exist');
        const targetDirectory = await isolated_1.isolated();
        await assertthat_1.assert.that(async () => await compileWithTypeScript_1.compileWithTypeScript({
            sourceDirectory,
            targetDirectory
        })).is.throwingAsync((ex) => ex.code === errors_1.errors.CompilationFailed.code &&
            ex.message === 'Source folder does not exist.');
    });
});
//# sourceMappingURL=compileApplicationTests.js.map