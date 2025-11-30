import { useLocation, useNavigate } from 'react-router';
import type { CheckoutResponse } from '@inventory-platform/types';
import styles from './dashboard.checkout.module.css';

export function meta() {
  return [
    { title: 'Checkout - InventoryPro' },
    { name: 'description', content: 'Review and complete your purchase' },
  ];
}

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const checkoutData = location.state?.checkoutData as CheckoutResponse | undefined;

  if (!checkoutData) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <h2>No checkout data found</h2>
          <p>Please start a new transaction from the Scan and Sell page.</p>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard/scan-sell')}>
            Go to Scan and Sell
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = (method: 'CASH' | 'ONLINE') => {
    // TODO: Implement payment processing
    console.log(`Payment method: ${method}. Payment processing will be implemented here.`);
  };

  // Calculate tax percentage
  const taxPercentage = checkoutData.subTotal > 0 
    ? ((checkoutData.taxTotal / checkoutData.subTotal) * 100).toFixed(1)
    : '0';

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Checkout</h2>
        <p className={styles.subtitle}>Invoice #{checkoutData.invoiceNo}</p>
      </div>

      <div className={styles.container}>
        {/* Invoice Details */}
        <div className={styles.invoiceSection}>
          <div className={styles.invoiceHeader}>
            <div>
              <h3 className={styles.invoiceTitle}>Invoice Details</h3>
            </div>
            <div className={styles.statusBadge}>
              <span className={styles.statusText}>{checkoutData.status}</span>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Invoice Number:</span>
              <span className={styles.infoValue}>{checkoutData.invoiceNo}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Business Type:</span>
              <span className={styles.infoValue}>{checkoutData.businessType}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Payment Method:</span>
              <span className={styles.infoValue}>{checkoutData.paymentMethod}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Date:</span>
              <span className={styles.infoValue}>{currentDate}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className={styles.itemsSection}>
          <h3 className={styles.sectionTitle}>Items</h3>
          <div className={styles.tableContainer}>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>MRP</th>
                  <th>Selling Price</th>
                  <th>Discount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {checkoutData.items.map((item: CheckoutResponse['items'][0], index: number) => {
                  const itemTotal = item.sellingPrice * item.quantity;
                  return (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.maximumRetailPrice.toFixed(2)}</td>
                      <td>${item.sellingPrice.toFixed(2)}</td>
                      <td>${item.discount.toFixed(2)}</td>
                      <td>${itemTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className={styles.summarySection}>
          <h3 className={styles.sectionTitle}>Summary</h3>
          <div className={styles.summaryTable}>
            <div className={styles.summaryRow}>
              <span>Subtotal:</span>
              <span>${checkoutData.subTotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Tax ({taxPercentage}%):</span>
              <span>${checkoutData.taxTotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Discount:</span>
              <span>${checkoutData.discountTotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRowTotal}>
              <span>Grand Total:</span>
              <span>${checkoutData.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className={styles.paymentSection}>
          <h3 className={styles.sectionTitle}>Payment Options</h3>
          <div className={styles.paymentButtons}>
            <button
              className={`${styles.paymentBtn} ${styles.cashBtn}`}
              onClick={() => handlePayment('CASH')}
            >
              <span role="img" aria-label="Cash">💵</span> Pay in Cash
            </button>
            <button
              className={`${styles.paymentBtn} ${styles.onlineBtn}`}
              onClick={() => handlePayment('ONLINE')}
            >
              <span role="img" aria-label="Online Payment">💳</span> Pay Online
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actionsSection}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard/scan-sell')}>
            Back to Scan and Sell
          </button>
        </div>
      </div>
    </div>
  );
}

