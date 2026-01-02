import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ReminderDetail,
  InventoryLowEvent,
} from '@inventory-platform/types';

export const eventsApi = {
  subscribe(
    onReminderDue: (data: ReminderDetail) => void,
    onInventoryLow?: (data: InventoryLowEvent) => void
  ): EventSource {
    const es = apiClient.createSseConnection(API_ENDPOINTS.EVENTS.STREAM);

    es.addEventListener('REMINDER_DUE', (event) => {
      const messageEvent = event as MessageEvent;
      onReminderDue(JSON.parse(messageEvent.data));
    });

    es.addEventListener('INVENTORY_LOW', (event) => {
      if (!onInventoryLow) return;

      const messageEvent = event as MessageEvent;
      onInventoryLow(JSON.parse(messageEvent.data));
    });

    es.onerror = () => {
      es.close();
    };

    return es;
  },
};
