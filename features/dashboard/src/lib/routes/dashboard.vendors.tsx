import styles from './dashboard.contact.module.css';

export function meta() {
  return [
    { title: 'Vendors - StockKart' },
    { name: 'description', content: 'Manage your vendors' },
  ];
}

export default function VendorsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Vendors</h1>
        <p className={styles.subtitle}>
          Manage your vendor contacts
        </p>
      </div>
      <div className={styles.placeholder}>
        Vendor list and management will be available here.
      </div>
    </div>
  );
}
