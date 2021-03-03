"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationsDefinition = void 0;
const errors_1 = require("../errors");
const exists_1 = require("../utils/fs/exists");
const isErrnoException_1 = require("../utils/isErrnoException");
const validateNotificationsDefinition_1 = require("../validators/validateNotificationsDefinition");
const getNotificationsDefinition = async function ({ notificationsDirectory }) {
    if (!await exists_1.exists({ path: notificationsDirectory })) {
        throw new errors_1.errors.DirectoryNotFound(`Directory '<app>/build/server/notifications' not found.`);
    }
    let notificationsDefinition;
    try {
        notificationsDefinition = (await Promise.resolve().then(() => __importStar(require(notificationsDirectory)))).default;
    }
    catch (ex) {
        if (ex instanceof SyntaxError) {
            throw new errors_1.errors.ApplicationMalformed(`Syntax error in '<app>/build/server/notifications'.`, { cause: ex });
        }
        if (isErrnoException_1.isErrnoException(ex) && ex.code === 'MODULE_NOT_FOUND') {
            throw new errors_1.errors.ApplicationMalformed(`Missing import in '<app>/build/server/notifications'.`, { cause: ex });
        }
        // But throw an error if the entry is a directory without importable content.
        throw new errors_1.errors.FileNotFound(`No notifications definition in '<app>/build/server/notifications' found.`);
    }
    try {
        validateNotificationsDefinition_1.validateNotificationsDefinition({ notificationsDefinition });
    }
    catch (ex) {
        throw new errors_1.errors.NotificationsDefinitionMalformed(`Notifications definition '<app>/build/server/notifications' is malformed: ${ex.message}`);
    }
    return notificationsDefinition;
};
exports.getNotificationsDefinition = getNotificationsDefinition;
//# sourceMappingURL=getNotificationsDefinition.js.map