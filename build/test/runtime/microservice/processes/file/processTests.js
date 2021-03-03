"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const configurationDefinition_1 = require("../../../../../lib/runtimes/microservice/processes/view/configurationDefinition");
const errors_1 = require("../../../../../lib/common/errors");
const getDefaultConfiguration_1 = require("../../../../../lib/runtimes/shared/getDefaultConfiguration");
const getSocketPaths_1 = require("../../../../shared/getSocketPaths");
const getTestApplicationDirectory_1 = require("../../../../shared/applications/getTestApplicationDirectory");
const Client_1 = require("../../../../../lib/apis/getHealth/http/v2/Client");
const Client_2 = require("../../../../../lib/apis/manageFile/http/v2/Client");
const stream_1 = require("stream");
const startProcess_1 = require("../../../../../lib/runtimes/shared/startProcess");
const stream_to_string_1 = __importDefault(require("stream-to-string"));
const toEnvironmentVariables_1 = require("../../../../../lib/runtimes/shared/toEnvironmentVariables");
const uuid_1 = require("uuid");
suite('file process', function () {
    this.timeout(60000);
    const applicationDirectory = getTestApplicationDirectory_1.getTestApplicationDirectory({ name: 'base', language: 'javascript' });
    let healthSocket, manageFileClient, socket, stopProcess;
    setup(async () => {
        [healthSocket, socket] = await getSocketPaths_1.getSocketPaths({ count: 2 });
        const configuration = {
            ...getDefaultConfiguration_1.getDefaultConfiguration({ configurationDefinition: configurationDefinition_1.configurationDefinition }),
            applicationDirectory,
            healthPortOrSocket: healthSocket,
            portOrSocket: socket
        };
        stopProcess = await startProcess_1.startProcess({
            runtime: 'microservice',
            name: 'file',
            enableDebugMode: false,
            portOrSocket: healthSocket,
            env: toEnvironmentVariables_1.toEnvironmentVariables({
                configuration,
                configurationDefinition: configurationDefinition_1.configurationDefinition
            })
        });
        manageFileClient = new Client_2.Client({
            protocol: 'http',
            hostName: 'localhost',
            portOrSocket: socket,
            path: '/files/v2'
        });
    });
    teardown(async () => {
        if (stopProcess) {
            await stopProcess();
        }
        stopProcess = undefined;
    });
    suite('getHealth', () => {
        test('is using the health API.', async () => {
            const healthClient = new Client_1.Client({
                protocol: 'http',
                hostName: 'localhost',
                portOrSocket: healthSocket,
                path: '/health/v2'
            });
            await assertthat_1.assert.that(async () => healthClient.getHealth()).is.not.throwingAsync();
        });
    });
    suite('files', () => {
        test('stores files.', async () => {
            const file = {
                id: uuid_1.v4(),
                name: uuid_1.v4(),
                content: 'Hello world!'
            };
            await manageFileClient.addFile({
                id: file.id,
                name: file.name,
                contentType: 'text/plain',
                stream: stream_1.Readable.from(file.content)
            });
            const { stream } = await manageFileClient.getFile({ id: file.id });
            const content = await stream_to_string_1.default(stream);
            assertthat_1.assert.that(content).is.equalTo(file.content);
        });
        test('removes files.', async () => {
            const file = {
                id: uuid_1.v4(),
                name: uuid_1.v4(),
                content: 'Hello world!'
            };
            await manageFileClient.addFile({
                id: file.id,
                name: file.name,
                contentType: 'text/plain',
                stream: stream_1.Readable.from(file.content)
            });
            await manageFileClient.removeFile({ id: file.id });
            await assertthat_1.assert.that(async () => {
                await manageFileClient.getFile({ id: file.id });
            }).is.throwingAsync((ex) => ex.code === errors_1.errors.FileNotFound.code);
        });
    });
});
//# sourceMappingURL=processTests.js.map