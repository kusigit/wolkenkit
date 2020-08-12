import { PublisherOptions } from '../../../../messaging/pubSub/PublisherOptions';
import { SnapshotStrategyConfiguration } from '../../../../common/domain/SnapshotStrategyConfiguration';

export interface Configuration {
  aeonstoreHostName: string;
  aeonstorePort: number;
  aeonstoreProtocol: string;
  applicationDirectory: string;
  commandDispatcherHostName: string;
  commandDispatcherPort: number;
  commandDispatcherProtocol: string;
  commandDispatcherRetries: number;
  corsOrigin: string | string[];
  enableIntegratedClient: boolean;
  healthPort: number;
  identityProviders: { issuer: string; certificate: string }[];
  port: number;
  pubSubOptions: {
    channelForNotification: string;
    publisher: PublisherOptions;
  };
  snapshotStrategy: SnapshotStrategyConfiguration;
  subscribeMessagesChannel: string;
  subscribeMessagesHostName: string;
  subscribeMessagesPort: number;
  subscribeMessagesProtocol: string;
}
