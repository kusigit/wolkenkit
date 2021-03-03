"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const http_1 = require("../../../../lib/apis/publishMessage/http");
const runAsServer_1 = require("../../../shared/http/runAsServer");
suite('publishMessage/http', () => {
    suite('/v2', () => {
        suite('POST /', () => {
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
            test('returns 415 if the content-type header is not set to application/json.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/',
                    headers: {
                        'content-type': 'text/plain'
                    },
                    data: 'foobar',
                    responseType: 'text',
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(415);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.ContentTypeMismatch.code,
                    message: 'Header content-type must be application/json.'
                });
            });
            test('returns 400 if the channel is missing.', async () => {
                const message = { text: 'Hello world!' };
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status } = await client({
                    method: 'post',
                    url: '/v2/',
                    data: {
                        message
                    },
                    validateStatus: () => true
                });
                assertthat_1.assert.that(status).is.equalTo(400);
            });
            test('returns 200 and receives a message.', async () => {
                const message = { text: 'Hello world!' };
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status } = await client({
                    method: 'post',
                    url: '/v2/',
                    data: {
                        channel: 'messages',
                        message
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(200);
                assertthat_1.assert.that(receivedMessages.length).is.equalTo(1);
                assertthat_1.assert.that(receivedMessages[0]).is.equalTo({ channel: 'messages', message });
            });
            test('returns 500 if on received message throws an error.', async () => {
                ({ api } = await http_1.getApi({
                    corsOrigin: '*',
                    async onReceiveMessage() {
                        throw new Error('Failed to handle received message.');
                    }
                }));
                const message = { text: 'Hello world!' };
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/',
                    data: {
                        channel: 'messages',
                        message
                    },
                    responseType: 'text',
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(500);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.UnknownError.code,
                    message: 'Unknown error.'
                });
            });
        });
    });
});
//# sourceMappingURL=httpTests.js.map