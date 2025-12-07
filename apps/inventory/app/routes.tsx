import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./routes/_index.tsx'),
  route('login', './routes/login.tsx'),
  route('signup', './routes/signup.tsx'),
  route('onboarding', './routes/onboarding.tsx'),
  route('dashboard', './routes/dashboard._layout.tsx', [
    route('', './routes/dashboard.tsx'),
    route('product-registration', './routes/dashboard.product-registration.tsx'),
    route('product-search', './routes/dashboard.product-search.tsx'),
    route('scan-sell', './routes/dashboard.scan-sell.tsx'),
    route('checkout', './routes/dashboard.checkout.tsx'),
    route('payment-billing', './routes/dashboard.payment-billing.tsx'),
    route('analytics', './routes/dashboard.analytics.tsx'),
    route('inventory-alert', './routes/dashboard.inventory-alert.tsx'),
    route('reminders', './routes/dashboard.reminders.tsx'),
    route('invitations', './routes/dashboard.invitations.tsx'),
    route('my-invitations', './routes/dashboard.my-invitations.tsx'),
    route('shop-users', './routes/dashboard.shop-users.tsx'),
  ]),
] satisfies RouteConfig;
