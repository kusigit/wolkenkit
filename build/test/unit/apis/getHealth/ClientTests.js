"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const Client_1 = require("../../../../lib/apis/getHealth/http/v2/Client");
const http_1 = require("../../../../lib/apis/getHealth/http");
const runAsServer_1 = require("../../../shared/http/runAsServer");
const validate_value_1 = require("validate-value");
suite('getHealth/http/Client', () => {
    suite('/v2', () => {
        suite('getHealth', () => {
            let api;
            setup(async () => {
                ({ api } = await http_1.getApi({ corsOrigin: '*' }));
            });
            test('returns health information.', async () => {
                const value = new validate_value_1.Value({
                    type: 'object',
                    properties: {
                        host: {
                            type: 'object',
                            properties: {
                                architecture: { type: 'string' },
                                platform: { type: 'string' }
                            },
                            required: ['architecture', 'platform'],
                            additionalProperties: false
                        },
                        node: {
                            type: 'object',
                            properties: {
                                version: { type: 'string' }
                            },
                            required: ['version'],
                            additionalProperties: false
                        },
                        process: {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                uptime: { type: 'number' }
                            },
                            required: ['id', 'uptime'],
                            additionalProperties: false
                        },
                        cpuUsage: {
                            type: 'object',
                            properties: {
                                user: { type: 'number' },
                                system: { type: 'number' }
                            },
                            required: ['user', 'system'],
                            additionalProperties: false
                        },
                        memoryUsage: {
                            type: 'object',
                            properties: {
                                rss: { type: 'number' },
                                maxRss: { type: 'number' },
                                heapTotal: { type: 'number' },
                                heapUsed: { type: 'number' },
                                external: { type: 'number' }
                            },
                            required: ['rss', 'maxRss', 'heapTotal', 'heapUsed', 'external'],
                            additionalProperties: false
                        },
                        diskUsage: {
                            type: 'object',
                            properties: {
                                read: { type: 'number' },
                                write: { type: 'number' }
                            },
                            required: ['read', 'write'],
                            additionalProperties: false
                        }
                    },
                    required: ['host', 'node', 'process', 'cpuUsage', 'memoryUsage', 'diskUsage'],
                    additionalProperties: false
                });
                const { socket } = await runAsServer_1.runAsServer({ app: api });
                const client = new Client_1.Client({
                    hostName: 'localhost',
                    portOrSocket: socket,
                    path: '/v2'
                });
                const data = await client.getHealth();
                assertthat_1.assert.that(() => {
                    value.validate(data);
                }).is.not.throwing();
            });
        });
    });
});
//# sourceMappingURL=ClientTests.js.map