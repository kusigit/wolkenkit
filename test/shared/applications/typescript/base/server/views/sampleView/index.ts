import { all } from './queries/all';
import { flowSampleFlowUpdatedNotificationListener } from './notificationListeners/flowSampleFlowUpdatedNotificationListener';
// @ts-ignore
import { View } from 'wolkenkit';

const sampleView: View = {
  queryHandlers: {
    all
  },
  notificationListeners: {
    flowSampleFlowUpdatedNotificationListener
  }
};

export default sampleView;
