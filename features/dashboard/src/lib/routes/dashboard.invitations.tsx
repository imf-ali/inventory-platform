<<<<<<< Updated upstream
import { useState } from 'react';
=======
import { useState, useEffect } from 'react';
>>>>>>> Stashed changes
import { useAuthStore } from '@inventory-platform/store';
import { InviteForm, InvitationList } from '@inventory-platform/ui';
import styles from './dashboard.invitations.module.css';

export function meta() {
  return [
    { title: 'Invitations - InventoryPro' },
    { name: 'description', content: 'Manage shop invitations' },
  ];
}

export default function InvitationsPage() {
  const { user } = useAuthStore();
  const [refreshKey, setRefreshKey] = useState(0);

  const shopId = user?.shopId;

<<<<<<< Updated upstream
=======
  useEffect(() => {
    if (!shopId) {
      // User doesn't have a shop, should redirect
      // This is handled by the layout
    }
  }, [shopId]);

>>>>>>> Stashed changes
  if (!shopId) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          You need to be part of a shop to manage invitations.
        </div>
      </div>
    );
  }

  const handleInviteSent = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Invitations</h1>
        <p className={styles.subtitle}>
          Send invitations to users to join your shop and manage existing invitations
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <InviteForm shopId={shopId} onInviteSent={handleInviteSent} />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Shop Invitations</h2>
          <InvitationList key={refreshKey} shopId={shopId} />
        </div>
      </div>
    </div>
  );
}

