import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { ReminderDetail } from '@inventory-platform/types';

export const eventsApi = {
  subscribeToReminders(
    onReminderDue: (data: ReminderDetail) => void
  ): EventSource {
    const es = apiClient.createSseConnection(API_ENDPOINTS.EVENTS.STREAM);

    es.addEventListener('REMINDER_DUE', (event) => {
      const messageEvent = event as MessageEvent;
      onReminderDue(JSON.parse(messageEvent.data));
    });

    es.onerror = () => {
      es.close();
    };

    return es;
  },
};
