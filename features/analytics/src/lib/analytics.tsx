import { useState } from 'react';
import styles from './analytics.module.css';
import { SalesAnalytics } from './SalesAnalytics';
import { ProfitAnalytics } from './ProfitAnalytics';

export function InventoryPlatformAnalytics() {
  const [activeTab, setActiveTab] = useState<'sales' | 'profit'>('sales');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Analytics Dashboard</h1>
        <p className={styles.subtitle}>Comprehensive insights on sales and profit performance</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'sales' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales Analytics
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'profit' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('profit')}
        >
          Profit Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'sales' && <SalesAnalytics />}
        {activeTab === 'profit' && <ProfitAnalytics />}
      </div>
    </div>
  );
}

export default InventoryPlatformAnalytics;
