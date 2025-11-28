import styles from './dashboard.inventory-alert.module.css';

export function meta() {
  return [
    { title: 'Inventory Low Alert - InventoryPro' },
    { name: 'description', content: 'Monitor products with low stock levels' },
  ];
}

export default function InventoryAlertPage() {
  const alerts = [
    { product: 'MacBook Pro 16"', current: 5, threshold: 10, status: 'critical' },
    { product: 'iPhone 15 Pro', current: 8, threshold: 15, status: 'warning' },
    { product: 'AirPods Pro', current: 12, threshold: 20, status: 'warning' },
    { product: 'iPad Air', current: 3, threshold: 10, status: 'critical' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Inventory Low Alert</h2>
        <p className={styles.subtitle}>Monitor products with low stock levels</p>
      </div>
      <div className={styles.alertsContainer}>
        <div className={styles.alertsHeader}>
          <div className={styles.headerInfo}>
            <span className={styles.alertCount}>{alerts.length} items need attention</span>
            <button className={styles.configureBtn}>Configure Thresholds</button>
          </div>
        </div>
        <div className={styles.alertsList}>
          {alerts.map((alert, index) => (
            <div key={index} className={`${styles.alertCard} ${styles[alert.status]}`}>
              <div className={styles.alertIcon}>
                {alert.status === 'critical' ? '🔴' : '🟡'}
              </div>
              <div className={styles.alertInfo}>
                <h3 className={styles.alertProduct}>{alert.product}</h3>
                <div className={styles.alertDetails}>
                  <span>Current Stock: <strong>{alert.current}</strong></span>
                  <span>Threshold: <strong>{alert.threshold}</strong></span>
                </div>
                <div className={styles.stockBar}>
                  <div
                    className={styles.stockFill}
                    style={{
                      width: `${(alert.current / alert.threshold) * 100}%`,
                      maxWidth: '100%',
                    }}
                  ></div>
                </div>
              </div>
              <div className={styles.alertActions}>
                <button className={styles.actionBtn}>Reorder</button>
                <button className={styles.actionBtnSecondary}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

