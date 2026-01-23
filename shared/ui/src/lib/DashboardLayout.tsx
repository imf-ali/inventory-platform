import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '@inventory-platform/store';
import type { DashboardLayoutProps } from '@inventory-platform/types';
import styles from './DashboardLayout.module.css';
import { ThemeToggle } from './ThemeToggle';
import { useNotifications } from '@inventory-platform/store';
import { ToastProvider } from './ToastProvider';

const MENU_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  {
    path: '/dashboard/product-registration',
    label: 'Product Registration',
    icon: '📦',
  },
  { path: '/dashboard/product-search', label: 'Product Search', icon: '🔍' },
  { path: '/dashboard/scan-sell', label: 'Scan and Sell', icon: '📱' },
  { path: '/dashboard/refund', label: 'Refund', icon: '↩️' },
  // {
  //   path: '/dashboard/payment-billing',
  //   label: 'Payment & Billing',
  //   icon: '💳',
  // },
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
  const { user, shop, logout, isLoading } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Reminder notifications (ALL logic lives in hook)
  const { notifications, unreadCount, markAsRead } = useNotifications(
    user?.shopId ?? undefined
  );

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

  const handleNotificationClick = useCallback(
    (id: string) => {
      const n = notifications.find((n) => n.id === id);
      if (!n) return;

      markAsRead(id);

      if (n.type === 'REMINDER_DUE') {
        navigate('/dashboard/reminders', {
          state: { fromNotification: true, reminderId: id },
        });
      }

      if (n.type === 'INVENTORY_LOW') {
        navigate('/dashboard/inventory-alert', {
          state: { fromNotification: true, inventoryId: id },
        });
      }

      setShowNotificationMenu(false);
    },
    [notifications, markAsRead, navigate]
  );

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
      await logout();
    } finally {
      navigate('/login');
    }
  };

  return (
    <div className={styles.dashboard}>
      <ToastProvider />
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        <div className={styles.sidebarHeader}>
          <Link to="/dashboard" className={styles.logo}>
            <div className={styles.logoIcon} />
            <span className={styles.logoText}>StockKart</span>
          </Link>

          <button
            className={styles.toggleBtn}
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
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

      {/* Main */}
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>
              {filteredMenuItems.find((i) => i.path === currentPath)?.label ??
                'Dashboard'}
            </h1>

            <div className={styles.headerActions}>
              {/* Notifications */}
              <div className={styles.notificationWrapper}>
                <button
                  className={styles.notificationBtn}
                  onClick={() => setShowNotificationMenu((o) => !o)}
                >
                  🔔
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
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          className={styles.notificationItem}
                          onClick={() => handleNotificationClick(n.id)}
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
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <ThemeToggle />

              {/* User Menu */}
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  className={styles.userBtn}
                  onClick={() => setUserMenuOpen((o) => !o)}
                  disabled={isLoading}
                >
                  👤 {user?.name || user?.email || 'User'}
                </button>

                {userMenuOpen && (
                  <div className={styles.userMenu}>
                    <div className={styles.userMenuHeader}>
                      <div className={styles.userIdentity}>
                        <div className={styles.avatar}>👤</div>

                        <div className={styles.userMeta}>
                          <div className={styles.userMenuName}>
                            {user?.name || 'User'}
                          </div>
                          <div className={styles.userMenuEmail}>
                            {user?.email}
                          </div>
                        </div>
                      </div>

                      <div className={styles.userMenuInfo}>
                        <span className={styles.roleBadge}>{shop?.name}</span>
                      </div>
                    </div>

                    <button onClick={handleLogout} className={styles.logoutBtn}>
                      🚪 Logout
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
