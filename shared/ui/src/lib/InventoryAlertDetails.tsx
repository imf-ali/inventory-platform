import { useEffect, useState } from 'react';
import { vendorsApi } from '@inventory-platform/api';
import type { VendorResponse } from '@inventory-platform/types';
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
  const [vendor, setVendor] = useState<VendorResponse | null>(null);
  const [loadingVendor, setLoadingVendor] = useState(false);
  const [vendorError, setVendorError] = useState<string | null>(null);

  useEffect(() => {
    if (open && item) {
      const vendorId = item.vendorId;

      if (import.meta.env.DEV) {
        console.log('InventoryAlertDetails opened with item:', item);
        console.log('Vendor ID:', vendorId);
      }

      if (vendorId) {
        setLoadingVendor(true);
        setVendorError(null);

        if (import.meta.env.DEV) {
          console.log('Fetching vendor details for ID:', vendorId);
        }

        vendorsApi
          .getById(vendorId)
          .then((vendorData) => {
            if (import.meta.env.DEV) {
              console.log('Vendor details fetched:', vendorData);
            }
            setVendor(vendorData);
          })
          .catch((err) => {
            const errorMessage =
              err?.message || 'Failed to load vendor details';
            setVendorError(errorMessage);
            console.error('Error fetching vendor:', err);
          })
          .finally(() => {
            setLoadingVendor(false);
          });
      } else {
        if (import.meta.env.DEV) {
          console.log('No vendorId found in item');
        }
        setVendor(null);
        setVendorError(null);
      }
    } else {
      setVendor(null);
      setVendorError(null);
    }
  }, [open, item]);

  if (!open || !item) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.productIcon}>📦</div>
            <div>
              <h3>{item?.name ?? item?.barcode ?? 'Item Details'}</h3>
              {item?.companyName && (
                <p className={styles.headerSubtitle}>{item.companyName}</p>
              )}
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Product Information Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>📋</span>
              <h4 className={styles.sectionTitle}>Product Information</h4>
            </div>
            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <div className={styles.detailIcon}>🏷️</div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Product Name</span>
                  <span className={styles.detailValue}>
                    {item?.name ?? '—'}
                  </span>
                </div>
              </div>
              {item?.companyName && (
                <div className={styles.detailCard}>
                  <div className={styles.detailIcon}>🏢</div>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Company</span>
                    <span className={styles.detailValue}>
                      {item.companyName}
                    </span>
                  </div>
                </div>
              )}
              {item?.barcode && (
                <div className={styles.detailCard}>
                  <div className={styles.detailIcon}>🔖</div>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Barcode</span>
                    <span className={styles.detailValue}>{item.barcode}</span>
                  </div>
                </div>
              )}
              {item?.lotId && (
                <div className={styles.detailCard}>
                  <div className={styles.detailIcon}>📦</div>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Lot ID</span>
                    <span className={styles.detailValue}>{item.lotId}</span>
                  </div>
                </div>
              )}
              {item?.location && (
                <div className={styles.detailCard}>
                  <div className={styles.detailIcon}>📍</div>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Location</span>
                    <span className={styles.detailValue}>{item.location}</span>
                  </div>
                </div>
              )}
              {item?.hsn && (
                <div className={styles.detailCard}>
                  <div className={styles.detailIcon}>🔢</div>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>HSN</span>
                    <span className={styles.detailValue}>{item.hsn}</span>
                  </div>
                </div>
              )}
              {item?.sac && (
                <div className={styles.detailCard}>
                  <div className={styles.detailIcon}>🔢</div>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>SAC</span>
                    <span className={styles.detailValue}>{item.sac}</span>
                  </div>
                </div>
              )}
              {item?.batchNo && (
                <div className={styles.detailCard}>
                  <div className={styles.detailIcon}>🏭</div>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Batch No</span>
                    <span className={styles.detailValue}>{item.batchNo}</span>
                  </div>
                </div>
              )}
              {item?.scheme && (
                <div className={styles.detailCard}>
                  <div className={styles.detailIcon}>🎁</div>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Scheme</span>
                    <span className={styles.detailValue}>{item.scheme}</span>
                  </div>
                </div>
              )}
              {item?.description && (
                <div className={styles.detailCardFull}>
                  <div className={styles.detailIcon}>📝</div>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Description</span>
                    <span className={styles.detailValue}>
                      {item.description}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Information Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>💰</span>
              <h4 className={styles.sectionTitle}>Pricing</h4>
            </div>
            <div className={styles.pricingGrid}>
              <div className={`${styles.detailCard} ${styles.pricingCard}`}>
                <div className={styles.detailIcon}>💵</div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Selling Price</span>
                  <span
                    className={`${styles.detailValue} ${styles.priceValue}`}
                  >
                    ₹{item?.sellingPrice?.toFixed(2) ?? '—'}
                  </span>
                </div>
              </div>
              <div className={`${styles.detailCard} ${styles.pricingCard}`}>
                <div className={styles.detailIcon}>🏷️</div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>MRP</span>
                  <span className={`${styles.detailValue} ${styles.mrpValue}`}>
                    ₹{item?.maximumRetailPrice?.toFixed(2) ?? '—'}
                  </span>
                </div>
              </div>
              {item?.costPrice && (
                <div className={`${styles.detailCard} ${styles.pricingCard}`}>
                  <div className={styles.detailIcon}>₹</div>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Cost Price</span>
                    <span
                      className={`${styles.detailValue} ${styles.costValue}`}
                    >
                      ₹{item.costPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vendor Information Section */}
          {item?.vendorId && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>👤</span>
                <h4 className={styles.sectionTitle}>Vendor Information</h4>
              </div>
              {loadingVendor ? (
                <div className={styles.loading}>
                  <span className={styles.loadingSpinner}>⏳</span>
                  Loading vendor details...
                </div>
              ) : vendorError ? (
                <div className={styles.error}>
                  <span className={styles.errorIcon}>⚠️</span>
                  {vendorError}
                </div>
              ) : vendor ? (
                <div className={styles.detailsGrid}>
                  <div className={styles.detailCard}>
                    <div className={styles.detailIcon}>👤</div>
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Vendor Name</span>
                      <span className={styles.detailValue}>{vendor.name}</span>
                    </div>
                  </div>
                  {vendor.companyName && (
                    <div className={styles.detailCard}>
                      <div className={styles.detailIcon}>🏢</div>
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Company</span>
                        <span className={styles.detailValue}>
                          {vendor.companyName}
                        </span>
                      </div>
                    </div>
                  )}
                  {vendor.contactEmail && (
                    <div className={styles.detailCard}>
                      <div className={styles.detailIcon}>📧</div>
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Email</span>
                        <span className={styles.detailValue}>
                          <a
                            href={`mailto:${vendor.contactEmail}`}
                            className={styles.link}
                          >
                            {vendor.contactEmail}
                          </a>
                        </span>
                      </div>
                    </div>
                  )}
                  {vendor.contactPhone && (
                    <div className={styles.detailCard}>
                      <div className={styles.detailIcon}>📞</div>
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Phone</span>
                        <span className={styles.detailValue}>
                          <a
                            href={`tel:${vendor.contactPhone}`}
                            className={styles.link}
                          >
                            {vendor.contactPhone}
                          </a>
                        </span>
                      </div>
                    </div>
                  )}
                  {vendor.address && (
                    <div className={styles.detailCardFull}>
                      <div className={styles.detailIcon}>📍</div>
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Address</span>
                        <span className={styles.detailValue}>
                          {vendor.address}
                        </span>
                      </div>
                    </div>
                  )}
                  {vendor.businessType && (
                    <div className={styles.detailCard}>
                      <div className={styles.detailIcon}>🏭</div>
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>
                          Business Type
                        </span>
                        <span className={styles.detailValue}>
                          {vendor.businessType}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>ℹ️</span>
                  No vendor information available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
