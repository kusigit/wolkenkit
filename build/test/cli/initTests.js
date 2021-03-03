"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const exists_1 = require("../../lib/common/utils/fs/exists");
const fs_1 = __importDefault(require("fs"));
const isolated_1 = require("isolated");
const path_1 = __importDefault(require("path"));
const shelljs_1 = __importDefault(require("shelljs"));
const rootPath = path_1.default.join(__dirname, '..', '..');
const cliPath = path_1.default.join(rootPath, 'build', 'lib', 'bin', 'wolkenkit.js');
suite('init', function () {
    this.timeout(30000);
    test('sets the application name in the package.json file.', async () => {
        const appName = 'test-app';
        const appDirectory = path_1.default.join(await isolated_1.isolated(), appName);
        const initCommand = `node ${cliPath} init --directory ${appDirectory} --template blank --language javascript ${appName}`;
        const { code } = shelljs_1.default.exec(initCommand);
        assertthat_1.assert.that(code).is.equalTo(0);
        const packageJsonPath = path_1.default.join(appDirectory, 'package.json');
        const packageJson = JSON.parse(await fs_1.default.promises.readFile(packageJsonPath, 'utf8'));
        assertthat_1.assert.that(packageJson.name).is.equalTo(appName);
    });
    test('sets the application name in the package.json file even when a scope is used.', async () => {
        const appName = '@scope/test-app';
        const appDirectory = path_1.default.join(await isolated_1.isolated(), appName);
        const initCommand = `node ${cliPath} --verbose init --directory ${appDirectory} --template blank --language javascript ${appName}`;
        const { code } = shelljs_1.default.exec(initCommand);
        assertthat_1.assert.that(code).is.equalTo(0);
        const packageJsonPath = path_1.default.join(appDirectory, 'package.json');
        const packageJson = JSON.parse(await fs_1.default.promises.readFile(packageJsonPath, 'utf8'));
        assertthat_1.assert.that(packageJson.name).is.equalTo(appName);
    });
    test('supports numbers in application names.', async () => {
        const appName = 'test-app-42';
        const appDirectory = path_1.default.join(await isolated_1.isolated(), appName);
        const initCommand = `node ${cliPath} --verbose init --directory ${appDirectory} --template blank --language javascript ${appName}`;
        const { code } = shelljs_1.default.exec(initCommand);
        assertthat_1.assert.that(code).is.equalTo(0);
    });
    test('is able to deal with special characters such as spaces in the path to the application.', async () => {
        const appName = 'test-app';
        const appDirectory = path_1.default.join(await isolated_1.isolated(), 'something with spaces', appName);
        const initCommand = `node ${cliPath} --verbose init --directory '${appDirectory}' --template blank --language javascript ${appName}`;
        const { code } = shelljs_1.default.exec(initCommand);
        assertthat_1.assert.that(code).is.equalTo(0);
    });
    test('throws an error if the application directory already exists.', async () => {
        const appName = 'test-app';
        const appDirectory = await isolated_1.isolated();
        const initCommand = `node ${cliPath} --verbose init --directory ${appDirectory} --template blank --language javascript ${appName}`;
        const { code, stderr } = shelljs_1.default.exec(initCommand);
        assertthat_1.assert.that(code).is.equalTo(1);
        assertthat_1.assert.that(stderr.includes('Failed to initialize the application.')).is.true();
    });
    test('does not throw an error if the application scope directory already exists.', async () => {
        const appName = '@scope/test-app';
        const rootDirectory = await isolated_1.isolated();
        const appDirectory = path_1.default.join(rootDirectory, appName);
        await fs_1.default.promises.mkdir(path_1.default.join(rootDirectory, '@scope'));
        const initCommand = `node ${cliPath} --verbose init --directory ${appDirectory} --template blank --language javascript ${appName}`;
        const { code } = shelljs_1.default.exec(initCommand);
        assertthat_1.assert.that(code).is.equalTo(0);
    });
    test('initializes a JavaScript application with the desired template.', async () => {
        const appName = 'test-app';
        const appDirectory = path_1.default.join(await isolated_1.isolated(), appName);
        const initCommand = `node ${cliPath} --verbose init --directory ${appDirectory} --template blank --language javascript ${appName}`;
        const { code } = shelljs_1.default.exec(initCommand);
        assertthat_1.assert.that(code).is.equalTo(0);
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'deployment/docker-compose/microservice.postgres.yml') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'deployment/docker-compose/setup.in-memory.yml') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'deployment/docker-compose/setup.postgres.yml') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'deployment/docker-compose/single-process.in-memory.yml') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'deployment/docker-compose/single-process.postgres.yml') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, '.dockerignore') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'Dockerfile') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'package.json') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'domain', 'sampleContext', 'sampleAggregate', 'index.js') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'domain', 'sampleContext', 'sampleAggregate', 'SampleState.js') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'domain', 'sampleContext', 'sampleAggregate', 'domainEvents', 'sampleDomainEvent.js') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'domain', 'sampleContext', 'sampleAggregate', 'commands', 'sampleCommand.js') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'flows', 'sampleFlow', 'index.js') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'flows', 'sampleFlow', 'handlers', 'sampleHandler.js') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'infrastructure', 'getInfrastructure.js') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'infrastructure', 'index.js') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'infrastructure', 'setupInfrastructure.js') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'views', 'sampleView', 'index.js') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'views', 'sampleView', 'queries', 'all.js') })).is.true();
    });
    test('initializes a TypeScript application with the desired template.', async () => {
        const appName = 'test-app';
        const appDirectory = path_1.default.join(await isolated_1.isolated(), appName);
        const initCommand = `node ${cliPath} --verbose init --directory ${appDirectory} --template blank --language typescript ${appName}`;
        const { code } = shelljs_1.default.exec(initCommand);
        assertthat_1.assert.that(code).is.equalTo(0);
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'deployment/docker-compose/microservice.postgres.yml') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'deployment/docker-compose/setup.in-memory.yml') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'deployment/docker-compose/setup.postgres.yml') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'deployment/docker-compose/single-process.in-memory.yml') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'deployment/docker-compose/single-process.postgres.yml') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, '.dockerignore') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'Dockerfile') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'package.json') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'tsconfig.json') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'domain', 'sampleContext', 'sampleAggregate', 'index.ts') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'domain', 'sampleContext', 'sampleAggregate', 'SampleState.ts') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'domain', 'sampleContext', 'sampleAggregate', 'domainEvents', 'sampleDomainEvent.ts') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'domain', 'sampleContext', 'sampleAggregate', 'commands', 'sampleCommand.ts') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'flows', 'sampleFlow', 'index.ts') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'flows', 'sampleFlow', 'handlers', 'sampleHandler.ts') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'infrastructure', 'getInfrastructure.ts') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'infrastructure', 'index.ts') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'infrastructure', 'setupInfrastructure.ts') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'views', 'sampleView', 'index.ts') })).is.true();
        assertthat_1.assert.that(await exists_1.exists({ path: path_1.default.join(appDirectory, 'server', 'views', 'sampleView', 'queries', 'all.ts') })).is.true();
        const parsedTsConfig = JSON.parse(await fs_1.default.promises.readFile(path_1.default.join(appDirectory, 'tsconfig.json'), 'utf-8'));
        assertthat_1.assert.that(parsedTsConfig.compilerOptions.baseUrl).is.undefined();
        assertthat_1.assert.that(parsedTsConfig.compilerOptions.paths).is.undefined();
    });
});
//# sourceMappingURL=initTests.js.map