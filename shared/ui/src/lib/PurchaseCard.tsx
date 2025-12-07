import type { Purchase } from '@inventory-platform/types';
import styles from './PurchaseCard.module.css';

interface PurchaseCardProps {
  purchase: Purchase;
}

export function PurchaseCard({ purchase }: PurchaseCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return styles.statusCompleted;
      case 'PENDING':
        return styles.statusPending;
      case 'CANCELLED':
        return styles.statusCancelled;
      default:
        return styles.statusDefault;
    }
  };

  const getPaymentMethodLabel = (method: string): string => {
    switch (method.toUpperCase()) {
      case 'CASH':
        return '💵 Cash';
      case 'ONLINE':
        return '💳 Online';
      case 'CARD':
        return '💳 Card';
      default:
        return method;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.topRow}>
          <div className={styles.invoiceInfo}>
            <h3 className={styles.invoiceNo}>{purchase.invoiceNo}</h3>
            <span className={styles.invoiceId}>ID: {purchase.invoiceId}</span>
          </div>
          <span className={`${styles.status} ${getStatusColor(purchase.status)}`}>
            {purchase.status}
          </span>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Amount:</span>
          <span className={styles.value}>${purchase.grandTotal.toFixed(2)}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>Payment Method:</span>
          <span className={styles.value}>{getPaymentMethodLabel(purchase.paymentMethod)}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>Sold At:</span>
          <span className={styles.value}>{formatDate(purchase.soldAt)}</span>
        </div>
        {purchase.customerName && (
          <div className={styles.detailRow}>
            <span className={styles.label}>Customer:</span>
            <span className={styles.value}>{purchase.customerName}</span>
          </div>
        )}
        {purchase.customerPhone && (
          <div className={styles.detailRow}>
            <span className={styles.label}>Phone:</span>
            <span className={styles.value}>{purchase.customerPhone}</span>
          </div>
        )}
        {purchase.customerAddress && (
          <div className={styles.detailRow}>
            <span className={styles.label}>Address:</span>
            <span className={styles.value}>{purchase.customerAddress}</span>
          </div>
        )}
      </div>
    </div>
  );
}

