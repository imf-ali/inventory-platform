import styles from './InventoryAlertDetails.module.css';

export interface InventoryAlertDetailsProps {
  open: boolean;
  item: any | null;
  onClose: () => void;
}

export function InventoryAlertDetails({
  open,
  item,
  onClose,
}: InventoryAlertDetailsProps) {
  if (!open || !item) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{item?.name ?? item?.barcode ?? 'Item Details'}</h3>

          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <p>
            <strong>Product:</strong> {item?.name ?? '—'}
          </p>
          <p>
            <strong>Lot:</strong> {item?.lotId ?? '—'}
          </p>
          <p>
            <strong>Location:</strong> {item?.location ?? '—'}
          </p>
          <p>
            <strong>Current:</strong> {item?.currentCount ?? 0}
          </p>
          <p>
            <strong>Sold:</strong> {item?.soldCount ?? 0}
          </p>
          <p>
            <strong>Received:</strong> {item?.receivedCount ?? 0}
          </p>
          <p>
            <strong>Expiry:</strong>{' '}
            {item?.expiryDate
              ? new Date(item.expiryDate).toLocaleDateString()
              : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
