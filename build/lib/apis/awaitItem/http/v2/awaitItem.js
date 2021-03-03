"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awaitItem = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const defekt_1 = require("defekt");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const writeLine_1 = require("../../../base/writeLine");
const logger = flaschenpost_1.flaschenpost.getLogger();
const awaitItem = {
    description: 'Sends the next available item.',
    path: '',
    request: {},
    response: {
        statusCodes: [200],
        stream: true,
        body: {
            type: 'object',
            properties: {
                item: {},
                metadata: {
                    type: 'object',
                    properties: {
                        discriminator: { type: 'string', minLength: 1 },
                        token: { type: 'string', format: 'uuid' }
                    },
                    required: ['discriminator', 'token'],
                    additionalProperties: false
                }
            },
            required: ['item', 'metadata'],
            additionalProperties: false
        }
    },
    getHandler({ priorityQueueStore, newItemSubscriber, newItemSubscriberChannel, validateOutgoingItem, heartbeatInterval }) {
        const responseBodySchema = new validate_value_1.Value(awaitItem.response.body);
        return async function (req, res) {
            try {
                res.startStream({ heartbeatInterval });
                let lockingHasSucceeded = false;
                const onNewItem = async function () {
                    try {
                        const itemLock = await priorityQueueStore.lockNext();
                        if (itemLock) {
                            lockingHasSucceeded = true;
                            logger.debug('Locked priority queue item.', withLogMetadata_1.withLogMetadata('api', 'awaitItem', { nextLock: itemLock }));
                            await validateOutgoingItem({ item: itemLock.item });
                            responseBodySchema.validate(itemLock, { valueName: 'responseBody' });
                            writeLine_1.writeLine({ res, data: itemLock });
                            await newItemSubscriber.unsubscribe({
                                channel: newItemSubscriberChannel,
                                callback: onNewItem
                            });
                            res.end();
                        }
                    }
                    catch (ex) {
                        logger.error('An unexpected error occured when locking an item.', withLogMetadata_1.withLogMetadata('api', 'awaitItem', { error: ex }));
                        await newItemSubscriber.unsubscribe({
                            channel: newItemSubscriberChannel,
                            callback: onNewItem
                        });
                        res.end();
                    }
                };
                await onNewItem();
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (!lockingHasSucceeded) {
                    await newItemSubscriber.subscribe({
                        channel: newItemSubscriberChannel,
                        callback: onNewItem
                    });
                }
            }
            catch (ex) {
                const error = defekt_1.isCustomError(ex) ?
                    ex :
                    new errors_1.errors.UnknownError(undefined, { cause: ex });
                switch (error.code) {
                    case errors_1.errors.ContentTypeMismatch.code: {
                        res.status(415).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    default: {
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'awaitItem', { error }));
                        res.status(500).json({
                            code: error.code,
                            message: error.message
                        });
                    }
                }
            }
        };
    }
};
exports.awaitItem = awaitItem;
//# sourceMappingURL=awaitItem.js.map