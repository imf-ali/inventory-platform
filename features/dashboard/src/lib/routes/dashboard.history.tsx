import { PurchaseList } from '@inventory-platform/ui';
import styles from './dashboard.history.module.css';

export function meta() {
  return [
    { title: 'Purchase History - InventoryPro' },
    { name: 'description', content: 'View all purchase history' },
  ];
}

export default function HistoryPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Purchase History</h1>
        <p className={styles.subtitle}>
          View all purchases made in your shop
        </p>
      </div>

      <div className={styles.content}>
        <PurchaseList />
      </div>
    </div>
  );
}

