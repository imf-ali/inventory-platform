import { Header, Hero, Stats, Features, Pricing, CTA, Footer } from '@inventory-platform/ui';
import styles from './_index.module.css';

export function meta() {
  return [
    { title: 'InventoryPro - Complete Inventory Management Solution' },
    { name: 'description', content: 'Streamline your business operations with our comprehensive inventory management platform.' },
  ];
}

export default function Index() {
  return (
    <div className={styles.page}>
      <Header />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
