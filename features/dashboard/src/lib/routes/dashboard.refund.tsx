import { useState, FormEvent, useEffect } from 'react';
import { refundsApi } from '@inventory-platform/api';
import type {
  Purchase,
  RefundItem,
  Refund,
  SearchPurchasesParams,
} from '@inventory-platform/types';
import styles from './dashboard.refund.module.css';

export function meta() {
  return [
    { title: 'Refund - StockKart' },
    {
      name: 'description',
      content: 'Process refunds for purchases',
    },
  ];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export default function RefundPage() {
  const [activeTab, setActiveTab] = useState<'process' | 'history'>('process');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search state
  const [searchParams, setSearchParams] = useState<SearchPurchasesParams>({
    customerEmail: '',
    customerPhone: '',
    customerName: '',
    invoiceNo: '',
  });
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [refundItems, setRefundItems] = useState<
    Record<string, { quantity: number; maxQuantity: number }>
  >({});

  // History state
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit] = useState(20);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  const handleSearchChange = (field: keyof SearchPurchasesParams, value: string) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSearchPurchases = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setSelectedPurchase(null);
    setRefundItems({});

    try {
      const response = await refundsApi.searchPurchases({
        ...searchParams,
        page: 1,
        limit: 20,
      });
      setPurchases(response.purchases);
      if (response.purchases.length === 0) {
        setError('No purchases found with the given criteria.');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to search purchases. Please try again.';
      setError(errorMessage);
      setPurchases([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPurchase = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    // Initialize refund items with max quantities
    const items: Record<string, { quantity: number; maxQuantity: number }> = {};
    purchase.items.forEach((item) => {
      items[item.inventoryId] = {
        quantity: 0,
        maxQuantity: item.quantity,
      };
    });
    setRefundItems(items);
    setError(null);
    setSuccess(null);
  };

  const handleRefundQuantityChange = (
    inventoryId: string,
    value: string
  ) => {
    const item = refundItems[inventoryId];
    if (!item) return;

    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) {
      setRefundItems((prev) => ({
        ...prev,
        [inventoryId]: { ...item, quantity: 0 },
      }));
      return;
    }

    if (numValue > item.maxQuantity) {
      setRefundItems((prev) => ({
        ...prev,
        [inventoryId]: { ...item, quantity: item.maxQuantity },
      }));
      return;
    }

    setRefundItems((prev) => ({
      ...prev,
      [inventoryId]: { ...item, quantity: numValue },
    }));
  };

  const handleProcessRefund = async () => {
    if (!selectedPurchase) {
      setError('Please select a purchase first.');
      return;
    }

    const itemsToRefund: RefundItem[] = [];
    let hasItems = false;

    Object.entries(refundItems).forEach(([inventoryId, item]) => {
      if (item.quantity > 0) {
        itemsToRefund.push({
          inventoryId,
          quantity: item.quantity,
        });
        hasItems = true;
      }
    });

    if (!hasItems) {
      setError('Please select at least one item to refund.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await refundsApi.create({
        purchaseId: selectedPurchase.purchaseId,
        items: itemsToRefund,
      });

      setSuccess(
        `Refund processed successfully! Refund Amount: ${formatCurrency(
          response.refundAmount
        )}. Refund ID: ${response.refundId}`
      );

      // Reset form
      setSelectedPurchase(null);
      setRefundItems({});
      setPurchases([]);

      // Refresh history if on history tab
      if (activeTab === 'history') {
        loadRefundHistory();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to process refund. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRefundHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await refundsApi.getAll({
        page: historyPage,
        limit: historyLimit,
      });
      setRefunds(response.refunds);
      setHistoryTotalPages(response.totalPages);
      setHistoryTotal(response.total);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to load refund history. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: 'process' | 'history') => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
    if (tab === 'history') {
      loadRefundHistory();
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadRefundHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyPage, activeTab]);

  const calculateRefundTotal = (): number => {
    if (!selectedPurchase) return 0;

    let total = 0;
    Object.entries(refundItems).forEach(([inventoryId, item]) => {
      if (item.quantity > 0) {
        const purchaseItem = selectedPurchase.items.find(
          (i) => i.inventoryId === inventoryId
        );
        if (purchaseItem) {
          total += purchaseItem.sellingPrice * item.quantity;
        }
      }
    });

    return total;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Refund Management</h2>
        <p className={styles.subtitle}>
          Process refunds for purchases and view refund history
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'process' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('process')}
        >
          Process Refund
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('history')}
        >
          Refund History
        </button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}

      {activeTab === 'process' && (
        <div className={styles.content}>
          <div className={styles.searchSection}>
            <h3 className={styles.sectionTitle}>Search Purchase</h3>
            <form onSubmit={handleSearchPurchases} className={styles.searchForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="customerName" className={styles.label}>
                    Customer Name
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    className={styles.input}
                    placeholder="Enter customer name"
                    value={searchParams.customerName || ''}
                    onChange={(e) => handleSearchChange('customerName', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="customerPhone" className={styles.label}>
                    Customer Phone
                  </label>
                  <input
                    type="text"
                    id="customerPhone"
                    className={styles.input}
                    placeholder="Enter customer phone"
                    value={searchParams.customerPhone || ''}
                    onChange={(e) => handleSearchChange('customerPhone', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="customerEmail" className={styles.label}>
                    Customer Email
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    className={styles.input}
                    placeholder="Enter customer email"
                    value={searchParams.customerEmail || ''}
                    onChange={(e) => handleSearchChange('customerEmail', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="invoiceNo" className={styles.label}>
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    id="invoiceNo"
                    className={styles.input}
                    placeholder="Enter invoice number"
                    value={searchParams.invoiceNo || ''}
                    onChange={(e) => handleSearchChange('invoiceNo', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <button
                type="submit"
                className={styles.searchBtn}
                disabled={isLoading}
              >
                {isLoading ? 'Searching...' : 'Search Purchases'}
              </button>
            </form>
          </div>

          {purchases.length > 0 && (
            <div className={styles.purchasesSection}>
              <h3 className={styles.sectionTitle}>Select Purchase</h3>
              <div className={styles.purchasesList}>
                {purchases.map((purchase) => (
                  <div key={purchase.purchaseId}>
                    <div
                      className={`${styles.purchaseCard} ${
                        selectedPurchase?.purchaseId === purchase.purchaseId
                          ? styles.selectedPurchase
                          : ''
                      }`}
                      onClick={() => handleSelectPurchase(purchase)}
                    >
                      <div className={styles.purchaseHeader}>
                        <div>
                          <strong>Invoice No:</strong> {purchase.invoiceNo}
                        </div>
                        <div>
                          <strong>Date:</strong> {formatDate(purchase.soldAt)}
                        </div>
                      </div>
                      <div className={styles.purchaseDetails}>
                        <div>
                          <strong>Customer:</strong>{' '}
                          {purchase.customerName || 'N/A'}
                        </div>
                        <div>
                          <strong>Phone:</strong> {purchase.customerPhone || 'N/A'}
                        </div>
                        <div>
                          <strong>Total:</strong> {formatCurrency(purchase.grandTotal)}
                        </div>
                        <div>
                          <strong>Payment:</strong> {purchase.paymentMethod}
                        </div>
                      </div>
                    </div>

                    {selectedPurchase?.purchaseId === purchase.purchaseId && (
                      <div className={styles.refundSection}>
                        <h3 className={styles.sectionTitle}>Select Items to Refund</h3>
                        <div className={styles.purchaseInfo}>
                          <div>
                            <strong>Invoice No:</strong> {selectedPurchase.invoiceNo}
                          </div>
                          <div>
                            <strong>Customer:</strong> {selectedPurchase.customerName || 'N/A'}
                          </div>
                          <div>
                            <strong>Date:</strong> {formatDate(selectedPurchase.soldAt)}
                          </div>
                        </div>

                        <div className={styles.itemsTable}>
                          <table>
                            <thead>
                              <tr>
                                <th>Item Name</th>
                                <th>MRP</th>
                                <th>Selling Price</th>
                                <th>Purchased Qty</th>
                                <th>Refund Qty</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPurchase.items.map((item) => {
                                const refundItem = refundItems[item.inventoryId];
                                return (
                                  <tr key={item.inventoryId}>
                                    <td>{item.name}</td>
                                    <td>{formatCurrency(item.maximumRetailPrice)}</td>
                                    <td>{formatCurrency(item.sellingPrice)}</td>
                                    <td>{item.quantity}</td>
                                    <td>
                                      <input
                                        type="number"
                                        min="0"
                                        max={item.quantity}
                                        value={refundItem?.quantity || 0}
                                        onChange={(e) =>
                                          handleRefundQuantityChange(
                                            item.inventoryId,
                                            e.target.value
                                          )
                                        }
                                        className={styles.quantityInput}
                                        disabled={isLoading}
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className={styles.refundSummary}>
                          <div className={styles.summaryRow}>
                            <span>Estimated Refund Amount:</span>
                            <strong>{formatCurrency(calculateRefundTotal())}</strong>
                          </div>
                        </div>

                        <button
                          className={styles.processRefundBtn}
                          onClick={handleProcessRefund}
                          disabled={isLoading || calculateRefundTotal() === 0}
                        >
                          {isLoading ? 'Processing...' : 'Process Refund'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className={styles.content}>
          <div className={styles.historySection}>
            <h3 className={styles.sectionTitle}>Refund History</h3>
            {isLoading && refunds.length === 0 ? (
              <div className={styles.loading}>Loading refund history...</div>
            ) : refunds.length === 0 ? (
              <div className={styles.emptyState}>No refunds found.</div>
            ) : (
              <>
                <div className={styles.refundsList}>
                  {refunds.map((refund) => (
                    <div key={refund.refundId} className={styles.refundCard}>
                      <div className={styles.refundHeader}>
                        <div>
                          <strong>Refund ID:</strong> {refund.refundId}
                        </div>
                        <div>
                          <strong>Date:</strong> {formatDate(refund.createdAt)}
                        </div>
                      </div>
                      <div className={styles.refundDetails}>
                        <div>
                          <strong>Invoice No:</strong> {refund.invoiceNo}
                        </div>
                        <div>
                          <strong>Customer:</strong> {refund.customerName}
                        </div>
                        <div>
                          <strong>Phone:</strong> {refund.customerPhone}
                        </div>
                        <div>
                          <strong>Items Refunded:</strong> {refund.totalItemsRefunded}
                        </div>
                        <div>
                          <strong>Refund Amount:</strong>{' '}
                          {formatCurrency(refund.refundAmount)}
                        </div>
                        {refund.reason && (
                          <div>
                            <strong>Reason:</strong> {refund.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {historyTotalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageBtn}
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={historyPage === 1 || isLoading}
                    >
                      Previous
                    </button>
                    <span className={styles.pageInfo}>
                      Page {historyPage} of {historyTotalPages} ({historyTotal} total)
                    </span>
                    <button
                      className={styles.pageBtn}
                      onClick={() =>
                        setHistoryPage((p) => Math.min(historyTotalPages, p + 1))
                      }
                      disabled={historyPage === historyTotalPages || isLoading}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

