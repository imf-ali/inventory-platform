import { useState, useEffect, FormEvent } from 'react';
import { inventoryApi, cartApi } from '@inventory-platform/api';
import type { InventoryItem } from '@inventory-platform/types';
import { InventoryAlertDetails } from '@inventory-platform/ui';
import styles from './dashboard.product-search.module.css';
import { useNotify } from '@inventory-platform/store';

export function meta() {
  return [
    { title: 'Product Search - StockKart' },
    {
      name: 'description',
      content: 'Quickly find products with powerful search and filtering',
    },
  ];
}

export default function ProductSearchPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchPage, setSearchPage] = useState(0);
  const [searchPageSize, setSearchPageSize] = useState(10);
  const [searchTotalPages, setSearchTotalPages] = useState(0);
  const [searchTotalItems, setSearchTotalItems] = useState(0);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const { success: notifySuccess, error: notifyError } = useNotify;

  // Fetch all inventory on mount
  useEffect(() => {
    fetchAllInventory();
  }, []);

  const fetchAllInventory = async (page = 0, size = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getAll(page, size);
      setInventory(response.data || []);
      // Update pagination info if available
      if (response.page) {
        setSearchTotalPages(response.page.totalPages || 0);
        setSearchTotalItems(response.page.totalItems || 0);
        setSearchPage(response.page.page || 0);
      } else {
        // Reset pagination if no page info
        setSearchTotalPages(0);
        setSearchTotalItems(0);
        setSearchPage(0);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch inventory';
      notifyError(errorMessage);
      setInventory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (
    e?: FormEvent<HTMLFormElement>,
    pageNum?: number,
    pageSize?: number
  ) => {
    e?.preventDefault();

    const currentPage = pageNum !== undefined ? pageNum : 0;
    const currentPageSize = pageSize !== undefined ? pageSize : searchPageSize;

    if (pageNum === undefined && pageSize === undefined) {
      setSearchPage(0); // Reset to first page on new search
    }

    if (pageSize !== undefined) {
      setSearchPageSize(pageSize);
    }

    if (!searchQuery.trim()) {
      fetchAllInventory(currentPage, currentPageSize);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.search(
        searchQuery.trim(),
        currentPage,
        currentPageSize
      );
      setInventory(response.data || []);
      // Update pagination info
      if (response.page) {
        setSearchTotalPages(response.page.totalPages);
        setSearchTotalItems(response.page.totalItems);
        setSearchPage(response.page.page);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to search inventory';
      notifyError(errorMessage);
      setInventory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchPage(0);
    setSearchTotalPages(0);
    setSearchTotalItems(0);
    fetchAllInventory(0, searchPageSize);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleAddToSell = async (item: InventoryItem) => {
    if (item.currentCount <= 0) {
      notifyError('Product is out of stock');
      return;
    }

    if (item.priceToRetail == null) {
      notifyError('Cannot add: product price is not set');
      return;
    }

    setAddingToCart(item.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const cartPayload = {
        businessType: 'pharmacy',
        items: [
          {
            id: item.id,
            quantity: 1,
            priceToRetail: item.priceToRetail,
          },
        ],
      };

      await cartApi.add(cartPayload);
      notifySuccess(`Added "${item.name || 'Product'}" to cart successfully!`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to add item to cart';
      notifyError(errorMessage);
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Product Search</h2>
        <p className={styles.subtitle}>
          Search products by name, company, or barcode
        </p>
      </div>
      <div className={styles.searchContainer}>
        <form className={styles.searchBar} onSubmit={handleSearch}>
          <span className={styles.searchIcon} role="img" aria-label="Search">
            🔍
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by product name, company, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={styles.searchBtn}
            disabled={isLoading}
          >
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
      {error && <div className={styles.errorMessage}>{error}</div>}
      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}
      <div className={styles.results}>
        <div className={styles.resultsHeader}>
          <span className={styles.resultsCount}>
            {isLoading
              ? 'Loading...'
              : `Showing ${inventory.length} ${
                  inventory.length === 1 ? 'result' : 'results'
                }`}
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
          <>
            <div className={styles.productsGrid}>
              {inventory.map((item) => (
                <div key={item.id || item.lotId} className={styles.productCard}>
                  <div
                    className={styles.productImage}
                    role="img"
                    aria-label="Product"
                  >
                    📦
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>
                      {item.name || 'Unnamed Product'}
                    </h3>
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
                          Received: {item.receivedCount} | Sold:{' '}
                          {item.soldCount}
                        </span>
                      </div>
                      <div className={styles.priceInfo}>
                        <span className={styles.productPrice}>
                          Price to Retailer (PTR): ₹
                          {item.priceToRetail != null ? item.priceToRetail.toFixed(2) : '—'}
                        </span>
                        <span className={styles.productPrice}>
                          MRP: ₹{item.maximumRetailPrice != null ? item.maximumRetailPrice.toFixed(2) : '—'}
                        </span>
                        {item.additionalDiscount !== null &&
                          item.additionalDiscount !== undefined && (
                            <span className={styles.productPrice}>
                              Additional Discount:{' '}
                              {item.additionalDiscount.toFixed(2)}%
                            </span>
                          )}
                      </div>
                      <div className={styles.expiryInfo}>
                        <span className={styles.expiryDate}>
                          Expires: {formatDate(item.expiryDate)}
                        </span>
                      </div>
                      {(item.itemType || item.discountApplicable || item.purchaseDate || item.createdAt || item.schemeType || item.scheme != null) && (
                        <>
                          <div className={styles.productMeta}>
                            {item.itemType && item.itemType !== 'NORMAL' && (
                              <span className={styles.productMetaItem}>
                                Type:{' '}
                                {item.itemType === 'DEGREE' && item.itemTypeDegree != null
                                  ? `Temperature (${item.itemTypeDegree}°)`
                                  : item.itemType === 'COSTLY'
                                    ? 'Costly'
                                    : item.itemType}
                              </span>
                            )}
                            {item.discountApplicable && (
                              <span className={styles.productMetaItem}>
                                {item.discountApplicable === 'DISCOUNT'
                                  ? 'Discount applicable'
                                  : item.discountApplicable === 'SCHEME'
                                    ? 'Scheme applicable'
                                    : 'Both discount and scheme applicable'}
                              </span>
                            )}
                            {(item.purchaseDate || item.createdAt) && (
                              <span className={styles.productMetaItem}>
                                Purchased: {formatDate(item.purchaseDate || item.createdAt!)}
                              </span>
                            )}
                          </div>
                          {(() => {
                            const st = item.schemeType ?? 'FIXED_UNITS';
                            if (st === 'PERCENTAGE' && item.schemePercentage != null) {
                              return (
                                <div className={styles.productMetaScheme}>
                                  <span className={styles.productMetaItem}>
                                    Scheme: {item.schemePercentage}%
                                  </span>
                                </div>
                              );
                            }
                            if ((st === 'FIXED_UNITS' || !item.schemeType) && item.scheme != null && item.scheme > 0) {
                              return (
                                <div className={styles.productMetaScheme}>
                                  <span className={styles.productMetaItem}>
                                    Scheme: {item.scheme} free
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </>
                      )}
                    </div>
                    {item.description && (
                      <p className={styles.productDescription}>
                        {item.description}
                      </p>
                    )}
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.viewDetailsBtn}
                        onClick={() => setSelectedItem(item)}
                        disabled={isLoading}
                      >
                        View Details
                      </button>
                      <button
                        className={styles.addToSellBtn}
                        onClick={() => handleAddToSell(item)}
                        disabled={
                          isLoading ||
                          addingToCart === item.id ||
                          item.currentCount <= 0 ||
                          item.priceToRetail == null
                        }
                      >
                        {addingToCart === item.id
                          ? 'Adding...'
                          : item.currentCount <= 0
                          ? 'Out of Stock'
                          : item.priceToRetail == null
                          ? 'Price not set'
                          : 'Add to Sell'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {searchTotalPages > 1 && (
              <div className={styles.paginationBar}>
                <button
                  className={styles.pageBtn}
                  disabled={searchPage === 0 || isLoading}
                  onClick={() => handleSearch(undefined, searchPage - 1)}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {searchPage + 1} of {searchTotalPages} •{' '}
                  {searchTotalItems} items
                </span>
                <button
                  className={styles.pageBtn}
                  disabled={searchPage >= searchTotalPages - 1 || isLoading}
                  onClick={() => handleSearch(undefined, searchPage + 1)}
                >
                  Next
                </button>
                <select
                  className={styles.pageSizeSelect}
                  value={searchPageSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    handleSearch(undefined, 0, newSize);
                  }}
                  disabled={isLoading}
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            )}
          </>
        )}
      </div>
      <InventoryAlertDetails
        open={selectedItem !== null}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
