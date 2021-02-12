import { flaschenpost } from 'flaschenpost';
import { ItemIdentifier } from '../../../../common/elements/ItemIdentifier';
import { PriorityQueueStore } from '../../../../stores/priorityQueueStore/PriorityQueueStore';
import { Response } from 'express';
import { Schema } from '../../../../common/elements/Schema';
import { Subscriber } from '../../../../messaging/pubSub/Subscriber';
import { Value } from 'validate-value';
import { withLogMetadata } from '../../../../common/utils/logging/withLogMetadata';
import { WolkenkitRequestHandler } from '../../../base/WolkenkitRequestHandler';
import { writeLine } from '../../../base/writeLine';
import typer from "content-type";
import {errors} from "../../../../common/errors";

const logger = flaschenpost.getLogger();

const awaitItem = {
  description: 'Sends the next available item.',
  path: '',

  request: {},
  response: {
    statusCodes: [ 200 ],

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
          required: [ 'discriminator', 'token' ],
          additionalProperties: false
        }
      },
      required: [ 'item', 'metadata' ],
      additionalProperties: false
    } as Schema
  },

  getHandler <TItem extends object>({
    priorityQueueStore,
    newItemSubscriber,
    newItemSubscriberChannel,
    validateOutgoingItem,
    heartbeatInterval
  }: {
    priorityQueueStore: PriorityQueueStore<TItem, ItemIdentifier>;
    newItemSubscriber: Subscriber<object>;
    newItemSubscriberChannel: string;
    validateOutgoingItem: ({ item }: { item: TItem }) => void | Promise<void>;
    heartbeatInterval: number;
  }): WolkenkitRequestHandler {
    const responseBodySchema = new Value(awaitItem.response.body);

    const maybeHandleLock = async function ({
      res
    }: {
      res: Response;
    }): Promise<boolean> {
      const nextLock = await priorityQueueStore.lockNext();

      if (nextLock !== undefined) {
        logger.info(
          'Locked priority queue item.',
          withLogMetadata('api', 'awaitItem', { nextLock })
        );

        await validateOutgoingItem({ item: nextLock.item });
        responseBodySchema.validate(nextLock, { valueName: 'responseBody' });

        writeLine({ res, data: nextLock });
        res.end();

        return true;
      }

      return false;
    };

    return async function (req, res): Promise<void> {
      try {
        const contentType = typer.parse(req);

        if (contentType.type !== 'application/x-ndjson') {
          throw new errors.ContentTypeMismatch();
        }
      } catch {
        const error = new errors.ContentTypeMismatch('Header content-type must be application/x-ndjson.');

        res.status(415).json({
          code: error.code,
          message: error.message
        });

        return;
      }

      res.startStream({ heartbeatInterval });

      const instantSuccess = await maybeHandleLock({ res });

      if (instantSuccess) {
        return;
      }

      const callback = async function (): Promise<void> {
        try {
          const success = await maybeHandleLock({ res });

          if (success) {
            await newItemSubscriber.unsubscribe({
              channel: newItemSubscriberChannel,
              callback
            });
          }
        } catch (ex: unknown) {
          logger.error(
            'An unexpected error occured when locking an item.',
            withLogMetadata('api', 'awaitItem', { err: ex })
          );
        }
      };

      await newItemSubscriber.subscribe({
        channel: newItemSubscriberChannel,
        callback
      });
    };
  }
};

export { awaitItem };
