import styles from './dashboard.contact.module.css';

export function meta() {
  return [
    { title: 'Customers - StockKart' },
    { name: 'description', content: 'Manage your customers' },
  ];
}

export default function CustomersPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Customers</h1>
        <p className={styles.subtitle}>
          Manage your customer contacts
        </p>
      </div>
      <div className={styles.placeholder}>
        Customer list and management will be available here.
      </div>
    </div>
  );
}
