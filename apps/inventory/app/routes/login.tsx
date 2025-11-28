import { Header, LoginForm } from '@inventory-platform/ui';
import styles from './login.module.css';

export function meta() {
  return [
    { title: 'Login - InventoryPro' },
    { name: 'description', content: 'Sign in to your InventoryPro account' },
  ];
}

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}

