import { useEffect, useState } from 'react';
import styles from './dashboard.inventory-alert.module.css';
import { inventoryApi } from '@inventory-platform/api';
import { InventoryAlertDetails } from '@inventory-platform/ui';

export function meta() {
  return [
    { title: 'Inventory Low Alert - InventoryPro' },
    { name: 'description', content: 'Monitor products with low stock levels' },
  ];
}

export default function InventoryAlertPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  const [defaultThreshold, setDefaultThreshold] = useState(50);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    InventoryAlertLoad();
  }, [page, size]);

  async function InventoryAlertLoad() {
    setLoading(true);

    try {
      const res = await inventoryApi.getLowStock(page, size);

      const items = res.data ?? [];

      const mapped = items.map((item) => {
        const current = item.currentCount ?? 0;
        const threshold = item.thresholdCount ?? 10;

        return {
          id: item.id,
          product: item.name ?? item.barcode ?? 'Unknown',
          current,
          threshold,
          status: current <= threshold / 2 ? 'critical' : 'warning',

          raw: item,
        };
      });

      setAlerts(mapped);
      setTotalPages(res.page?.totalPages ?? 0);
      setTotalItems(res.page?.totalItems ?? items.length);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Inventory Low Alert</h2>
        <p className={styles.subtitle}>
          Monitor products with low stock levels
        </p>
      </div>

      <div className={styles.alertsContainer}>
        <div className={styles.alertsHeader}>
          <div className={styles.headerInfo}>
            <span className={styles.alertCount}>
              {alerts.length} items need attention
            </span>
            <button
              className={styles.configureBtn}
              onClick={() => setShowConfig(true)}
            >
              Configure Thresholds
            </button>
          </div>
        </div>

        <div className={styles.alertsList}>
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`${styles.alertCard} ${styles[alert.status]}`}
            >
              <div className={styles.alertIcon}>
                {alert.status === 'critical' ? '🔴' : '🟡'}
              </div>

              <div className={styles.alertInfo}>
                <h3 className={styles.alertProduct}>{alert.product}</h3>

                <div className={styles.alertDetails}>
                  <span>
                    Current Stock: <strong>{alert.current}</strong>
                  </span>
                  <span>
                    Threshold: <strong>{alert.threshold}</strong>
                  </span>
                </div>

                <div className={styles.stockBar}>
                  <div
                    className={styles.stockFill}
                    style={{
                      width: `${Math.min(
                        (alert.current / alert.threshold) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className={styles.alertActions}>
                <button
                  className={styles.actionBtnSecondary}
                  onClick={() => setSelected(alert.raw)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.paginationBar}>
          <button
            className={styles.pageBtn}
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>

          <span className={styles.pageInfo}>
            Page {page + 1} of {totalPages} • {totalItems} items
          </span>

          <button
            className={styles.pageBtn}
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>

          <select
            className={styles.pageSizeSelect}
            value={size}
            onChange={(e) => {
              setPage(0);
              setSize(Number(e.target.value));
            }}
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>
      <InventoryAlertDetails
        open={!!selected}
        item={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
