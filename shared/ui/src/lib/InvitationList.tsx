<<<<<<< Updated upstream
import { useState, useEffect, useCallback } from 'react';
=======
import { useState, useEffect } from 'react';
>>>>>>> Stashed changes
import { invitationsApi } from '@inventory-platform/api';
import type { Invitation } from '@inventory-platform/types';
import { InvitationCard } from './InvitationCard';
import styles from './InvitationList.module.css';

interface InvitationListProps {
  shopId?: string;
<<<<<<< Updated upstream
=======
  userId?: string;
>>>>>>> Stashed changes
  showMyInvitations?: boolean;
  showAcceptButton?: boolean;
  onInvitationChange?: () => void;
}

export function InvitationList({
  shopId,
<<<<<<< Updated upstream
=======
  userId,
>>>>>>> Stashed changes
  showMyInvitations = false,
  showAcceptButton = false,
  onInvitationChange,
}: InvitationListProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

<<<<<<< Updated upstream
  const fetchInvitations = useCallback(async () => {
=======
  const fetchInvitations = async () => {
>>>>>>> Stashed changes
    setIsLoading(true);
    setError(null);

    try {
      let data: Invitation[];

      if (showMyInvitations) {
        data = await invitationsApi.getMyInvitations();
<<<<<<< Updated upstream
      } else if (shopId) {
        data = await invitationsApi.getShopInvitations(shopId);
      } else {
        throw new Error('shopId or showMyInvitations must be provided');
=======
      } else if (userId) {
        data = await invitationsApi.getInvitationsByUser(userId);
      } else if (shopId) {
        data = await invitationsApi.getInvitationsByShop(shopId);
      } else {
        throw new Error('shopId, userId, or showMyInvitations must be provided');
>>>>>>> Stashed changes
      }

      setInvitations(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
<<<<<<< Updated upstream
  }, [shopId, showMyInvitations]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);
=======
  };

  useEffect(() => {
    fetchInvitations();
  }, [shopId, userId, showMyInvitations]);
>>>>>>> Stashed changes

  const handleInvitationAccept = async () => {
    await fetchInvitations();
    if (onInvitationChange) {
      onInvitationChange();
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading invitations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error}
          <button className={styles.retryButton} onClick={fetchInvitations}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>No invitations found</p>
        </div>
      </div>
    );
  }

  // Group invitations by status
  const pending = invitations.filter(
    (inv) => inv.status === 'PENDING' && new Date(inv.expiresAt) >= new Date()
  );
  const accepted = invitations.filter((inv) => inv.status === 'ACCEPTED');
  const expired = invitations.filter(
<<<<<<< Updated upstream
    (inv) => inv.status === 'EXPIRED' || (inv.status === 'PENDING' && new Date(inv.expiresAt) < new Date())
=======
    (inv) => inv.status === 'EXPIRED' || new Date(inv.expiresAt) < new Date()
>>>>>>> Stashed changes
  );
  const rejected = invitations.filter((inv) => inv.status === 'REJECTED');

  return (
    <div className={styles.container}>
      {pending.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Pending ({pending.length})</h3>
          <div className={styles.grid}>
            {pending.map((invitation) => (
              <InvitationCard
                key={invitation.invitationId}
                invitation={invitation}
                showAcceptButton={showAcceptButton}
                onAccept={handleInvitationAccept}
              />
            ))}
          </div>
        </div>
      )}

      {accepted.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Accepted ({accepted.length})</h3>
          <div className={styles.grid}>
            {accepted.map((invitation) => (
              <InvitationCard
                key={invitation.invitationId}
                invitation={invitation}
                showAcceptButton={false}
              />
            ))}
          </div>
        </div>
      )}

      {rejected.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Rejected ({rejected.length})</h3>
          <div className={styles.grid}>
            {rejected.map((invitation) => (
              <InvitationCard
                key={invitation.invitationId}
                invitation={invitation}
                showAcceptButton={false}
              />
            ))}
          </div>
        </div>
      )}

      {expired.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Expired ({expired.length})</h3>
          <div className={styles.grid}>
            {expired.map((invitation) => (
              <InvitationCard
                key={invitation.invitationId}
                invitation={invitation}
                showAcceptButton={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

