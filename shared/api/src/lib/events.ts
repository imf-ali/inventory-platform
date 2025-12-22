import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export const eventsApi = {
  subscribeToReminders(
    onReminderDue: (data: {
      reminderId: string;
      inventoryId: string;
      notes?: string;
      type?: 'EXPIRY' | 'CUSTOM';
    }) => void
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
