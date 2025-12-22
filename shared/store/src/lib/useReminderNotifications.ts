import { useEffect, useState, useCallback } from 'react';
import { eventsApi } from '@inventory-platform/api';

export type ReminderNotification = {
  id: string;
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

/* SAFE LOCAL STORAGE HYDRATION */
function loadFromStorage(): ReminderNotification[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useReminderNotifications(shopId?: string) {
  // hydrate ONCE, before effects
  const [notifications, setNotifications] =
    useState<ReminderNotification[]>(loadFromStorage);
  const [isConnected, setIsConnected] = useState(false);

  /* ---------- PERSIST (STRICTMODE SAFE) ---------- */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unreadOnly = notifications.filter((n) => !n.read);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unreadOnly));
  }, [notifications]);

  /* ---------- SSE SUBSCRIPTION ---------- */
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

      setNotifications((prev) => {
        // prevent duplicates
        if (prev.some((n) => n.id === data.reminderId)) return prev;

        return [
          {
            id: data.reminderId,
            title,
            message,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ];
      });
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

  /* ---------- ACTIONS ---------- */
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
  };
}
