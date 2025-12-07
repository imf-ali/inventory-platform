import { useState, useEffect, useCallback } from 'react';
import { purchasesApi } from '@inventory-platform/api';
import type { Purchase } from '@inventory-platform/types';
import { PurchaseCard } from './PurchaseCard';
import styles from './PurchaseList.module.css';

interface PurchaseListProps {
  onPurchaseChange?: () => void;
}

export function PurchaseList({ onPurchaseChange }: PurchaseListProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await purchasesApi.getAll({
        page,
        limit,
        order: 'soldAt:desc',
      });
      setPurchases(response.purchases);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to load purchases');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading && purchases.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading purchases...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchPurchases} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {purchases.length > 0 && (
        <div className={styles.summary}>
          <p className={styles.summaryText}>
            Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total} purchases
          </p>
        </div>
      )}

      <div className={styles.list}>
        {purchases.map((purchase) => (
          <PurchaseCard key={purchase.purchaseId} purchase={purchase} />
        ))}
      </div>

      {purchases.length === 0 && !isLoading && (
        <div className={styles.emptyState}>
          <p>No purchases found.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isLoading}
          >
            Previous
          </button>
          <div className={styles.pageInfo}>
            Page {page} of {totalPages}
          </div>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || isLoading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

