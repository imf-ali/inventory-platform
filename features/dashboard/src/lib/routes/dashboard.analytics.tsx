import { InventoryPlatformAnalytics } from '@inventory-platform/analytics';

export function meta() {
  return [
    { title: 'Analytics Dashboard - StockKart' },
    {
      name: 'description',
      content: 'Comprehensive insights on sales and inventory performance',
    },
  ];
}

export const analyticsMeta = meta;

export default function AnalyticsPage() {
  return <InventoryPlatformAnalytics />;
}
