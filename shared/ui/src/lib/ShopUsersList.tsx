import { useState, useEffect, useCallback } from 'react';
import { invitationsApi } from '@inventory-platform/api';
import type { ShopUser } from '@inventory-platform/types';
import { RoleBadge } from './RoleBadge';
import styles from './ShopUsersList.module.css';

interface ShopUsersListProps {
  shopId: string;
  onUserChange?: () => void;
}

export function ShopUsersList({ shopId, onUserChange }: ShopUsersListProps) {
  const [users, setUsers] = useState<ShopUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await invitationsApi.getShopUsers(shopId);
      setUsers(data);
      if (onUserChange) {
        onUserChange();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load shop users');
    } finally {
      setIsLoading(false);
    }
  }, [shopId, onUserChange]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error}
          <button className={styles.retryButton} onClick={fetchUsers}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>No users found for this shop</p>
        </div>
      </div>
    );
  }

  const owners = users.filter((u) => u.relationship === 'OWNER');
  const invited = users.filter((u) => u.relationship === 'INVITED');
  const active = users.filter((u) => u.active);
  const inactive = users.filter((u) => !u.active);

  return (
    <div className={styles.container}>
      {owners.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Owners ({owners.length})</h3>
          <div className={styles.grid}>
            {owners.map((user) => (
              <div key={user.userId} className={styles.card}>
                <div className={styles.header}>
                  <div className={styles.userInfo}>
                    <h4 className={styles.userName}>{user.name}</h4>
                    <span className={styles.userEmail}>{user.email}</span>
                  </div>
                  <RoleBadge role={user.role} />
                </div>
                <div className={styles.details}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>User ID:</span>
                    <span className={styles.value}>{user.userId}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Joined:</span>
                    <span className={styles.value}>
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Status:</span>
                    <span className={`${styles.status} ${user.active ? styles.statusActive : styles.statusInactive}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {invited.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Invited Users ({invited.length})</h3>
          <div className={styles.grid}>
            {invited.map((user) => (
              <div key={user.userId} className={styles.card}>
                <div className={styles.header}>
                  <div className={styles.userInfo}>
                    <h4 className={styles.userName}>{user.name}</h4>
                    <span className={styles.userEmail}>{user.email}</span>
                  </div>
                  <RoleBadge role={user.role} />
                </div>
                <div className={styles.details}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>User ID:</span>
                    <span className={styles.value}>{user.userId}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Joined:</span>
                    <span className={styles.value}>
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Status:</span>
                    <span className={`${styles.status} ${user.active ? styles.statusActive : styles.statusInactive}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active.length === 0 && inactive.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Inactive Users ({inactive.length})</h3>
          <div className={styles.grid}>
            {inactive.map((user) => (
              <div key={user.userId} className={styles.card}>
                <div className={styles.header}>
                  <div className={styles.userInfo}>
                    <h4 className={styles.userName}>{user.name}</h4>
                    <span className={styles.userEmail}>{user.email}</span>
                  </div>
                  <RoleBadge role={user.role} />
                </div>
                <div className={styles.details}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>User ID:</span>
                    <span className={styles.value}>{user.userId}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Joined:</span>
                    <span className={styles.value}>
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Status:</span>
                    <span className={`${styles.status} ${styles.statusInactive}`}>
                      Inactive
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

