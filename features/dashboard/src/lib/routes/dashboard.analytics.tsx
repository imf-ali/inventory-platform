import styles from './dashboard.analytics.module.css';

export function meta() {
  return [
    { title: 'Analytics Dashboard - InventoryPro' },
    { name: 'description', content: 'Comprehensive insights on sales and inventory performance' },
  ];
}

export default function AnalyticsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Analytics Dashboard</h2>
        <p className={styles.subtitle}>Comprehensive insights on sales and inventory performance</p>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Sales</span>
            <span className={styles.statTrend}>↑ 12%</span>
          </div>
          <div className={styles.statValue}>$125,450</div>
          <div className={styles.statPeriod}>This Month</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Orders</span>
            <span className={styles.statTrend}>↑ 8%</span>
          </div>
          <div className={styles.statValue}>1,234</div>
          <div className={styles.statPeriod}>This Month</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Average Order Value</span>
            <span className={styles.statTrend}>↑ 5%</span>
          </div>
          <div className={styles.statValue}>$101.66</div>
          <div className={styles.statPeriod}>This Month</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Inventory Turnover</span>
            <span className={styles.statTrend}>↑ 15%</span>
          </div>
          <div className={styles.statValue}>4.2x</div>
          <div className={styles.statPeriod}>This Quarter</div>
        </div>
      </div>
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Sales Overview</h3>
          <div className={styles.chartPlaceholder}>
            <div className={styles.chartBars}>
              {[65, 80, 45, 90, 70, 85, 95].map((height, i) => (
                <div key={i} className={styles.bar} style={{ height: `${height}%` }}></div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Top Products</h3>
          <div className={styles.productList}>
            {[
              { name: 'Product A', sales: 1250, percentage: 100 },
              { name: 'Product B', sales: 980, percentage: 78 },
              { name: 'Product C', sales: 750, percentage: 60 },
              { name: 'Product D', sales: 520, percentage: 42 },
            ].map((product, i) => (
              <div key={i} className={styles.productItem}>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{product.name}</span>
                  <span className={styles.productSales}>{product.sales} units</span>
                </div>
                <div className={styles.productBar}>
                  <div
                    className={styles.productBarFill}
                    style={{ width: `${product.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

