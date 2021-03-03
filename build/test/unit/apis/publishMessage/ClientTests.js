"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const Client_1 = require("../../../../lib/apis/publishMessage/http/v2/Client");
const errors_1 = require("../../../../lib/common/errors");
const http_1 = require("../../../../lib/apis/publishMessage/http");
const runAsServer_1 = require("../../../shared/http/runAsServer");
suite('publishMessage/http/Client', () => {
    suite('/v2', () => {
        suite('postMessage', () => {
            let api, receivedMessages;
            setup(async () => {
                receivedMessages = [];
                ({ api } = await http_1.getApi({
                    corsOrigin: '*',
                    async onReceiveMessage({ channel, message }) {
                        receivedMessages.push({ channel, message });
                    }
                }));
            });
            test('sends messages.', async () => {
                const message = { text: 'Hello world!' };
                const { socket } = await runAsServer_1.runAsServer({ app: api });
                const client = new Client_1.Client({
                    hostName: 'localhost',
                    portOrSocket: socket,
                    path: '/v2'
                });
                await client.postMessage({ channel: 'messages', message });
                assertthat_1.assert.that(receivedMessages.length).is.equalTo(1);
                assertthat_1.assert.that(receivedMessages[0]).is.equalTo({ channel: 'messages', message });
            });
            test('throws an error if on received message throws an error.', async () => {
                ({ api } = await http_1.getApi({
                    corsOrigin: '*',
                    async onReceiveMessage() {
                        throw new Error('Failed to handle received message.');
                    }
                }));
                const message = { text: 'Hello world!' };
                const { socket } = await runAsServer_1.runAsServer({ app: api });
                const client = new Client_1.Client({
                    hostName: 'localhost',
                    portOrSocket: socket,
                    path: '/v2'
                });
                await assertthat_1.assert.that(async () => {
                    await client.postMessage({ channel: 'messages', message });
                }).is.throwingAsync((ex) => ex.code === errors_1.errors.UnknownError.code &&
                    ex.message === 'Unknown error.');
            });
        });
    });
});
//# sourceMappingURL=ClientTests.js.map