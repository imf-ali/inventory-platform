import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { dashboardApi } from '@inventory-platform/api';
import type { DashboardData } from '@inventory-platform/types';
import styles from './dashboard.module.css';

export function meta() {
  return [
    { title: 'Dashboard - StockKart' },
    { name: 'description', content: 'Inventory management dashboard' },
  ];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardApi.getDashboard();
        setDashboardData(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.error}>No data available</div>
      </div>
    );
  }

  const { keyMetrics, revenueBreakdown, productInsights } = dashboardData;

  return (
    <div className={styles.dashboard}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>
              {formatNumber(keyMetrics.totalProducts)}
            </div>
            <div className={styles.statLabel}>Total Products</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>
              {formatCurrency(keyMetrics.totalRevenueToday)}
            </div>
            <div className={styles.statLabel}>Revenue Today</div>
            {revenueBreakdown.percentageChangeToday !== 0 && (
              <div className={styles.statChange}>
                {revenueBreakdown.percentageChangeToday > 0 ? '↑' : '↓'}{' '}
                {Math.abs(revenueBreakdown.percentageChangeToday).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🛒</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>
              {formatNumber(keyMetrics.ordersToday)}
            </div>
            <div className={styles.statLabel}>Orders Today</div>
            <div className={styles.statSubtext}>
              Avg: {formatCurrency(keyMetrics.averageOrderValue)}
            </div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⚠️</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>
              {formatNumber(keyMetrics.lowStockItemsCount)}
            </div>
            <div className={styles.statLabel}>Low Stock Items</div>
          </div>
        </div>
      </div>
      <div className={styles.contentGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Quick Actions</h2>
          <div className={styles.quickActions}>
            <button
              className={styles.actionBtn}
              onClick={() => navigate('/dashboard/product-registration')}
            >
              <span className={styles.actionIcon}>📦</span>
              <span>Add Product</span>
            </button>
            <button
              className={styles.actionBtn}
              onClick={() => navigate('/dashboard/product-search')}
            >
              <span className={styles.actionIcon}>🔍</span>
              <span>Search Product</span>
            </button>
            <button
              className={styles.actionBtn}
              onClick={() => navigate('/dashboard/scan-sell')}
            >
              <span className={styles.actionIcon}>📱</span>
              <span>Scan & Sell</span>
            </button>
            <button
              className={styles.actionBtn}
              onClick={() => navigate('/dashboard/analytics')}
            >
              <span className={styles.actionIcon}>📊</span>
              <span>Analytics</span>
            </button>
          </div>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Product Insights</h2>
          <div className={styles.insightsGrid}>
            <div className={styles.insightItem}>
              <div className={styles.insightLabel}>Unique Products</div>
              <div className={styles.insightValue}>
                {formatNumber(productInsights.totalUniqueProducts)}
              </div>
            </div>
            <div className={styles.insightItem}>
              <div className={styles.insightLabel}>Added Today</div>
              <div className={styles.insightValue}>
                {formatNumber(productInsights.productsAddedToday)}
              </div>
            </div>
            <div className={styles.insightItem}>
              <div className={styles.insightLabel}>Added This Week</div>
              <div className={styles.insightValue}>
                {formatNumber(productInsights.productsAddedThisWeek)}
              </div>
            </div>
            <div className={styles.insightItem}>
              <div className={styles.insightLabel}>Out of Stock</div>
              <div className={styles.insightValue}>
                {formatNumber(productInsights.outOfStockItems)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.contentGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Revenue Breakdown</h2>
          <div className={styles.revenueBreakdown}>
            <div className={styles.revenueBreakdownItem}>
              <div className={styles.revenueBreakdownLabel}>
                <span>📅</span> Today
              </div>
              <div className={styles.revenueBreakdownValue}>
                {formatCurrency(revenueBreakdown.today)}
              </div>
            </div>
            <div className={styles.revenueBreakdownItem}>
              <div className={styles.revenueBreakdownLabel}>
                <span>📅</span> Yesterday
              </div>
              <div className={styles.revenueBreakdownValue}>
                {formatCurrency(revenueBreakdown.yesterday)}
              </div>
            </div>
            <div className={styles.revenueBreakdownItem}>
              <div className={styles.revenueBreakdownLabel}>
                <span>📊</span> This Week
              </div>
              <div className={styles.revenueBreakdownValue}>
                {formatCurrency(revenueBreakdown.thisWeek)}
              </div>
            </div>
            <div className={styles.revenueBreakdownItem}>
              <div className={styles.revenueBreakdownLabel}>
                <span>📈</span> This Month
              </div>
              <div className={styles.revenueBreakdownValue}>
                {formatCurrency(revenueBreakdown.thisMonth)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
