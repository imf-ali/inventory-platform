import styles from './dashboard.reminders.module.css';

export function meta() {
  return [
    { title: 'Reminder to Sell/Return - InventoryPro' },
    { name: 'description', content: 'Stay on top of expiring products and scheduled returns' },
  ];
}

export default function RemindersPage() {
  const reminders = [
    { type: 'sell', product: 'Milk - Expires Soon', date: '2025-01-15', priority: 'high', daysLeft: 2 },
    { type: 'return', product: 'Order #1234 - Return Due', date: '2025-01-18', priority: 'medium', daysLeft: 5 },
    { type: 'sell', product: 'Bread - Expires Soon', date: '2025-01-16', priority: 'high', daysLeft: 3 },
    { type: 'return', product: 'Order #1235 - Return Due', date: '2025-01-20', priority: 'low', daysLeft: 7 },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Reminder to Sell/Return</h2>
        <p className={styles.subtitle}>Stay on top of expiring products and scheduled returns</p>
      </div>
      <div className={styles.remindersContainer}>
        <div className={styles.filters}>
          <button className={`${styles.filterBtn} ${styles.active}`}>All</button>
          <button className={styles.filterBtn}>Sell Reminders</button>
          <button className={styles.filterBtn}>Return Reminders</button>
        </div>
        <div className={styles.remindersList}>
          {reminders.map((reminder, index) => (
            <div key={index} className={`${styles.reminderCard} ${styles[reminder.priority]}`}>
              <div className={styles.reminderIcon}>
                {reminder.type === 'sell' ? '📅' : '↩️'}
              </div>
              <div className={styles.reminderInfo}>
                <div className={styles.reminderHeader}>
                  <h3 className={styles.reminderTitle}>{reminder.product}</h3>
                  <span className={`${styles.priorityBadge} ${styles[reminder.priority]}`}>
                    {reminder.priority}
                  </span>
                </div>
                <div className={styles.reminderDetails}>
                  <span>Due Date: {reminder.date}</span>
                  <span className={styles.daysLeft}>
                    {reminder.daysLeft} {reminder.daysLeft === 1 ? 'day' : 'days'} left
                  </span>
                </div>
              </div>
              <div className={styles.reminderActions}>
                <button className={styles.actionBtn}>View</button>
                <button className={styles.actionBtnPrimary}>
                  {reminder.type === 'sell' ? 'Mark as Sold' : 'Process Return'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

