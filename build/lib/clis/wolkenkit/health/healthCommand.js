"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCommand = void 0;
const buntstift_1 = require("buntstift");
const Client_1 = require("../../../apis/getHealth/http/v2/Client");
const errors_1 = require("../../../common/errors");
const validatePort_1 = require("../dev/validatePort");
const validateSocket_1 = require("../dev/validateSocket");
const healthCommand = function () {
    return {
        name: 'health',
        description: 'Verify the health of a wolkenkit application process.',
        optionDefinitions: [
            {
                name: 'protocol',
                alias: 'r',
                description: 'set the protocol',
                parameterName: 'protocol',
                type: 'string',
                isRequired: false,
                defaultValue: 'http'
            },
            {
                name: 'host-name',
                alias: 'n',
                description: 'set the host name',
                parameterName: 'hostName',
                type: 'string',
                isRequired: false,
                defaultValue: 'localhost'
            },
            {
                name: 'health-port',
                alias: 'p',
                description: 'set the health port',
                parameterName: 'port',
                type: 'number',
                isRequired: false,
                validate: validatePort_1.validatePort
            },
            {
                name: 'health-socket',
                alias: 's',
                description: 'set the health socket',
                parameterName: 'path',
                type: 'string',
                isRequired: false,
                validate: validateSocket_1.validateSocket
            },
            {
                name: 'base-path',
                alias: 'b',
                description: 'set the health base path',
                parameterName: 'basePath',
                type: 'string',
                isRequired: false,
                defaultValue: '/health/v2/'
            }
        ],
        async handle({ options: { protocol, 'host-name': hostName, 'health-port': healthPort, 'health-socket': healthSocket, 'base-path': basePath, verbose } }) {
            var _a;
            buntstift_1.buntstift.configure(buntstift_1.buntstift.getConfiguration().
                withVerboseMode(verbose));
            if (healthPort && healthSocket) {
                buntstift_1.buntstift.info('Health port and health socket must not be set at the same time.');
                throw new errors_1.errors.ParameterInvalid();
            }
            const healthPortOrSocket = (_a = healthPort !== null && healthPort !== void 0 ? healthPort : healthSocket) !== null && _a !== void 0 ? _a : 3001;
            buntstift_1.buntstift.info(`Sending health request to '${protocol}://${hostName}:${healthPort}${basePath}'.`);
            const healthClient = new Client_1.Client({
                protocol,
                hostName,
                portOrSocket: healthPortOrSocket,
                path: basePath
            });
            try {
                const healthData = await healthClient.getHealth();
                buntstift_1.buntstift.success('Health check successful.');
                buntstift_1.buntstift.verbose(JSON.stringify(healthData, null, 2));
                // eslint-disable-next-line unicorn/no-process-exit
                process.exit(0);
            }
            catch {
                buntstift_1.buntstift.error('Health check failed.');
                // eslint-disable-next-line unicorn/no-process-exit
                process.exit(1);
            }
        }
    };
};
exports.healthCommand = healthCommand;
//# sourceMappingURL=healthCommand.js.map