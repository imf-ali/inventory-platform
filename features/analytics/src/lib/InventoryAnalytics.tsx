import { useEffect, useState, useRef } from 'react';
import { useAnalyticsStore } from '@inventory-platform/store';
import type { InventoryItemAnalytics } from '@inventory-platform/types';
import styles from './analytics.module.css';

// Module-level tracking to prevent duplicate calls across StrictMode remounts
let pendingFetch: { params: string; timestamp: number } | null = null;
const FETCH_DEBOUNCE_MS = 200;

export function InventoryAnalytics() {
  const { inventoryData, isLoading, error, fetchInventory } = useAnalyticsStore();
  const prevFiltersRef = useRef<string | null>(null);
  const [localFilters, setLocalFilters] = useState<{
    startDate: string;
    endDate: string;
    includeAll: boolean;
    lowStockThreshold: number;
    deadStockDays: number;
    expiringSoonDays: number;
  }>({
    startDate: '',
    endDate: '',
    includeAll: false,
    lowStockThreshold: 10,
    deadStockDays: 60,
    expiringSoonDays: 15,
  });

  // Set default dates (30 days ago to now)
  useEffect(() => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    const formatDate = (date: Date) => {
      return date.toISOString();
    };

    setLocalFilters((prev) => ({
      ...prev,
      startDate: prev.startDate || formatDate(startDate),
      endDate: prev.endDate || formatDate(endDate),
    }));
  }, []);

  const [expandedSections, setExpandedSections] = useState<{
    lowStock: boolean;
    notSelling: boolean;
    expiringSoon: boolean;
    expired: boolean;
    deadStock: boolean;
    allItems: boolean;
  }>({
    lowStock: false,
    notSelling: false,
    expiringSoon: false,
    expired: false,
    deadStock: false,
    allItems: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    const currentFiltersKey = JSON.stringify(localFilters);
    
    // Skip if filters haven't changed (prevents duplicate calls)
    if (prevFiltersRef.current === currentFiltersKey) {
      return;
    }
    
    // Skip if there's a pending fetch with the same params (prevents StrictMode duplicate)
    const now = Date.now();
    if (
      pendingFetch &&
      pendingFetch.params === currentFiltersKey &&
      now - pendingFetch.timestamp < FETCH_DEBOUNCE_MS
    ) {
      return;
    }
    
    prevFiltersRef.current = currentFiltersKey;
    pendingFetch = { params: currentFiltersKey, timestamp: now };
    
    // Only fetch if dates are set
    if (!localFilters.startDate || !localFilters.endDate) {
      return;
    }
    
    fetchInventory({
      startDate: localFilters.startDate,
      endDate: localFilters.endDate,
      includeAll: localFilters.includeAll,
      lowStockThreshold: localFilters.lowStockThreshold,
      deadStockDays: localFilters.deadStockDays,
      expiringSoonDays: localFilters.expiringSoonDays,
    }).finally(() => {
      // Clear pending fetch after a delay to handle rapid remounts
      setTimeout(() => {
        if (pendingFetch?.params === currentFiltersKey) {
          pendingFetch = null;
        }
      }, FETCH_DEBOUNCE_MS);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilters]);

  const handleFilterChange = (key: string, value: string | number | boolean) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    if (!localFilters.startDate || !localFilters.endDate) {
      return;
    }
    fetchInventory({
      startDate: localFilters.startDate,
      endDate: localFilters.endDate,
      includeAll: localFilters.includeAll,
      lowStockThreshold: localFilters.lowStockThreshold,
      deadStockDays: localFilters.deadStockDays,
      expiringSoonDays: localFilters.expiringSoonDays,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderInventoryTable = (
    title: string,
    items: InventoryItemAnalytics[] | null | undefined,
    sectionKey: keyof typeof expandedSections,
    showAllColumns = true
  ) => {
    if (!items || items.length === 0) {
      return null;
    }

    const isExpanded = expandedSections[sectionKey];
    const itemCount = items.length;

    return (
      <div className={styles.accordionItem}>
        <button
          className={styles.accordionHeader}
          onClick={() => toggleSection(sectionKey)}
          aria-expanded={isExpanded}
        >
          <span className={styles.accordionTitle}>
            {title}
            <span className={styles.accordionCount}>({itemCount})</span>
          </span>
          <span className={`${styles.accordionIcon} ${isExpanded ? styles.accordionIconExpanded : ''}`}>
            ▼
          </span>
        </button>
        <div className={`${styles.accordionContent} ${isExpanded ? styles.accordionContentExpanded : ''}`}>
          <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Company</th>
                <th>Barcode</th>
                <th>Lot ID</th>
                <th>Location</th>
                <th>Received</th>
                <th>Sold</th>
                <th>Current</th>
                <th>Stock %</th>
                <th>Days Since Received</th>
                <th>Days Until Expiry</th>
                {showAllColumns && (
                  <>
                    <th>Cost Value</th>
                    <th>Selling Value</th>
                    <th>Potential Profit</th>
                    <th>Margin %</th>
                    <th>Turnover Ratio</th>
                    <th>Received Date</th>
                    <th>Expiry Date</th>
                    <th>Last Sold</th>
                  </>
                )}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.inventoryId}>
                  <td>{item.productName}</td>
                  <td>{item.companyName}</td>
                  <td>{item.barcode}</td>
                  <td>{item.lotId || 'N/A'}</td>
                  <td>{item.location}</td>
                  <td>{item.receivedCount}</td>
                  <td>{item.soldCount}</td>
                  <td>{item.currentCount}</td>
                  <td>{formatPercentage(item.stockPercentage)}</td>
                  <td>{item.daysSinceReceived}</td>
                  <td>
                    <span
                      className={
                        item.daysUntilExpiry < 0
                          ? styles.riskCritical
                          : item.daysUntilExpiry <= localFilters.expiringSoonDays
                          ? styles.riskHigh
                          : ''
                      }
                    >
                      {item.daysUntilExpiry}
                    </span>
                  </td>
                  {showAllColumns && (
                    <>
                      <td>{formatCurrency(item.costValue)}</td>
                      <td>{formatCurrency(item.sellingValue)}</td>
                      <td>{formatCurrency(item.potentialProfit)}</td>
                      <td>{formatPercentage(item.marginPercent)}</td>
                      <td>{item.turnoverRatio.toFixed(2)}</td>
                      <td>{formatDate(item.receivedDate)}</td>
                      <td>{formatDate(item.expiryDate)}</td>
                      <td>{item.lastSoldDate ? formatDate(item.lastSoldDate) : 'Never'}</td>
                    </>
                  )}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {item.isLowStock && (
                        <span className={styles.riskMedium}>Low Stock</span>
                      )}
                      {item.isExpired && (
                        <span className={styles.riskCritical}>Expired</span>
                      )}
                      {item.isExpiringSoon && !item.isExpired && (
                        <span className={styles.riskHigh}>Expiring Soon</span>
                      )}
                      {item.isDeadStock && (
                        <span className={styles.riskHigh}>Dead Stock</span>
                      )}
                      {!item.isLowStock && !item.isExpired && !item.isExpiringSoon && !item.isDeadStock && (
                        <span className={styles.riskLow}>Normal</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="inventoryStartDate">Start Date</label>
          <input
            id="inventoryStartDate"
            type="datetime-local"
            value={
              localFilters.startDate
                ? new Date(localFilters.startDate).toISOString().slice(0, 16)
                : ''
            }
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value).toISOString() : '';
              handleFilterChange('startDate', date);
            }}
            className={styles.input}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="inventoryEndDate">End Date</label>
          <input
            id="inventoryEndDate"
            type="datetime-local"
            value={
              localFilters.endDate
                ? new Date(localFilters.endDate).toISOString().slice(0, 16)
                : ''
            }
            onChange={(e) => {
              if (e.target.value) {
                const date = new Date(e.target.value);
                date.setHours(23, 59, 59, 999);
                handleFilterChange('endDate', date.toISOString());
              } else {
                handleFilterChange('endDate', '');
              }
            }}
            className={styles.input}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="lowStockThreshold">Low Stock Threshold (%)</label>
          <input
            id="lowStockThreshold"
            type="number"
            min="0"
            max="100"
            value={localFilters.lowStockThreshold}
            onChange={(e) => handleFilterChange('lowStockThreshold', parseInt(e.target.value, 10) || 10)}
            className={styles.input}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="deadStockDays">Dead Stock Days</label>
          <input
            id="deadStockDays"
            type="number"
            min="0"
            value={localFilters.deadStockDays}
            onChange={(e) => handleFilterChange('deadStockDays', parseInt(e.target.value, 10) || 60)}
            className={styles.input}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="expiringSoonDays">Expiring Soon Days</label>
          <input
            id="expiringSoonDays"
            type="number"
            min="0"
            value={localFilters.expiringSoonDays}
            onChange={(e) => handleFilterChange('expiringSoonDays', parseInt(e.target.value, 10) || 15)}
            className={styles.input}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="includeAllInventory">
            <input
              id="includeAllInventory"
              type="checkbox"
              checked={localFilters.includeAll}
              onChange={(e) => handleFilterChange('includeAll', e.target.checked)}
              className={styles.checkbox}
            />
            Include All Items
          </label>
        </div>

        <button onClick={handleApplyFilters} className={styles.applyButton}>
          Apply Filters
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className={styles.error}>
          <p>Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className={styles.loading}>
          <p>Loading inventory analytics data...</p>
        </div>
      )}

      {/* Inventory Analytics Content */}
      {inventoryData && !isLoading && (
        <>
          {/* Summary Cards */}
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryLabel}>Total Products</span>
              </div>
              <div className={styles.summaryValue}>{inventoryData.summary.totalProducts}</div>
              <div className={styles.summaryPeriod}>Total Items</div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryLabel}>Low Stock Products</span>
              </div>
              <div className={styles.summaryValue}>{inventoryData.summary.lowStockProducts}</div>
              <div className={styles.summaryPeriod}>Items Below Threshold</div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryLabel}>Expired Products</span>
              </div>
              <div className={styles.summaryValue}>{inventoryData.summary.expiredProducts}</div>
              <div className={styles.summaryPeriod}>Expired Items</div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryLabel}>Expiring Soon</span>
              </div>
              <div className={styles.summaryValue}>{inventoryData.summary.expiringSoonProducts}</div>
              <div className={styles.summaryPeriod}>Items Expiring Soon</div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryLabel}>Dead Stock</span>
              </div>
              <div className={styles.summaryValue}>{inventoryData.summary.deadStockProducts}</div>
              <div className={styles.summaryPeriod}>Dead Stock Items</div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryLabel}>Total Cost Value</span>
              </div>
              <div className={styles.summaryValue}>{formatCurrency(inventoryData.summary.totalCostValue)}</div>
              <div className={styles.summaryPeriod}>Inventory Cost</div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryLabel}>Total Selling Value</span>
              </div>
              <div className={styles.summaryValue}>{formatCurrency(inventoryData.summary.totalSellingValue)}</div>
              <div className={styles.summaryPeriod}>Potential Revenue</div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryLabel}>Potential Profit</span>
              </div>
              <div className={styles.summaryValue}>{formatCurrency(inventoryData.summary.totalPotentialProfit)}</div>
              <div className={styles.summaryPeriod}>Total Profit</div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryLabel}>Avg Turnover Ratio</span>
              </div>
              <div className={styles.summaryValue}>{inventoryData.summary.averageTurnoverRatio.toFixed(2)}</div>
              <div className={styles.summaryPeriod}>Average Ratio</div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryLabel}>Avg Stock %</span>
              </div>
              <div className={styles.summaryValue}>{formatPercentage(inventoryData.summary.averageStockPercentage)}</div>
              <div className={styles.summaryPeriod}>Average Percentage</div>
            </div>
          </div>

          {/* Low Stock Items Table */}
          {renderInventoryTable('Low Stock Items', inventoryData.lowStockItems, 'lowStock', true)}

          {/* Not Selling Items Table */}
          {renderInventoryTable('Not Selling Items', inventoryData.notSellingItems, 'notSelling', true)}

          {/* Expiring Soon Items Table */}
          {renderInventoryTable('Expiring Soon Items', inventoryData.expiringSoonItems, 'expiringSoon', true)}

          {/* Expired Items Table */}
          {renderInventoryTable('Expired Items', inventoryData.expiredItems, 'expired', true)}

          {/* Dead Stock Items Table */}
          {renderInventoryTable('Dead Stock Items', inventoryData.deadStockItems, 'deadStock', true)}

          {/* All Items Table */}
          {inventoryData.allItems && inventoryData.allItems.length > 0 && (
            renderInventoryTable('All Items', inventoryData.allItems, 'allItems', true)
          )}
        </>
      )}
    </div>
  );
}

