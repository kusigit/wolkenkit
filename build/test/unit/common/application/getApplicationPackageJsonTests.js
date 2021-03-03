"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const fs_1 = __importDefault(require("fs"));
const getApplicationPackageJson_1 = require("../../../../lib/common/application/getApplicationPackageJson");
const isolated_1 = require("isolated");
const path_1 = __importDefault(require("path"));
suite('getApplicationPackageJson', () => {
    test('returns the package.json from the given directory if it contains a package.json file.', async () => {
        const directory = await isolated_1.isolated();
        const packageJsonPath = path_1.default.join(directory, 'package.json');
        await fs_1.default.promises.writeFile(packageJsonPath, JSON.stringify({
            name: 'test',
            version: '1.0.0'
        }), 'utf8');
        const applicationPackageJson = await getApplicationPackageJson_1.getApplicationPackageJson({ directory });
        assertthat_1.assert.that(applicationPackageJson).is.equalTo({
            name: 'test',
            version: '1.0.0'
        });
    });
    test('returns the package.json from the parent directory if the directory does not contain a package.json file, but the parent does.', async () => {
        const directory = await isolated_1.isolated();
        const subDirectory = path_1.default.join(directory, 'subDirectory');
        await fs_1.default.promises.mkdir(subDirectory);
        const packageJsonPath = path_1.default.join(directory, 'package.json');
        await fs_1.default.promises.writeFile(packageJsonPath, JSON.stringify({
            name: 'test',
            version: '1.0.0'
        }), 'utf8');
        const applicationPackageJson = await getApplicationPackageJson_1.getApplicationPackageJson({ directory: subDirectory });
        assertthat_1.assert.that(applicationPackageJson).is.equalTo({
            name: 'test',
            version: '1.0.0'
        });
    });
    test('throws an error if no package.json can be found.', async () => {
        const directory = await isolated_1.isolated();
        await assertthat_1.assert.that(async () => {
            await getApplicationPackageJson_1.getApplicationPackageJson({ directory });
        }).is.throwingAsync((ex) => ex.code === errors_1.errors.ApplicationNotFound.code);
    });
    test('throws an error if the given directory does not exist.', async () => {
        await assertthat_1.assert.that(async () => {
            await getApplicationPackageJson_1.getApplicationPackageJson({ directory: path_1.default.join(__dirname, 'does', 'not', 'exist') });
        }).is.throwingAsync((ex) => ex.code === errors_1.errors.DirectoryNotFound.code);
    });
});
//# sourceMappingURL=getApplicationPackageJsonTests.js.map