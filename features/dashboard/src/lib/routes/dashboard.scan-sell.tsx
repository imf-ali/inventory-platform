import styles from './dashboard.scan-sell.module.css';

export function meta() {
  return [
    { title: 'Scan and Sell - InventoryPro' },
    { name: 'description', content: 'Speed up sales with barcode scanning' },
  ];
}

export default function ScanSellPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Scan and Sell</h2>
        <p className={styles.subtitle}>Speed up sales with barcode scanning</p>
      </div>
      <div className={styles.container}>
        <div className={styles.scannerSection}>
          <div className={styles.scannerBox}>
            <span className={styles.scannerIcon} role="img" aria-label="Scanner">📱</span>
            <p className={styles.scannerText}>Scan barcode or enter product code</p>
            <input
              type="text"
              className={styles.scanInput}
              placeholder="Scan or enter barcode..."
              autoFocus
            />
          </div>
        </div>
        <div className={styles.cartSection}>
          <h3 className={styles.cartTitle}>Shopping Cart</h3>
          <div className={styles.cartItems}>
            <div className={styles.cartItem}>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>Product Name</span>
                <span className={styles.itemPrice}>$99.99</span>
              </div>
              <div className={styles.itemActions}>
                <button className={styles.qtyBtn}>-</button>
                <span className={styles.qty}>1</span>
                <button className={styles.qtyBtn}>+</button>
                <button className={styles.removeBtn}>×</button>
              </div>
            </div>
          </div>
          <div className={styles.cartSummary}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>$99.99</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Tax</span>
              <span>$8.00</span>
            </div>
            <div className={styles.summaryRowTotal}>
              <span>Total</span>
              <span>$107.99</span>
            </div>
          </div>
          <div className={styles.cartActions}>
            <button className={styles.clearBtn}>Clear Cart</button>
            <button className={styles.checkoutBtn}>Process Payment</button>
          </div>
        </div>
      </div>
    </div>
  );
}

