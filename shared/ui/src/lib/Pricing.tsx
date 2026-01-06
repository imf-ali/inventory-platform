import type { Plan } from '@inventory-platform/types';
import styles from './Pricing.module.css';

export function Pricing() {
  const plans: Plan[] = [
    {
      name: 'Starter',
      description: 'Perfect for small businesses',
      price: '₹000',
      priceSuffix: '/month',
      features: [
        'Up to 1,000 products',
        'Basic analytics',
        'Email support',
        'Single user access',
        'Barcode scanning',
      ],
    },
    {
      name: 'Professional',
      label: 'Most Popular',
      description: 'For growing businesses',
      price: '₹000',
      priceSuffix: '/month',
      highlight: true,
      features: [
        'Unlimited products',
        'Advanced analytics',
        'Priority support',
        'Custom integrations',
        'Multi-location support',
        'Multi user access',
        'Team collaboration',
      ],
    },
    {
      name: 'Enterprise',
      description: 'For large organizations',
      price: 'Custom',
      priceSuffix: '',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom development',
        'SLA guarantee',
        'Advanced security',
        'On-premise deployment',
      ],
    },
  ];

  return (
    <section id="pricing" className={styles.pricing}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>Simple, Transparent Pricing</h2>
          <p className={styles.subtitle}>
            Choose the plan that fits your business needs
          </p>
        </header>

        <div className={styles.grid}>
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`${styles.card} ${
                plan.highlight ? styles.cardHighlight : ''
              }`}
            >
              {plan.label && <div className={styles.badge}>{plan.label}</div>}

              <div className={styles.cardHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planDescription}>{plan.description}</p>

                <div className={styles.priceRow}>
                  <span className={styles.price}>{plan.price}</span>
                  {plan.priceSuffix && (
                    <span className={styles.priceSuffix}>
                      {plan.priceSuffix}
                    </span>
                  )}
                </div>
              </div>

              <ul className={styles.featuresList}>
                {plan.features.map((feature) => (
                  <li key={feature} className={styles.featureItem}>
                    <span className={styles.checkIcon}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`${styles.ctaButton} ${
                  plan.highlight ? styles.ctaPrimary : styles.ctaGhost
                }`}
              >
                Get Started
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
