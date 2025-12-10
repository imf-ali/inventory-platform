// DashboardLayout.tsx
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '@inventory-platform/store';
import { ThemeToggle } from './ThemeToggle';
import type { DashboardLayoutProps } from '@inventory-platform/types';
import styles from './DashboardLayout.module.css';
import { createSseConnection, API_ENDPOINTS } from '@inventory-platform/api';

type ReminderNotification = {
  id: string; // reminderId
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

const MENU_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  {
    path: '/dashboard/product-registration',
    label: 'Product Registration',
    icon: '📦',
  },
  { path: '/dashboard/product-search', label: 'Product Search', icon: '🔍' },
  { path: '/dashboard/scan-sell', label: 'Scan and Sell', icon: '📱' },
  {
    path: '/dashboard/payment-billing',
    label: 'Payment & Billing',
    icon: '💳',
  },
  { path: '/dashboard/analytics', label: 'Analytics Dashboard', icon: '📈' },
  {
    path: '/dashboard/inventory-alert',
    label: 'Inventory Low Alert',
    icon: '🔔',
  },
  { path: '/dashboard/reminders', label: 'Reminder', icon: '📅' },
  { path: '/dashboard/invitations', label: 'Invitations', icon: '✉️' },
  { path: '/dashboard/my-invitations', label: 'My Invitations', icon: '📬' },
  { path: '/dashboard/join-requests', label: 'Join Requests', icon: '🤝' },
  { path: '/dashboard/shop-users', label: 'Shop Users', icon: '👥' },
  { path: '/dashboard/history', label: 'History', icon: '📜' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState<ReminderNotification[]>(
    []
  );
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [userMenuOpen]);

  // Load notifications from localStorage on mount (browser only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('reminder_notifications');
    if (!saved) return;

    try {
      const parsed: ReminderNotification[] = JSON.parse(saved);
      setNotifications(parsed);
    } catch {
      // ignore corrupted data
    }
  }, []);

  // SSE subscription
  useEffect(() => {
    if (!user?.shopId) return;

    const eventSource = createSseConnection(API_ENDPOINTS.REMINDERS.STREAM);

    const onReminderDue = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as {
          reminderId: string;
          notes?: string;
          type?: 'EXPIRY' | 'CUSTOM';
        };

        const title =
          data.type === 'EXPIRY' ? 'Expiry Reminder' : 'Custom Reminder';

        const message =
          data.notes ||
          (data.type === 'EXPIRY'
            ? 'A product is nearing expiry.'
            : 'A custom reminder is due.');

        setNotifications((prev) => {
          const updated: ReminderNotification[] = [
            {
              id: data.reminderId,
              title,
              message,
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...prev,
          ].slice(0, 10);

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(
              'reminder_notifications',
              JSON.stringify(updated)
            );
          }
          return updated;
        });
      } catch {
        // ignore bad payload
      }
    };

    eventSource.addEventListener('REMINDER_DUE', onReminderDue);
    eventSource.onerror = () => eventSource.close();

    return () => {
      eventSource.removeEventListener('REMINDER_DUE', onReminderDue as any);
      eventSource.close();
    };
  }, [user?.shopId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = useCallback(
    (notification: ReminderNotification) => {
      navigate('/dashboard/reminders', {
        state: { fromNotification: true, reminderId: notification.id },
      });

      setNotifications((prev) => {
        const updated = prev.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item
        );

        if (typeof window !== 'undefined') {
          // only keep unread in storage so old ones don't live forever
          const onlyUnread = updated.filter((item) => !item.read);
          window.localStorage.setItem(
            'reminder_notifications',
            JSON.stringify(onlyUnread)
          );
        }

        return updated;
      });

      setShowNotificationMenu(false);
    },
    [navigate]
  );

  const toggleNotifications = () => setShowNotificationMenu((open) => !open);

  const filteredMenuItems = useMemo(() => {
    if (user?.role !== 'CASHIER') return MENU_ITEMS;
    return MENU_ITEMS.filter(
      (item) =>
        item.path !== '/dashboard/shop-users' &&
        item.path !== '/dashboard/invitations' &&
        item.path !== '/dashboard/join-requests'
    );
  }, [user?.role]);

  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('reminder_notifications');
      }
      await logout();
    } finally {
      navigate('/login');
    }
  };

  return (
    <div className={styles.dashboard}>
      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        <div className={styles.sidebarHeader}>
          <Link to="/dashboard" className={styles.logo}>
            <div className={styles.logoIcon}></div>
            <span className={styles.logoText}>InventoryPro</span>
          </Link>
          <button
            className={styles.toggleBtn}
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d={
                  sidebarOpen
                    ? 'M6 15L11 10L6 5'
                    : 'M5 5L15 5M5 10L15 10M5 15L15 15'
                }
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${
                currentPath === item.path ? styles.active : ''
              }`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && (
                <span className={styles.navLabel}>{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>
              {filteredMenuItems.find((it) => it.path === currentPath)?.label ??
                'Dashboard'}
            </h1>

            <div className={styles.headerActions}>
              {/* 🔔 Notification bell */}
              <div className={styles.notificationWrapper}>
                <button
                  type="button"
                  className={styles.notificationBtn}
                  onClick={toggleNotifications}
                  aria-label="Open notifications"
                >
                  <span className={styles.notificationIcon}>🔔</span>
                  {unreadCount > 0 && (
                    <span className={styles.notificationBadge}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotificationMenu && (
                  <div className={styles.notificationMenu}>
                    {notifications.length === 0 ? (
                      <div className={styles.notificationEmpty}>
                        No reminders due
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className={styles.notificationItem}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className={styles.notificationTitle}>
                            <span>{n.title}</span>
                            {!n.read && (
                              <span className={styles.notificationDot} />
                            )}
                          </div>
                          <div className={styles.notificationMessage}>
                            {n.message}
                          </div>
                          <div className={styles.notificationTime}>
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <ThemeToggle />

              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  className={styles.userBtn}
                  onClick={() => setUserMenuOpen((o) => !o)}
                  disabled={isLoading}
                >
                  <span className={styles.userIcon}>👤</span>
                  <span>{user?.name || user?.email || 'User'}</span>
                </button>
                {userMenuOpen && (
                  <div className={styles.userMenu}>
                    <div className={styles.userMenuHeader}>
                      <div className={styles.userMenuName}>
                        {user?.name || 'User'}
                      </div>
                      <div className={styles.userMenuEmail}>{user?.email}</div>
                      <div className={styles.userMenuInfo}>
                        Role: {user?.role} | Shop: {user?.shopId || 'N/A'}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className={styles.logoutBtn}
                    >
                      {isLoading ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
