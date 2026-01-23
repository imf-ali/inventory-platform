import { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router';
import { inventoryApi, vendorsApi } from '@inventory-platform/api';
import type {
  CreateInventoryDto,
  CustomReminderInput,
  Vendor,
  CreateVendorDto,
  VendorBusinessType,
  BulkCreateInventoryDto,
  ParseInvoiceItem,
} from '@inventory-platform/types';
import { CustomRemindersSection } from '@inventory-platform/ui';
import { useNotify } from '@inventory-platform/store';
import styles from './dashboard.product-registration.module.css';

export function meta() {
  return [
    { title: 'Product Registration - StockKart' },
    {
      name: 'description',
      content: 'Register and manage your product inventory',
    },
  ];
}

interface ProductFormData
  extends Omit<CreateInventoryDto, 'vendorId' | 'lotId'> {
  id: string; // Unique ID for each product form
  isExpanded: boolean;
  sgst?: string;
  cgst?: string;
  additionalDiscount?: number | null;
  sellingPrice: string;
  costPrice: string;
  maximumRetailPrice: string;
}

export default function ProductRegistrationPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Shared vendor and lot ID (applied to all products)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [vendorSearchResults, setVendorSearchResults] = useState<Vendor[]>([]);
  const [isSearchingVendor, setIsSearchingVendor] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [isCreatingVendor, setIsCreatingVendor] = useState(false);
  const [vendorFormData, setVendorFormData] = useState<CreateVendorDto>({
    name: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    businessType: 'WHOLESALE',
  });
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [showCustomBusinessType, setShowCustomBusinessType] = useState(false);

  const [lotId, setLotId] = useState('');
  const [lotIdSearchQuery, setLotIdSearchQuery] = useState('');
  const [lotIdSearchResults, setLotIdSearchResults] = useState<
    { lotId: string; createdAt: string }[]
  >([]);
  const [isSearchingLots, setIsSearchingLots] = useState(false);
  const [showLotIdDropdown, setShowLotIdDropdown] = useState(false);

  // Multiple products state
  const [products, setProducts] = useState<ProductFormData[]>([]);

  // Image upload state
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createEmptyProduct = (): ProductFormData => ({
    id: `product-${Date.now()}-${Math.random()}`,
    isExpanded: true,
    barcode: '',
    name: '',
    companyName: '',
    price: '',
    maximumRetailPrice: '',
    costPrice: '',
    sellingPrice: '',
    businessType: 'pharmacy',
    location: '',
    count: 0,
    expiryDate: '',
    description: '',
    reminderAt: undefined,
    customReminders: [],
    hsn: '',
    batchNo: '',
    scheme: '',
    sgst: '',
    cgst: '',
    additionalDiscount: null,
  });

  const handleAddProduct = () => {
    setProducts([...products, createEmptyProduct()]);
    setError(null);
  };

  const transformParsedItemToProduct = (
    item: ParseInvoiceItem
  ): ProductFormData => {
    // Transform customReminders from API format to form format
    const customReminders: CustomReminderInput[] =
      item.customReminders && item.customReminders.length > 0
        ? item.customReminders
            .filter((reminder) => reminder && reminder.reminderAt)
            .map((reminder) => ({
              reminderAt: reminder.reminderAt || '',
              endDate: reminder.endDate || '',
              notes: reminder.notes || '',
            }))
        : [];

    return {
      id: `product-${Date.now()}-${Math.random()}`,
      isExpanded: true,
      barcode: item.barcode || '',
      name: item.name || '',
      companyName: item.companyName || '',
      price: item.sellingPrice || '',
      maximumRetailPrice: item.maximumRetailPrice || '',
      costPrice: item.costPrice || '',
      sellingPrice: item.sellingPrice || '',
      businessType: item.businessType?.toLowerCase() || 'pharmacy',
      location: item.location || '',
      count: item.count || 0,
      expiryDate: item.expiryDate || '',
      description: item.description || '',
      reminderAt: item.reminderAt || undefined,
      customReminders,
      hsn: item.hsn || '',
      batchNo: item.batchNo || '',
      scheme: item.scheme || '',
      sgst: item.sgst || '',
      cgst: item.cgst || '',
      additionalDiscount: item.additionalDiscount ?? null,
    };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        useNotify.error('Please select an image file');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        useNotify.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUploadInvoice = async () => {
    if (!selectedFile) {
      useNotify.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await inventoryApi.parseInvoice(selectedFile);

      if (response && response.items && response.items.length > 0) {
        // Transform parsed items to product form data
        const parsedProducts = response.items.map(transformParsedItemToProduct);
        setProducts(parsedProducts);
        useNotify.success(
          `Successfully parsed invoice! Found ${response.totalItems} item(s). Please review and fill in any missing information.`
        );
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        useNotify.error(
          'No items found in the invoice image. Please try a different image.'
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to parse invoice. Please try again.';
      useNotify.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearUpload = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  };

  const handleRemoveProduct = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId));
  };

  const handleToggleProduct = (productId: string) => {
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, isExpanded: !p.isExpanded } : p
      )
    );
  };

  const handleProductChange = (
    productId: string,
    field: keyof ProductFormData,
    value: any
  ) => {
    setProducts(
      products.map((p) => (p.id === productId ? { ...p, [field]: value } : p))
    );
    setError(null);
    setSuccess(null);
  };

  const handleIntegerChange = (
    productId: string,
    field: string,
    value: string
  ) => {
    if (value === '') {
      handleProductChange(productId, field as keyof ProductFormData, 0);
      return;
    }
    if (!/^\d+$/.test(value)) return;
    handleProductChange(
      productId,
      field as keyof ProductFormData,
      parseInt(value, 10)
    );
  };

  const handleDecimalChange = (
    productId: string,
    field: string,
    value: string
  ) => {
    if (value === '') {
      handleProductChange(productId, field as keyof ProductFormData, 0);
      return;
    }
    if (!/^\d*\.?\d*$/.test(value)) return;
    handleProductChange(
      productId,
      field as keyof ProductFormData,
      parseFloat(value) || 0
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validate vendor is selected
      if (!selectedVendor || !selectedVendor.vendorId) {
        setError(
          'Vendor information is required. Please search and select a vendor.'
        );
        setIsLoading(false);
        return;
      }

      // Validate at least one product exists
      if (products.length === 0) {
        setError('Please add at least one product to register.');
        setIsLoading(false);
        return;
      }

      // Validate all products
      for (const product of products) {
        if (
          !product.barcode ||
          !product.name ||
          !product.companyName ||
          !product.location ||
          !product.expiryDate
        ) {
          useNotify.error(
            `Product "${product.name || 'Unnamed'}" is missing required fields`
          );
          setIsLoading(false);
          return;
        }

        if (product.count <= 0) {
          useNotify.error(
            `Product "${
              product.name || 'Unnamed'
            }" count must be greater than 0`
          );
          setIsLoading(false);
          return;
        }
      }

      // Transform products to bulk API format
      const items = products.map((product) => {
        // Format reminderAt if provided
        let reminderAtISO: string | undefined;
        if (product.reminderAt) {
          if (product.reminderAt.includes('T')) {
            reminderAtISO = new Date(product.reminderAt).toISOString();
          } else {
            reminderAtISO = new Date(product.reminderAt).toISOString();
          }
        }

        // Transform customReminders to the format expected by bulk API
        const customReminders =
          product.customReminders && product.customReminders.length > 0
            ? product.customReminders.map((reminder) => {
                // Calculate daysBefore from reminderAt and expiryDate
                let daysBefore = 30; // default
                if (reminder.reminderAt && product.expiryDate) {
                  const reminderDate = new Date(reminder.reminderAt);
                  const expiryDate = new Date(product.expiryDate);
                  const diffTime =
                    expiryDate.getTime() - reminderDate.getTime();
                  daysBefore = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                } else if (reminder.endDate && product.expiryDate) {
                  // Fallback: calculate from endDate if reminderAt is not available
                  const endDate = new Date(reminder.endDate);
                  const expiryDate = new Date(product.expiryDate);
                  const diffTime = expiryDate.getTime() - endDate.getTime();
                  daysBefore = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }

                return {
                  daysBefore: daysBefore > 0 ? daysBefore : 30,
                  message: reminder.notes || 'Expiry reminder',
                };
              })
            : null;

        return {
          barcode: product.barcode,
          name: product.name,
          description: product.description || undefined,
          companyName: product.companyName,
          sellingPrice: parseFloat(product.sellingPrice),
          costPrice: parseFloat(product.costPrice),
          maximumRetailPrice: parseFloat(product.maximumRetailPrice),
          businessType: product.businessType.toUpperCase(),
          location: product.location,
          count: product.count,
          expiryDate: product.expiryDate,
          reminderAt: reminderAtISO,
          customReminders: customReminders,
          hsn: product.hsn || null,
          batchNo: product.batchNo || null,
          scheme: product.scheme || null,
          ...(product.sgst && product.sgst.trim()
            ? { sgst: product.sgst.trim() }
            : {}),
          ...(product.cgst && product.cgst.trim()
            ? { cgst: product.cgst.trim() }
            : {}),
          ...(product.additionalDiscount !== null &&
          product.additionalDiscount !== undefined
            ? { additionalDiscount: product.additionalDiscount }
            : {}),
        };
      });

      // Create bulk request
      const bulkData: BulkCreateInventoryDto = {
        vendorId: selectedVendor.vendorId,
        ...(lotId && { lotId }),
        items,
      };

      // Call bulk API
      try {
        const response = await inventoryApi.createBulk(bulkData);

        // The response should be BulkCreateInventoryResponse
        // Handle cases where the response structure might vary
        const createdCount =
          response?.createdCount ?? response?.items?.length ?? 0;
        const lotId = response?.lotId;
        const items = response?.items ?? [];

        // If we have items or a positive createdCount, consider it successful
        if (createdCount > 0 || items.length > 0) {
          const itemDetails =
            items.length > 0
              ? items
                  .map(
                    (item, index) =>
                      `${products[index]?.name || 'Product'}: ${
                        item.id || 'Created'
                      }`
                  )
                  .join('; ')
              : '';
          useNotify.success(
            `Successfully registered ${
              createdCount || items.length
            } product(s)! ${lotId ? `Lot ID: ${lotId}. ` : ''}${
              itemDetails ? `Details: ${itemDetails}` : ''
            }`
          );

          // Clear form after 5 seconds
          setTimeout(() => {
            setProducts([]);
            handleClearVendor();
            setLotId('');
            setLotIdSearchQuery('');
            setLotIdSearchResults([]);
            setSuccess(null);
          }, 5000);
        } else if (response) {
          // If response exists but no createdCount/items, still consider it success
          // (API might return success without detailed counts)
          useNotify.success(
            `Successfully registered ${products.length} product(s)! ${
              lotId ? `Lot ID: ${lotId}. ` : ''
            }`
          );
          setTimeout(() => {
            setProducts([]);
            handleClearVendor();
            setLotId('');
            setLotIdSearchQuery('');
            setLotIdSearchResults([]);
            setSuccess(null);
          }, 5000);
        } else {
          useNotify.error(
            'Failed to register products. No items were created.'
          );
        }
      } catch (bulkError) {
        const errorMessage =
          bulkError instanceof Error
            ? bulkError.message
            : 'Failed to register products. Please try again.';
        useNotify.error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to register products. Please try again.';
      useNotify.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleVendorSearch = async () => {
    if (!vendorSearchQuery.trim()) {
      useNotify.error('Please enter a search query');
      return;
    }

    setIsSearchingVendor(true);
    setError(null);
    try {
      const vendors = await vendorsApi.search(vendorSearchQuery.trim());
      setVendorSearchResults(vendors || []);
      setShowVendorDropdown(true);
      if (vendors.length === 1) {
        handleSelectVendor(vendors[0]);
      } else {
        setSelectedVendor(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to search vendor';
      useNotify.error(errorMessage);
      setVendorSearchResults([]);
      setSelectedVendor(null);
    } finally {
      setIsSearchingVendor(false);
    }
  };

  const handleSelectVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setVendorSearchQuery(vendor.name);
    setShowVendorDropdown(false);
    setVendorSearchResults([]);
  };

  const handleCloseVendorModal = () => {
    setShowVendorModal(false);
    setShowCustomBusinessType(false);
    setCustomBusinessType('');
    setVendorFormData({
      name: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      businessType: 'WHOLESALE',
    });
  };

  const handleCreateVendor = async () => {
    setIsCreatingVendor(true);
    setError(null);
    try {
      if (!vendorFormData.name || !vendorFormData.contactPhone) {
        setError('Please fill in all required vendor fields (Name and Phone)');
        setIsCreatingVendor(false);
        return;
      }

      if (showCustomBusinessType && !customBusinessType.trim()) {
        useNotify.error('Please enter a custom business type');
        setIsCreatingVendor(false);
        return;
      }

      const vendorPayload: CreateVendorDto = {
        name: vendorFormData.name,
        contactPhone: vendorFormData.contactPhone,
        businessType: showCustomBusinessType
          ? (customBusinessType.trim().toUpperCase() as VendorBusinessType)
          : vendorFormData.businessType,
        ...(vendorFormData.contactEmail && {
          contactEmail: vendorFormData.contactEmail,
        }),
        ...(vendorFormData.address && { address: vendorFormData.address }),
      };
      const vendor = await vendorsApi.create(vendorPayload);
      setSelectedVendor(vendor);
      setVendorSearchQuery(vendor.contactPhone);
      handleCloseVendorModal();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create vendor';
      useNotify.error(errorMessage);
    } finally {
      setIsCreatingVendor(false);
    }
  };

  const handleClearVendor = () => {
    setSelectedVendor(null);
    setVendorSearchQuery('');
    setVendorSearchResults([]);
    setShowVendorDropdown(false);
    setVendorFormData({
      name: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      businessType: 'WHOLESALE',
    });
    setShowCustomBusinessType(false);
    setCustomBusinessType('');
  };

  const handleLotIdSearch = async () => {
    if (!lotIdSearchQuery.trim()) {
      return;
    }

    setIsSearchingLots(true);
    setError(null);
    try {
      const response = await inventoryApi.searchLots(lotIdSearchQuery.trim());
      const lots = response.data || [];
      setLotIdSearchResults(
        lots.map((lot) => ({ lotId: lot.lotId, createdAt: lot.createdAt }))
      );
      setShowLotIdDropdown(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to search lots';
      useNotify.error(errorMessage);
      setLotIdSearchResults([]);
    } finally {
      setIsSearchingLots(false);
    }
  };

  const handleSelectLotId = (selectedLotId: string) => {
    setLotId(selectedLotId);
    setLotIdSearchQuery(selectedLotId);
    setShowLotIdDropdown(false);
    setLotIdSearchResults([]);
  };

  // Convert ISO (UTC) → datetime-local (local time)
  const isoToLocalDateTime = (iso: string) => {
    const date = new Date(iso);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // Convert datetime-local → ISO (UTC)
  const localDateTimeToIso = (local: string) => {
    return new Date(local).toISOString();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Product Registration</h2>
        <p className={styles.subtitle}>
          Register multiple products at once with shared vendor and lot
          information
        </p>
      </div>
      <div className={styles.formContainer}>
        {/* {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>} */}

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Shared Vendor and Lot ID Section */}
          <div className={styles.sharedSection}>
            <h3 className={styles.sectionTitle}>Shared Information</h3>

            {/* Lot ID */}
            <div className={styles.formGroup}>
              <label htmlFor="lotId" className={styles.label}>
                Lot ID (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    id="lotId"
                    className={styles.input}
                    placeholder="Enter or search lot ID"
                    value={lotIdSearchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setLotIdSearchQuery(e.target.value);
                      setLotId(e.target.value);
                      setShowLotIdDropdown(false);
                    }}
                    disabled={isLoading || isSearchingLots}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className={styles.searchBtn}
                    onClick={handleLotIdSearch}
                    disabled={
                      isLoading || isSearchingLots || !lotIdSearchQuery.trim()
                    }
                  >
                    {isSearchingLots ? 'Searching...' : 'Search'}
                  </button>
                </div>
                {showLotIdDropdown && lotIdSearchResults.length > 0 && (
                  <div className={styles.dropdown}>
                    {lotIdSearchResults.map((lot) => {
                      const formatDate = (dateString: string) => {
                        try {
                          const date = new Date(dateString);
                          return date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                        } catch {
                          return dateString;
                        }
                      };
                      return (
                        <div
                          key={lot.lotId}
                          className={styles.dropdownItem}
                          onClick={() => handleSelectLotId(lot.lotId)}
                        >
                          <div style={{ fontWeight: 500 }}>{lot.lotId}</div>
                          <div
                            style={{
                              fontSize: '0.85rem',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {formatDate(lot.createdAt)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Vendor Section */}
            <div className={styles.vendorSection}>
              <h4 className={styles.subsectionTitle}>Vendor Information *</h4>
              <div className={styles.formGroup}>
                <label htmlFor="vendorSearch" className={styles.label}>
                  Vendor Search *
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      id="vendorSearch"
                      className={styles.input}
                      placeholder="Search by name, phone, email, or any keyword"
                      value={vendorSearchQuery}
                      onChange={(e) => {
                        setVendorSearchQuery(e.target.value);
                        setSelectedVendor(null);
                        setShowVendorDropdown(false);
                      }}
                      disabled={isLoading || isSearchingVendor}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className={styles.searchBtn}
                      onClick={handleVendorSearch}
                      disabled={
                        isLoading ||
                        isSearchingVendor ||
                        !vendorSearchQuery.trim()
                      }
                    >
                      {isSearchingVendor ? 'Searching...' : 'Search'}
                    </button>
                    <button
                      type="button"
                      className={styles.createVendorBtn}
                      onClick={() => setShowVendorModal(true)}
                      disabled={isLoading || isCreatingVendor}
                    >
                      Create New
                    </button>
                    {selectedVendor && (
                      <button
                        type="button"
                        className={styles.clearBtn}
                        onClick={handleClearVendor}
                        disabled={isLoading}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {showVendorDropdown && vendorSearchResults.length > 0 && (
                    <div className={styles.dropdown}>
                      {vendorSearchResults.map((vendor) => (
                        <div
                          key={vendor.vendorId}
                          className={styles.dropdownItem}
                          onClick={() => handleSelectVendor(vendor)}
                        >
                          <div style={{ fontWeight: 500 }}>{vendor.name}</div>
                          {vendor.contactPhone && (
                            <div
                              style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {vendor.contactPhone}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {showVendorDropdown &&
                    vendorSearchResults.length === 0 &&
                    !isSearchingVendor && (
                      <div className={styles.vendorNotFound}>
                        <p>
                          No vendors found. Would you like to create a new
                          vendor?
                        </p>
                        <button
                          type="button"
                          className={styles.createVendorBtn}
                          onClick={() => {
                            setShowVendorModal(true);
                            setShowVendorDropdown(false);
                          }}
                          disabled={isLoading}
                        >
                          Create New Vendor
                        </button>
                      </div>
                    )}
                </div>
              </div>
              {selectedVendor && (
                <div className={styles.vendorInfo}>
                  <div className={styles.vendorCard}>
                    <h4>{selectedVendor.name}</h4>
                    <p>
                      <strong>Phone:</strong> {selectedVendor.contactPhone}
                    </p>
                    {selectedVendor.contactEmail && (
                      <p>
                        <strong>Email:</strong> {selectedVendor.contactEmail}
                      </p>
                    )}
                    {selectedVendor.address && (
                      <p>
                        <strong>Address:</strong> {selectedVendor.address}
                      </p>
                    )}
                    <p>
                      <strong>Business Type:</strong>{' '}
                      {selectedVendor.businessType}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Upload Section */}
          <div className={styles.uploadSection}>
            <h3 className={styles.sectionTitle}>
              Upload Invoice Image (Optional)
            </h3>
            <p className={styles.helperText}>
              Upload an invoice image to automatically parse and prefill product
              information. You can also manually add products below.
            </p>
            <div className={styles.uploadContainer}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className={styles.fileInput}
                id="invoice-upload"
                disabled={isUploading || isLoading}
              />
              <div className={styles.uploadControls}>
                <label
                  htmlFor="invoice-upload"
                  className={styles.fileInputLabel}
                >
                  {selectedFile ? selectedFile.name : 'Choose Image File'}
                </label>
                {selectedFile && (
                  <div className={styles.uploadActions}>
                    <button
                      type="button"
                      className={styles.uploadBtn}
                      onClick={handleUploadInvoice}
                      disabled={isUploading || isLoading}
                    >
                      {isUploading ? 'Parsing...' : 'Parse Invoice'}
                    </button>
                    <button
                      type="button"
                      className={styles.clearUploadBtn}
                      onClick={handleClearUpload}
                      disabled={isUploading || isLoading}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className={styles.productsSection}>
            <div className={styles.productsHeader}>
              <h3 className={styles.sectionTitle}>Products</h3>
              <button
                type="button"
                className={styles.addProductBtn}
                onClick={handleAddProduct}
                disabled={isLoading}
              >
                + Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className={styles.emptyState}>
                <p>
                  No products added yet. Click "Add Product" to get started.
                </p>
              </div>
            ) : (
              <div className={styles.productsList}>
                {products.map((product, index) => (
                  <ProductAccordion
                    key={product.id}
                    product={product}
                    index={index}
                    onToggle={() => handleToggleProduct(product.id)}
                    onRemove={() => handleRemoveProduct(product.id)}
                    onChange={handleProductChange}
                    onIntegerChange={handleIntegerChange}
                    onDecimalChange={handleDecimalChange}
                    onCustomRemindersChange={(reminders) =>
                      handleProductChange(
                        product.id,
                        'customReminders',
                        reminders
                      )
                    }
                    isLoading={isLoading}
                    isoToLocalDateTime={isoToLocalDateTime}
                    localDateTimeToIso={localDateTimeToIso}
                  />
                ))}
              </div>
            )}
          </div>

          {products.length > 0 && (
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isLoading}
              >
                {isLoading
                  ? `Registering ${products.length} Product(s)...`
                  : `Register ${products.length} Product(s)`}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Vendor Creation Modal */}
      {showVendorModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => !isCreatingVendor && handleCloseVendorModal()}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Create New Vendor</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={handleCloseVendorModal}
                disabled={isCreatingVendor}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label htmlFor="vendorName" className={styles.label}>
                  Vendor Name *
                </label>
                <input
                  type="text"
                  id="vendorName"
                  className={styles.input}
                  placeholder="Enter vendor name"
                  value={vendorFormData.name}
                  onChange={(e) =>
                    setVendorFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  disabled={isCreatingVendor}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="vendorContactPhone" className={styles.label}>
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  id="vendorContactPhone"
                  className={styles.input}
                  placeholder="Enter contact phone"
                  value={vendorFormData.contactPhone}
                  onChange={(e) =>
                    setVendorFormData((prev) => ({
                      ...prev,
                      contactPhone: e.target.value,
                    }))
                  }
                  disabled={isCreatingVendor}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="vendorContactEmail" className={styles.label}>
                  Contact Email
                </label>
                <input
                  type="email"
                  id="vendorContactEmail"
                  className={styles.input}
                  placeholder="Enter contact email"
                  value={vendorFormData.contactEmail}
                  onChange={(e) =>
                    setVendorFormData((prev) => ({
                      ...prev,
                      contactEmail: e.target.value,
                    }))
                  }
                  disabled={isCreatingVendor}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="vendorAddress" className={styles.label}>
                  Address
                </label>
                <input
                  type="text"
                  id="vendorAddress"
                  className={styles.input}
                  placeholder="Enter address"
                  value={vendorFormData.address}
                  onChange={(e) =>
                    setVendorFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  disabled={isCreatingVendor}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="vendorBusinessType" className={styles.label}>
                  Business Type *
                </label>
                <select
                  id="vendorBusinessType"
                  className={styles.input}
                  value={
                    showCustomBusinessType
                      ? 'OTHER'
                      : vendorFormData.businessType
                  }
                  onChange={(e) => {
                    if (e.target.value === 'OTHER') {
                      setShowCustomBusinessType(true);
                      setCustomBusinessType('');
                    } else {
                      setShowCustomBusinessType(false);
                      setCustomBusinessType('');
                      setVendorFormData((prev) => ({
                        ...prev,
                        businessType: e.target.value as VendorBusinessType,
                      }));
                    }
                  }}
                  disabled={isCreatingVendor}
                  required
                >
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="RETAIL">Retail</option>
                  <option value="MANUFACTURER">Manufacturer</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                  <option value="C&F">C&F</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              {showCustomBusinessType && (
                <div className={styles.formGroup}>
                  <label htmlFor="customBusinessType" className={styles.label}>
                    Custom Business Type *
                  </label>
                  <input
                    type="text"
                    id="customBusinessType"
                    className={styles.input}
                    placeholder="Enter custom business type"
                    value={customBusinessType}
                    onChange={(e) => setCustomBusinessType(e.target.value)}
                    disabled={isCreatingVendor}
                    required
                  />
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCloseVendorModal}
                disabled={isCreatingVendor}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleCreateVendor}
                disabled={isCreatingVendor}
              >
                {isCreatingVendor ? 'Creating...' : 'Create Vendor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Product Accordion Component
interface ProductAccordionProps {
  product: ProductFormData;
  index: number;
  onToggle: () => void;
  onRemove: () => void;
  onChange: (
    productId: string,
    field: keyof ProductFormData,
    value: any
  ) => void;
  onIntegerChange: (productId: string, field: string, value: string) => void;
  onDecimalChange: (productId: string, field: string, value: string) => void;
  onCustomRemindersChange: (reminders: CustomReminderInput[]) => void;
  isLoading: boolean;
  isoToLocalDateTime: (iso: string) => string;
  localDateTimeToIso: (local: string) => string;
}

function ProductAccordion({
  product,
  index,
  onToggle,
  onRemove,
  onChange,
  onIntegerChange,
  onDecimalChange,
  onCustomRemindersChange,
  isLoading,
  isoToLocalDateTime,
  localDateTimeToIso,
}: ProductAccordionProps) {
  const productTitle = product.name || `Product ${index + 1}`;

  return (
    <div className={styles.productAccordion}>
      <div className={styles.accordionHeader} onClick={onToggle}>
        <div className={styles.accordionTitle}>
          <span className={styles.accordionIcon}>
            {product.isExpanded ? '▼' : '▶'}
          </span>
          <span>{productTitle}</span>
          {product.barcode && (
            <span className={styles.accordionSubtitle}>
              (Barcode: {product.barcode})
            </span>
          )}
        </div>
        <button
          type="button"
          className={styles.removeProductBtn}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          disabled={isLoading}
          aria-label="Remove product"
        >
          ×
        </button>
      </div>

      {product.isExpanded && (
        <div className={styles.accordionContent}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor={`barcode-${product.id}`} className={styles.label}>
                Barcode *
              </label>
              <input
                type="text"
                id={`barcode-${product.id}`}
                className={styles.input}
                placeholder="Enter barcode"
                value={product.barcode}
                onChange={(e) =>
                  onChange(product.id, 'barcode', e.target.value)
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label
                htmlFor={`companyName-${product.id}`}
                className={styles.label}
              >
                Company *
              </label>
              <input
                type="text"
                id={`companyName-${product.id}`}
                className={styles.input}
                placeholder="Enter company name"
                value={product.companyName}
                onChange={(e) =>
                  onChange(product.id, 'companyName', e.target.value)
                }
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor={`name-${product.id}`} className={styles.label}>
                Product Name *
              </label>
              <input
                type="text"
                id={`name-${product.id}`}
                className={styles.input}
                placeholder="Enter product name"
                value={product.name}
                onChange={(e) => onChange(product.id, 'name', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor={`count-${product.id}`} className={styles.label}>
                Count *
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id={`count-${product.id}`}
                className={styles.input}
                placeholder="0"
                value={product.count === 0 ? '' : product.count}
                onChange={(e) =>
                  onIntegerChange(product.id, 'count', e.target.value)
                }
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label
                htmlFor={`expiryDate-${product.id}`}
                className={styles.label}
              >
                Expiry Date *
              </label>
              <input
                type="date"
                id={`expiryDate-${product.id}`}
                className={styles.input}
                value={
                  product.expiryDate
                    ? new Date(product.expiryDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => {
                  const dateValue = e.target.value;
                  if (dateValue) {
                    const isoDate = `${dateValue}T00:00:00Z`;
                    onChange(product.id, 'expiryDate', isoDate);
                  } else {
                    onChange(product.id, 'expiryDate', '');
                  }
                }}
                required
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label
                htmlFor={`location-${product.id}`}
                className={styles.label}
              >
                Inventory Location *
              </label>
              <input
                type="text"
                id={`location-${product.id}`}
                className={styles.input}
                placeholder="Enter inventory location"
                value={product.location}
                onChange={(e) =>
                  onChange(product.id, 'location', e.target.value)
                }
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Additional Product Information */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor={`hsn-${product.id}`} className={styles.label}>
                HSN Code
              </label>
              <input
                type="text"
                id={`hsn-${product.id}`}
                className={styles.input}
                placeholder="Enter the HSN code"
                value={product.hsn || ''}
                onChange={(e) => onChange(product.id, 'hsn', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor={`batchNo-${product.id}`} className={styles.label}>
                Batch Number
              </label>
              <input
                type="text"
                id={`batchNo-${product.id}`}
                className={styles.input}
                placeholder="Enter the batch number"
                value={product.batchNo || ''}
                onChange={(e) =>
                  onChange(product.id, 'batchNo', e.target.value)
                }
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor={`scheme-${product.id}`} className={styles.label}>
                Scheme/Promotion
              </label>
              <input
                type="text"
                id={`scheme-${product.id}`}
                className={styles.input}
                placeholder="Enter the scheme/promotion"
                value={product.scheme || ''}
                onChange={(e) => onChange(product.id, 'scheme', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label
                htmlFor={`additionalDiscount-${product.id}`}
                className={styles.label}
              >
                Additional Discount (%)
              </label>
              <input
                type="number"
                id={`additionalDiscount-${product.id}`}
                className={styles.input}
                placeholder="Enter discount percentage"
                step="0.01"
                min="0"
                max="100"
                value={
                  product.additionalDiscount === null ||
                  product.additionalDiscount === undefined
                    ? ''
                    : product.additionalDiscount
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    onChange(product.id, 'additionalDiscount', null);
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                      onChange(product.id, 'additionalDiscount', numValue);
                    }
                  }
                }}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label
                htmlFor={`sellingPrice-${product.id}`}
                className={styles.label}
              >
                Price to Retailer (PTR) *
              </label>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                id={`sellingPrice-${product.id}`}
                className={styles.input}
                placeholder="0.00"
                value={product.sellingPrice ?? ''}
                onChange={(e) =>
                  onChange(product.id, 'sellingPrice', e.target.value)
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label
                htmlFor={`costPrice-${product.id}`}
                className={styles.label}
              >
                Price from stockist (PTS) *
              </label>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                id={`costPrice-${product.id}`}
                className={styles.input}
                placeholder="0.00"
                value={product.costPrice ?? ''}
                onChange={(e) =>
                  onChange(product.id, 'costPrice', e.target.value)
                }
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label
                htmlFor={`maximumRetailPrice-${product.id}`}
                className={styles.label}
              >
                MRP *
              </label>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                id={`maximumRetailPrice-${product.id}`}
                className={styles.input}
                placeholder="0.00"
                value={product.maximumRetailPrice ?? ''}
                onChange={(e) =>
                  onChange(product.id, 'maximumRetailPrice', e.target.value)
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor={`cgst-${product.id}`} className={styles.label}>
                CGST (%)
              </label>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                id={`cgst-${product.id}`}
                className={styles.input}
                placeholder="Leave empty for shop default"
                value={product.cgst || ''}
                onChange={(e) => onChange(product.id, 'cgst', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor={`sgst-${product.id}`} className={styles.label}>
                SGST (%)
              </label>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                id={`sgst-${product.id}`}
                className={styles.input}
                placeholder="Leave empty for shop default"
                value={product.sgst || ''}
                onChange={(e) => onChange(product.id, 'sgst', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label
              htmlFor={`description-${product.id}`}
              className={styles.label}
            >
              Description
            </label>
            <textarea
              id={`description-${product.id}`}
              className={styles.textarea}
              placeholder="Enter product description (optional)"
              value={product.description || ''}
              onChange={(e) =>
                onChange(product.id, 'description', e.target.value)
              }
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Reminder Section */}
          <div className={styles.reminderSection}>
            <h4 className={styles.subsectionTitle}>Expiry Reminder Settings</h4>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label
                  htmlFor={`reminderAt-${product.id}`}
                  className={styles.label}
                >
                  Expiry Reminder Date & Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  id={`reminderAt-${product.id}`}
                  className={styles.input}
                  value={
                    product.reminderAt
                      ? isoToLocalDateTime(product.reminderAt)
                      : ''
                  }
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    if (dateValue) {
                      const isoDate = localDateTimeToIso(dateValue);
                      onChange(product.id, 'reminderAt', isoDate);
                    } else {
                      onChange(product.id, 'reminderAt', undefined);
                    }
                  }}
                  disabled={isLoading}
                />
                <p className={styles.helperText}>
                  Set a reminder date to be notified before this inventory item
                  expires
                </p>
              </div>
            </div>

            <CustomRemindersSection
              reminders={product.customReminders || []}
              onChange={onCustomRemindersChange}
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
