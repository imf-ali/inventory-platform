import styles from './dashboard.module.css';

export function meta() {
  return [
    { title: 'Dashboard - InventoryPro' },
    { name: 'description', content: 'Inventory management dashboard' },
  ];
}

export default function DashboardPage() {
  return (
    <div className={styles.dashboard}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📦</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>1,234</div>
              <div className={styles.statLabel}>Total Products</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>$45,678</div>
              <div className={styles.statLabel}>Total Revenue</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🛒</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>567</div>
              <div className={styles.statLabel}>Orders Today</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⚠️</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>23</div>
              <div className={styles.statLabel}>Low Stock Items</div>
            </div>
          </div>
        </div>
        <div className={styles.contentGrid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Recent Activity</h2>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <span className={styles.activityIcon}>📦</span>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>New product added: iPhone 15 Pro</div>
                  <div className={styles.activityTime}>2 minutes ago</div>
                </div>
              </div>
              <div className={styles.activityItem}>
                <span className={styles.activityIcon}>💰</span>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>Order #1234 completed</div>
                  <div className={styles.activityTime}>15 minutes ago</div>
                </div>
              </div>
              <div className={styles.activityItem}>
                <span className={styles.activityIcon}>🔔</span>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>Low stock alert: MacBook Pro</div>
                  <div className={styles.activityTime}>1 hour ago</div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Quick Actions</h2>
            <div className={styles.quickActions}>
              <button className={styles.actionBtn}>
                <span className={styles.actionIcon}>📦</span>
                <span>Add Product</span>
              </button>
              <button className={styles.actionBtn}>
                <span className={styles.actionIcon}>🔍</span>
                <span>Search Product</span>
              </button>
              <button className={styles.actionBtn}>
                <span className={styles.actionIcon}>📱</span>
                <span>Scan & Sell</span>
              </button>
              <button className={styles.actionBtn}>
                <span className={styles.actionIcon}>💳</span>
                <span>Process Payment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
