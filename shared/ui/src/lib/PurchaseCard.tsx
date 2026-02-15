import { useState } from 'react';
import { cartApi } from '@inventory-platform/api';
import type { Purchase } from '@inventory-platform/types';
import styles from './PurchaseCard.module.css';
import { useNotify } from '@inventory-platform/store';

interface PurchaseCardProps {
  purchase: Purchase;
}

export function PurchaseCard({ purchase }: PurchaseCardProps) {
  const [isItemsExpanded, setIsItemsExpanded] = useState(false);
  const [isPriceExpanded, setIsPriceExpanded] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: notifyError } = useNotify;

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

  const handlePrintInvoice = async () => {
    if (!purchase.purchaseId) {
      notifyError('Purchase ID not found');
      return;
    }

    setIsPrinting(true);
    setError(null);

    try {
      const pdfBlob = await cartApi.getInvoicePdf(purchase.purchaseId);

      // Create a blob URL and open it in a new window for viewing/printing
      const url = window.URL.createObjectURL(pdfBlob);
      const newWindow = window.open(url, '_blank');

      if (!newWindow) {
        // If popup was blocked, fall back to download
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${
          purchase.invoiceNo || purchase.purchaseId
        }.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Clean up the blob URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to download invoice PDF';
      notifyError(errorMessage);
    } finally {
      setIsPrinting(false);
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
          <div className={styles.headerActions}>
            {purchase.status === 'COMPLETED' && (
              <button
                className={styles.printBtn}
                onClick={handlePrintInvoice}
                disabled={isPrinting}
                aria-label="Print Invoice"
                title="Print Invoice"
              >
                {isPrinting ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.spinner}
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                )}
              </button>
            )}
            <span
              className={`${styles.status} ${getStatusColor(purchase.status)}`}
            >
              {purchase.status}
            </span>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {purchase.items && purchase.items.length > 0 && (
        <div className={styles.itemsSection}>
          <button
            className={styles.expandButton}
            onClick={() => setIsItemsExpanded(!isItemsExpanded)}
            aria-expanded={isItemsExpanded}
            aria-label={isItemsExpanded ? 'Collapse items' : 'Expand items'}
          >
            <h4 className={styles.itemsTitle}>Items</h4>
            <span className={styles.expandIcon}>
              {isItemsExpanded ? '▼' : '▲'}
            </span>
          </button>
          {isItemsExpanded && (
            <div className={styles.itemsList}>
              {purchase.items.map((item, index) => (
                <div key={index} className={styles.itemRow}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemQuantity}>
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <div className={styles.itemPricing}>
                    <span className={styles.itemPrice}>
                      ₹{item.sellingPrice.toFixed(2)} × {item.quantity} = ₹
                      {(item.sellingPrice * item.quantity).toFixed(2)}
                    </span>
                    {item.discount > 0 && (
                      <span className={styles.itemDiscount}>
                        Discount: ₹{item.discount.toFixed(2)}
                      </span>
                    )}
                    {(item.costTotal != null ||
                      item.profit != null ||
                      item.marginPercent != null) && (
                      <span className={styles.itemMargin}>
                        {item.costTotal != null && (
                          <>Cost: ₹{item.costTotal.toFixed(2)}</>
                        )}
                        {item.profit != null && (
                          <>
                            {' '}
                            | Profit: ₹{item.profit.toFixed(2)}
                          </>
                        )}
                        {item.marginPercent != null && (
                          <> | Margin: {item.marginPercent.toFixed(1)}%</>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.details}>
        <div className={styles.priceBreakdown}>
          <button
            className={styles.expandButton}
            onClick={() => setIsPriceExpanded(!isPriceExpanded)}
            aria-expanded={isPriceExpanded}
            aria-label={
              isPriceExpanded
                ? 'Collapse price details'
                : 'Expand price details'
            }
          >
            <span className={styles.priceLabel}>Price Details</span>
            <span className={styles.expandIcon}>
              {isPriceExpanded ? '▼' : '▲'}
            </span>
          </button>
          {isPriceExpanded && (
            <>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Subtotal:</span>
                <span className={styles.priceValue}>
                  ₹{purchase.subTotal.toFixed(2)}
                </span>
              </div>
              {purchase.discountTotal > 0 && (
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Discount:</span>
                  <span
                    className={`${styles.priceValue} ${styles.discountValue}`}
                  >
                    -₹{purchase.discountTotal.toFixed(2)}
                  </span>
                </div>
              )}
              {purchase.taxTotal > 0 && (
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Tax:</span>
                  <span className={styles.priceValue}>
                    ₹{purchase.taxTotal.toFixed(2)}
                  </span>
                </div>
              )}
              <div className={`${styles.priceRow} ${styles.grandTotalRow}`}>
                <span className={styles.priceLabel}>Grand Total:</span>
                <span className={styles.grandTotalValue}>
                  ₹{purchase.grandTotal.toFixed(2)}
                </span>
              </div>
              {(purchase.totalCost != null ||
                purchase.revenueBeforeTax != null ||
                purchase.revenueAfterTax != null ||
                purchase.totalProfit != null ||
                purchase.marginPercent != null) && (
                <>
                  <div className={styles.marginDivider} />
                  {purchase.totalCost != null && (
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>Total Cost:</span>
                      <span className={styles.priceValue}>
                        ₹{purchase.totalCost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {purchase.revenueBeforeTax != null && (
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>
                        Revenue (before tax):
                      </span>
                      <span className={styles.priceValue}>
                        ₹{purchase.revenueBeforeTax.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {purchase.revenueAfterTax != null && (
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>
                        Revenue (after tax):
                      </span>
                      <span className={styles.priceValue}>
                        ₹{purchase.revenueAfterTax.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {purchase.totalProfit != null && (
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>Profit:</span>
                      <span className={styles.priceValue}>
                        ₹{purchase.totalProfit.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {purchase.marginPercent != null && (
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>Margin:</span>
                      <span className={styles.priceValue}>
                        {purchase.marginPercent.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
          {!isPriceExpanded && (
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Grand Total:</span>
              <span className={styles.grandTotalValue}>
                ₹{purchase.grandTotal.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className={styles.divider}></div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Payment Method:</span>
          <span className={styles.value}>
            {getPaymentMethodLabel(purchase.paymentMethod)}
          </span>
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
