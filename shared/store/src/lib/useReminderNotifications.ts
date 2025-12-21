import { useEffect, useState, useCallback } from 'react';
import { eventsApi } from '@inventory-platform/api';

export type ReminderNotification = {
  id: string; // reminderId
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type ReminderEventPayload = {
  reminderId: string;
  notes?: string;
  type?: 'EXPIRY' | 'CUSTOM';
};

const STORAGE_KEY = 'reminder_notifications';

export function useReminderNotifications(shopId?: string) {
  const [notifications, setNotifications] = useState<ReminderNotification[]>(
    []
  );
  const [isConnected, setIsConnected] = useState(false);

  // Load from localStorage (browser only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  // Persist unread notifications
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unreadOnly = notifications.filter((n) => !n.read);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unreadOnly));
  }, [notifications]);

  // SSE subscription
  useEffect(() => {
    if (!shopId) return;

    const es = eventsApi.subscribeToReminders((data: ReminderEventPayload) => {
      const title =
        data.type === 'EXPIRY' ? 'Expiry Reminder' : 'Custom Reminder';

      const message =
        data.notes ??
        (data.type === 'EXPIRY'
          ? 'A product is nearing expiry.'
          : 'A custom reminder is due.');

      setNotifications((prev) => [
        {
          id: data.reminderId,
          title,
          message,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
    });

    setIsConnected(true);

    es.onerror = () => {
      setIsConnected(false);
      es.close();
    };

    return () => {
      es.close();
      setIsConnected(false);
    };
  }, [shopId]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    clearAll,
    setNotifications, // exposed for advanced cases (optional)
  };
}
