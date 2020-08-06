import { AskInfrastructure } from './AskInfrastructure';
import { LoggerService } from '../services/LoggerService';
import { NotificationDefinition } from './NotificationDefinition';
import { NotificationService } from '../services/NotificationService';

export interface NotificationListener<
  TNotificationDefinition extends NotificationDefinition,
  TInfrastructure extends AskInfrastructure
> {
  isRelevant (notification: {
    name: string;
  }): boolean;

  handle (data: Pick<TNotificationDefinition, 'data'>, services: {
    infrastructure: Pick<TInfrastructure, 'ask'>;
    logger: LoggerService;
    notification: NotificationService;
  }): void | Promise<void>;
}
