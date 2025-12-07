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

      {purchase.items && purchase.items.length > 0 && (
        <div className={styles.itemsSection}>
          <h4 className={styles.itemsTitle}>Items</h4>
          <div className={styles.itemsList}>
            {purchase.items.map((item, index) => (
              <div key={index} className={styles.itemRow}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemQuantity}>Qty: {item.quantity}</span>
                </div>
                <div className={styles.itemPricing}>
                  <span className={styles.itemPrice}>
                    ${item.sellingPrice.toFixed(2)} × {item.quantity} = ${(item.sellingPrice * item.quantity).toFixed(2)}
                  </span>
                  {item.discount > 0 && (
                    <span className={styles.itemDiscount}>
                      Discount: ${item.discount.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.details}>
        <div className={styles.priceBreakdown}>
          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>Subtotal:</span>
            <span className={styles.priceValue}>${purchase.subTotal.toFixed(2)}</span>
          </div>
          {purchase.discountTotal > 0 && (
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Discount:</span>
              <span className={`${styles.priceValue} ${styles.discountValue}`}>
                -${purchase.discountTotal.toFixed(2)}
              </span>
            </div>
          )}
          {purchase.taxTotal > 0 && (
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Tax:</span>
              <span className={styles.priceValue}>${purchase.taxTotal.toFixed(2)}</span>
            </div>
          )}
          <div className={`${styles.priceRow} ${styles.grandTotalRow}`}>
            <span className={styles.priceLabel}>Grand Total:</span>
            <span className={styles.grandTotalValue}>${purchase.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className={styles.divider}></div>

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

