import { useState, useEffect, FormEvent } from 'react';
import { inventoryApi } from '@inventory-platform/api';
import type { InventoryItem } from '@inventory-platform/types';
import styles from './dashboard.product-search.module.css';

export function meta() {
  return [
    { title: 'Product Search - InventoryPro' },
    { name: 'description', content: 'Quickly find products with powerful search and filtering' },
  ];
}

export default function ProductSearchPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all inventory on mount
  useEffect(() => {
    fetchAllInventory();
  }, []);

  const fetchAllInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getAll();
      setInventory(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory';
      setError(errorMessage);
      setInventory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchAllInventory();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.search(searchQuery.trim());
      setInventory(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search inventory';
      setError(errorMessage);
      setInventory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchAllInventory();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Product Search</h2>
        <p className={styles.subtitle}>Search products by name, company, or barcode</p>
      </div>
      <div className={styles.searchContainer}>
        <form className={styles.searchBar} onSubmit={handleSearch}>
          <span className={styles.searchIcon} role="img" aria-label="Search">🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by product name, company, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className={styles.searchBtn} disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
          {searchQuery && (
            <button 
              type="button" 
              className={styles.clearBtn} 
              onClick={handleClearSearch}
              disabled={isLoading}
            >
              Clear
            </button>
          )}
        </form>
      </div>
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      <div className={styles.results}>
        <div className={styles.resultsHeader}>
          <span className={styles.resultsCount}>
            {isLoading 
              ? 'Loading...' 
              : `Showing ${inventory.length} ${inventory.length === 1 ? 'result' : 'results'}`}
          </span>
        </div>
        {isLoading && inventory.length === 0 ? (
          <div className={styles.loading}>Loading inventory...</div>
        ) : inventory.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No inventory items found.</p>
            {searchQuery && (
              <button onClick={handleClearSearch} className={styles.clearBtn}>
                Clear search to see all items
              </button>
            )}
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {inventory.map((item) => (
              <div key={item.lotId} className={styles.productCard}>
                <div className={styles.productImage} role="img" aria-label="Product">📦</div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>
                    {item.name || 'Unnamed Product'}
                  </h3>
                  <p className={styles.productSku}>
                    Lot ID: {item.lotId}
                  </p>
                  {item.companyName && (
                    <p className={styles.productCompany}>
                      Company: {item.companyName}
                    </p>
                  )}
                  {item.barcode && (
                    <p className={styles.productBarcode}>
                      Barcode: {item.barcode}
                    </p>
                  )}
                  {item.location && (
                    <p className={styles.productLocation}>
                      Location: {item.location}
                    </p>
                  )}
                  <div className={styles.productDetails}>
                    <div className={styles.stockInfo}>
                      <span className={styles.productStock}>
                        Current: {item.currentCount}
                      </span>
                      <span className={styles.productStock}>
                        Received: {item.receivedCount} | Sold: {item.soldCount}
                      </span>
                    </div>
                    <div className={styles.priceInfo}>
                      <span className={styles.productPrice}>
                        Selling: ${item.sellingPrice.toFixed(2)}
                      </span>
                      <span className={styles.productPrice}>
                        MRP: ${item.maximumRetailPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.expiryInfo}>
                      <span className={styles.expiryDate}>
                        Expires: {formatDate(item.expiryDate)}
                      </span>
                    </div>
                  </div>
                  {item.description && (
                    <p className={styles.productDescription}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

