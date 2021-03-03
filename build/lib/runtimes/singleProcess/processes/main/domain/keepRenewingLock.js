"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keepRenewingLock = void 0;
const getPromiseStatus_1 = require("../../../../../common/utils/getPromiseStatus");
const sleep_1 = require("../../../../../common/utils/sleep");
const keepRenewingLock = async function ({ command, handleCommandPromise, priorityQueue, token }) {
    // eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition
    while (true) {
        await sleep_1.sleep({ ms: priorityQueue.renewalInterval });
        if (await getPromiseStatus_1.getPromiseStatus(handleCommandPromise) !== 'pending') {
            break;
        }
        await priorityQueue.store.renewLock({
            discriminator: command.aggregateIdentifier.aggregate.id,
            token
        });
    }
};
exports.keepRenewingLock = keepRenewingLock;
//# sourceMappingURL=keepRenewingLock.js.map