import { useState } from 'react';
import { invitationsApi } from '@inventory-platform/api';
import type { Invitation } from '@inventory-platform/types';
import { RoleBadge } from './RoleBadge';
import styles from './InvitationCard.module.css';

interface InvitationCardProps {
  invitation: Invitation;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export function InvitationCard({
  invitation,
  onAccept,
  showAcceptButton = false,
}: InvitationCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (invitation.status !== 'PENDING') {
      return;
    }

    setIsAccepting(true);
    setError(null);

    try {
      await invitationsApi.acceptInvitation(invitation.invitationId);
      if (onAccept) {
        onAccept();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return styles.statusPending;
      case 'ACCEPTED':
        return styles.statusAccepted;
      case 'REJECTED':
        return styles.statusRejected;
      case 'EXPIRED':
        return styles.statusExpired;
      default:
        return styles.statusDefault;
    }
  };

  const isExpired = new Date(invitation.expiresAt) < new Date();
<<<<<<< Updated upstream
  const isPending = invitation.status === 'PENDING' && !isExpired;
=======
>>>>>>> Stashed changes

  return (
    <div className={styles.card}>
      <div className={styles.header}>
<<<<<<< Updated upstream
        <div className={styles.topRow}>
          <div className={styles.shopInfo}>
            <h3 className={styles.shopName}>{invitation.shopName}</h3>
            <span className={styles.shopId}>Shop: {invitation.shopId}</span>
          </div>
          <RoleBadge role={invitation.role} />
        </div>
        <span className={`${styles.status} ${getStatusColor(invitation.status)}`}>
          {isExpired && invitation.status === 'PENDING' ? 'EXPIRED' : invitation.status}
=======
        <div className={styles.emailRow}>
          <span className={styles.email}>{invitation.email}</span>
          <RoleBadge role={invitation.role} />
        </div>
        <span className={`${styles.status} ${getStatusColor(invitation.status)}`}>
          {isExpired ? 'EXPIRED' : invitation.status}
>>>>>>> Stashed changes
        </span>
      </div>

      <div className={styles.details}>
        <div className={styles.detailRow}>
<<<<<<< Updated upstream
          <span className={styles.label}>Invited by:</span>
          <span className={styles.value}>{invitation.inviterName || invitation.inviterUserId}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>{invitation.inviteeEmail}</span>
        </div>
        {invitation.inviteeName && (
          <div className={styles.detailRow}>
            <span className={styles.label}>Name:</span>
            <span className={styles.value}>{invitation.inviteeName}</span>
          </div>
        )}
        <div className={styles.detailRow}>
          <span className={styles.label}>Invited:</span>
          <span className={styles.value}>
            {new Date(invitation.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>Expires:</span>
          <span className={styles.value}>
            {new Date(invitation.expiresAt).toLocaleDateString()}
          </span>
        </div>
        {invitation.acceptedAt && (
          <div className={styles.detailRow}>
            <span className={styles.label}>Accepted:</span>
            <span className={styles.value}>
              {new Date(invitation.acceptedAt).toLocaleDateString()}
=======
          <span className={styles.label}>Shop ID:</span>
          <span className={styles.value}>{invitation.shopId}</span>
        </div>
        {invitation.createdAt && (
          <div className={styles.detailRow}>
            <span className={styles.label}>Invited:</span>
            <span className={styles.value}>
              {new Date(invitation.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
        {invitation.expiresAt && (
          <div className={styles.detailRow}>
            <span className={styles.label}>Expires:</span>
            <span className={styles.value}>
              {new Date(invitation.expiresAt).toLocaleDateString()}
>>>>>>> Stashed changes
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

<<<<<<< Updated upstream
      {showAcceptButton && isPending && (
=======
      {showAcceptButton && invitation.status === 'PENDING' && !isExpired && (
>>>>>>> Stashed changes
        <button
          className={styles.acceptButton}
          onClick={handleAccept}
          disabled={isAccepting}
        >
          {isAccepting ? 'Accepting...' : 'Accept Invitation'}
        </button>
      )}
    </div>
  );
}

