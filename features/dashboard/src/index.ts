// Dashboard routes
export { default as DashboardLayoutRoute } from './lib/routes/dashboard._layout';
export { default as DashboardPage } from './lib/routes/dashboard';
export { default as AnalyticsPage } from './lib/routes/dashboard.analytics';
export { default as InventoryAlertPage } from './lib/routes/dashboard.inventory-alert';
export { default as PaymentBillingPage } from './lib/routes/dashboard.payment-billing';
export { default as ProductRegistrationPage } from './lib/routes/dashboard.product-registration';
export { default as ProductSearchPage } from './lib/routes/dashboard.product-search';
export { default as RemindersPage } from './lib/routes/dashboard.reminders';
export { default as ScanSellPage } from './lib/routes/dashboard.scan-sell';

// Re-export meta functions
export { meta as dashboardMeta } from './lib/routes/dashboard';
export { meta as analyticsMeta } from './lib/routes/dashboard.analytics';
export { meta as inventoryAlertMeta } from './lib/routes/dashboard.inventory-alert';
export { meta as paymentBillingMeta } from './lib/routes/dashboard.payment-billing';
export { meta as productRegistrationMeta } from './lib/routes/dashboard.product-registration';
export { meta as productSearchMeta } from './lib/routes/dashboard.product-search';
export { meta as remindersMeta } from './lib/routes/dashboard.reminders';
export { meta as scanSellMeta } from './lib/routes/dashboard.scan-sell';

