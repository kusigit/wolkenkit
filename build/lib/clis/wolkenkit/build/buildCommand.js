"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCommand = void 0;
const buildApplication_1 = require("../../../common/application/buildApplication");
const buntstift_1 = require("buntstift");
const errors_1 = require("../../../common/errors");
const getApplicationPackageJson_1 = require("../../../common/application/getApplicationPackageJson");
const getApplicationRoot_1 = require("../../../common/application/getApplicationRoot");
const buildCommand = function () {
    return {
        name: 'build',
        description: 'Build an application written in TypeScript.',
        optionDefinitions: [],
        async handle({ options: { verbose } }) {
            buntstift_1.buntstift.configure(buntstift_1.buntstift.getConfiguration().
                withVerboseMode(verbose));
            const stopWaiting = buntstift_1.buntstift.wait();
            try {
                const applicationDirectory = await getApplicationRoot_1.getApplicationRoot({ directory: process.cwd() });
                const { name, dependencies, devDependencies } = await getApplicationPackageJson_1.getApplicationPackageJson({ directory: process.cwd() });
                if (!(dependencies === null || dependencies === void 0 ? void 0 : dependencies.wolkenkit) && !(devDependencies === null || devDependencies === void 0 ? void 0 : devDependencies.wolkenkit)) {
                    buntstift_1.buntstift.info('Application not found.');
                    throw new errors_1.errors.ApplicationNotFound();
                }
                buntstift_1.buntstift.info(`Building the '${name}' application...`);
                await buildApplication_1.buildApplication({ applicationDirectory });
                buntstift_1.buntstift.success(`Built the '${name}' application.`);
            }
            catch (ex) {
                buntstift_1.buntstift.error('Failed to build the application.');
                throw ex;
            }
            finally {
                stopWaiting();
            }
        }
    };
};
exports.buildCommand = buildCommand;
//# sourceMappingURL=buildCommand.js.map