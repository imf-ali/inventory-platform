import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '@inventory-platform/store';
import { ThemeToggle } from './ThemeToggle';
import type { DashboardLayoutProps } from '@inventory-platform/types';
import styles from './DashboardLayout.module.css';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/dashboard/product-registration', label: 'Product Registration', icon: '📦' },
  { path: '/dashboard/product-search', label: 'Product Search', icon: '🔍' },
  { path: '/dashboard/scan-sell', label: 'Scan and Sell', icon: '📱' },
  { path: '/dashboard/payment-billing', label: 'Payment & Billing', icon: '💳' },
  { path: '/dashboard/analytics', label: 'Analytics Dashboard', icon: '📈' },
  { path: '/dashboard/inventory-alert', label: 'Inventory Low Alert', icon: '🔔' },
  { path: '/dashboard/reminders', label: 'Reminder to Sell/Return', icon: '📅' },
  { path: '/dashboard/invitations', label: 'Invitations', icon: '✉️' },
  { path: '/dashboard/my-invitations', label: 'My Invitations', icon: '📬' },
  { path: '/dashboard/shop-users', label: 'Shop Users', icon: '👥' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      // Even if logout fails, clear local state and redirect
      navigate('/login');
    }
  };

  const currentPath = location.pathname;

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    // Hide Shop Users and Invitations for CASHIER role
    if (user?.role === 'CASHIER') {
      if (item.path === '/dashboard/shop-users' || item.path === '/dashboard/invitations') {
        return false;
      }
    }
    return true;
  });

  return (
    <div className={styles.dashboard}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <Link to="/dashboard" className={styles.logo}>
            <div className={styles.logoIcon}></div>
            <span className={styles.logoText}>InventoryPro</span>
          </Link>
          <button
            className={styles.toggleBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d={sidebarOpen ? "M6 15L11 10L6 5" : "M5 5L15 5M5 10L15 10M5 15L15 15"}
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
              className={`${styles.navItem} ${currentPath === item.path ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && <span className={styles.navLabel}>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>
              {filteredMenuItems.find(item => item.path === currentPath)?.label || 'Dashboard'}
            </h1>
            <div className={styles.headerActions}>
              <ThemeToggle />
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button 
                  className={styles.userBtn}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
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
                      <div className={styles.userMenuEmail}>
                        {user?.email}
                      </div>
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

