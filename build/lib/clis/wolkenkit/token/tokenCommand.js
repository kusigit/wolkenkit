"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenCommand = void 0;
const buntstift_1 = require("buntstift");
const errors_1 = require("../../../common/errors");
const fs_1 = __importDefault(require("fs"));
const getAbsolutePath_1 = require("../../../common/utils/path/getAbsolutePath");
const getJwtSchema_1 = require("./getJwtSchema");
const validateExpiration_1 = require("./validateExpiration");
const validate_value_1 = require("validate-value");
const limes_1 = require("limes");
const tokenCommand = function () {
    return {
        name: 'token',
        description: 'Issue a token.',
        optionDefinitions: [
            {
                name: 'issuer',
                alias: 'i',
                description: 'set the issuer',
                type: 'string',
                parameterName: 'url',
                isRequired: true
            },
            {
                name: 'private-key',
                alias: 'k',
                description: 'set the private key file',
                type: 'string',
                parameterName: 'path',
                isRequired: true
            },
            {
                name: 'claims',
                alias: 'c',
                description: 'set the claims file',
                type: 'string',
                parameterName: 'path',
                isRequired: true
            },
            {
                name: 'expiration',
                alias: 'e',
                description: 'set the expiration time',
                type: 'number',
                parameterName: 'minutes',
                isRequired: false,
                defaultValue: 60 * 24 * 365,
                validate: validateExpiration_1.validateExpiration
            },
            {
                name: 'raw',
                alias: 'r',
                description: 'only output the token',
                type: 'boolean',
                isRequired: false,
                defaultValue: false
            }
        ],
        async handle({ options: { verbose, issuer, 'private-key': privateKeyPath, claims: claimsPath, expiration: expiresInMinutes, raw } }) {
            buntstift_1.buntstift.configure(buntstift_1.buntstift.getConfiguration().
                withVerboseMode(verbose));
            let stopWaiting;
            if (!raw) {
                stopWaiting = buntstift_1.buntstift.wait();
            }
            try {
                let claims, privateKey;
                const privateKeyAbsolutePath = getAbsolutePath_1.getAbsolutePath({
                    path: privateKeyPath,
                    cwd: process.cwd()
                });
                try {
                    privateKey = await fs_1.default.promises.readFile(privateKeyAbsolutePath);
                }
                catch {
                    buntstift_1.buntstift.info(`Private key file '${privateKeyAbsolutePath}' not found.`);
                    throw new errors_1.errors.FileNotFound();
                }
                const claimsAbsolutePath = getAbsolutePath_1.getAbsolutePath({
                    path: claimsPath,
                    cwd: process.cwd()
                });
                try {
                    claims = await fs_1.default.promises.readFile(claimsAbsolutePath, { encoding: 'utf8' });
                }
                catch {
                    buntstift_1.buntstift.info(`Claims file '${claimsAbsolutePath}' not found.`);
                    throw new errors_1.errors.FileNotFound();
                }
                try {
                    claims = JSON.parse(claims);
                }
                catch {
                    buntstift_1.buntstift.info('Claims malformed.');
                    throw new errors_1.errors.ClaimsMalformed();
                }
                const value = new validate_value_1.Value(getJwtSchema_1.getJwtSchema());
                try {
                    value.validate(claims, { valueName: 'jwt' });
                }
                catch (ex) {
                    buntstift_1.buntstift.info('Claims malformed.');
                    throw ex;
                }
                const subject = claims.sub;
                const payload = { ...claims, sub: undefined };
                if (!raw) {
                    buntstift_1.buntstift.info('Issuing a token...');
                }
                const limes = new limes_1.Limes({
                    identityProviders: [new limes_1.IdentityProvider({ issuer, privateKey, expiresInMinutes })]
                });
                const token = limes.issueToken({ issuer, subject, payload });
                if (!raw) {
                    buntstift_1.buntstift.newLine();
                    buntstift_1.buntstift.line();
                    buntstift_1.buntstift.info(token);
                    buntstift_1.buntstift.line();
                    buntstift_1.buntstift.newLine();
                    buntstift_1.buntstift.success('Issued a token.');
                }
                else {
                    // eslint-disable-next-line no-console
                    console.log(token);
                }
            }
            catch (ex) {
                buntstift_1.buntstift.error('Failed to issue a token.');
                throw ex;
            }
            finally {
                if (stopWaiting) {
                    stopWaiting();
                }
            }
        }
    };
};
exports.tokenCommand = tokenCommand;
//# sourceMappingURL=tokenCommand.js.map