import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { inventoryApi, vendorsApi } from '@inventory-platform/api';
import type { CreateInventoryDto, CustomReminderInput, Vendor, CreateVendorDto, VendorBusinessType } from '@inventory-platform/types';
import { CustomRemindersSection } from '@inventory-platform/ui';
import styles from './dashboard.product-registration.module.css';

export function meta() {
  return [
    { title: 'Product Registration - InventoryPro' },
    { name: 'description', content: 'Register and manage your product inventory' },
  ];
}

export default function ProductRegistrationPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateInventoryDto>({
    barcode: '',
    name: '',
    companyName: '',
    price: 0,
    maximumRetailPrice: 0,
    costPrice: 0,
    sellingPrice: 0,
    businessType: 'pharmacy',
    location: '',
    count: 0,
    expiryDate: '',
    description: '',
    reminderAt: undefined,
    customReminders: [],
    hsn: '',
    sac: '',
    batchNo: '',
    scheme: '',
  });

  const [customReminders, setCustomReminders] = useState<CustomReminderInput[]>([]);
  
  // Vendor state
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
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

  // LotId state
  const [lotId, setLotId] = useState('');
  const [lotIdSearchQuery, setLotIdSearchQuery] = useState('');
  const [lotIdSearchResults, setLotIdSearchResults] = useState<{ lotId: string; createdAt: string }[]>([]);
  const [isSearchingLots, setIsSearchingLots] = useState(false);
  const [showLotIdDropdown, setShowLotIdDropdown] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'expiryDate' ? new Date(value).toISOString() : value,
    }));
    setError(null);
    setSuccess(null);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? 0 : parseFloat(value) || 0,
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.barcode || !formData.name || !formData.companyName || !formData.location || !formData.expiryDate) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      if (formData.count <= 0) {
        setError('Count must be greater than 0');
        setIsLoading(false);
        return;
      }

      // Validate vendor is selected
      if (!selectedVendor || !selectedVendor.vendorId) {
        setError('Vendor information is required. Please search and select a vendor.');
        setIsLoading(false);
        return;
      }

      // Ensure price is set to sellingPrice (they should be the same)
      // Format reminderAt if provided
      let reminderAtISO: string | undefined;
      if (formData.reminderAt) {
        if (formData.reminderAt.includes('T')) {
          // Already in ISO format
          reminderAtISO = new Date(formData.reminderAt).toISOString();
        } else {
          // Date only, convert to ISO
          reminderAtISO = new Date(formData.reminderAt).toISOString();
        }
      }

      const submitData: CreateInventoryDto = {
        ...formData,
        price: formData.sellingPrice,
        reminderAt: reminderAtISO,
        customReminders: customReminders.length > 0 ? customReminders : undefined,
        vendorId: selectedVendor.vendorId,
        ...(lotId && { lotId }),
        ...(formData.hsn && { hsn: formData.hsn }),
        ...(formData.sac && { sac: formData.sac }),
        ...(formData.batchNo && { batchNo: formData.batchNo }),
        ...(formData.scheme && { scheme: formData.scheme }),
      };

      const response = await inventoryApi.create(submitData);
      const displayId = response.lotId || response.id;
      setSuccess(`Product registered successfully! ${response.reminderCreated ? 'Reminders created. ' : ''}ID: ${displayId}`);
      
      // Clear form and success message after 5 seconds
      setTimeout(() => {
        setFormData({
          price: 0,
          barcode: '',
          name: '',
          companyName: '',
          maximumRetailPrice: 0,
          costPrice: 0,
          sellingPrice: 0,
          businessType: 'pharmacy',
          location: '',
          count: 0,
          expiryDate: '',
          description: '',
          reminderAt: undefined,
          customReminders: [],
          hsn: '',
          sac: '',
          batchNo: '',
          scheme: '',
        });
        setCustomReminders([]);
        handleClearVendor();
        setLotId('');
        setLotIdSearchQuery('');
        setLotIdSearchResults([]);
        setSuccess(null);
      }, 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register product. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleVendorSearch = async () => {
    if (!vendorSearchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsSearchingVendor(true);
    setError(null);
    try {
      const vendors = await vendorsApi.search(vendorSearchQuery.trim());
      setVendorSearchResults(vendors || []);
      setShowVendorDropdown(true);
      // If only one vendor found, auto-select it
      if (vendors.length === 1) {
        handleSelectVendor(vendors[0]);
      } else {
        setSelectedVendor(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search vendor';
      setError(errorMessage);
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

  const handleCreateVendor = async () => {
    setIsCreatingVendor(true);
    setError(null);
    try {
      // Validate required fields
      if (!vendorFormData.name || !vendorFormData.contactPhone) {
        setError('Please fill in all required vendor fields (Name and Phone)');
        setIsCreatingVendor(false);
        return;
      }

      // Only include optional fields if they have values
      const vendorPayload: CreateVendorDto = {
        name: vendorFormData.name,
        contactPhone: vendorFormData.contactPhone,
        businessType: vendorFormData.businessType,
        ...(vendorFormData.contactEmail && { contactEmail: vendorFormData.contactEmail }),
        ...(vendorFormData.address && { address: vendorFormData.address }),
      };
      const vendor = await vendorsApi.create(vendorPayload);
      setSelectedVendor(vendor);
      setShowVendorModal(false);
      setVendorSearchQuery(vendor.contactPhone);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create vendor';
      setError(errorMessage);
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
      setLotIdSearchResults(lots.map(lot => ({ lotId: lot.lotId, createdAt: lot.createdAt })));
      setShowLotIdDropdown(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search lots';
      setError(errorMessage);
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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Product Registration</h2>
        <p className={styles.subtitle}>Register and manage your product inventory</p>
      </div>
      <div className={styles.formContainer}>
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        {success && (
          <div className={styles.successMessage}>
            {success}
          </div>
        )}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="lotId" className={styles.label}>Lot ID (Optional)</label>
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
                  disabled={isLoading || isSearchingLots || !lotIdSearchQuery.trim()}
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
                          minute: '2-digit'
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
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {formatDate(lot.createdAt)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="barcode" className={styles.label}>Barcode *</label>
              <input
                type="text"
                id="barcode"
                name="barcode"
                className={styles.input}
                placeholder="Enter barcode"
                value={formData.barcode}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="companyName" className={styles.label}>Company *</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                className={styles.input}
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className={styles.input}
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="count" className={styles.label}>Count *</label>
              <input
                type="number"
                id="count"
                name="count"
                className={styles.input}
                placeholder="0"
                min="1"
                value={formData.count}
                onChange={handleNumberChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="expiryDate" className={styles.label}>Expiry Date *</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                className={styles.input}
                value={formData.expiryDate ? new Date(formData.expiryDate).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const dateValue = e.target.value;
                  if (dateValue) {
                    // Create date at midnight UTC to match API format (YYYY-MM-DDTHH:mm:ssZ)
                    // dateValue is in YYYY-MM-DD format, append T00:00:00Z for UTC midnight
                    const isoDate = `${dateValue}T00:00:00Z`;
                    setFormData((prev) => ({
                      ...prev,
                      expiryDate: isoDate,
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      expiryDate: '',
                    }));
                  }
                  setError(null);
                  setSuccess(null);
                }}
                required
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="location" className={styles.label}>Inventory Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                className={styles.input}
                placeholder="Enter inventory location"
                value={formData.location}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Additional Product Information */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="hsn" className={styles.label}>HSN Code</label>
              <input
                type="text"
                id="hsn"
                name="hsn"
                className={styles.input}
                placeholder="Enter the HSN code"
                value={formData.hsn || ''}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="sac" className={styles.label}>SAC Code</label>
              <input
                type="text"
                id="sac"
                name="sac"
                className={styles.input}
                placeholder="Enter the SAC code"
                value={formData.sac || ''}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="batchNo" className={styles.label}>Batch Number</label>
              <input
                type="text"
                id="batchNo"
                name="batchNo"
                className={styles.input}
                placeholder="Enter the batch number"
                value={formData.batchNo || ''}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="scheme" className={styles.label}>Scheme/Promotion</label>
              <input
                type="text"
                id="scheme"
                name="scheme"
                className={styles.input}
                placeholder="Enter the scheme/promotion"
                value={formData.scheme || ''}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="maximumRetailPrice" className={styles.label}>MRP *</label>
              <input
                type="number"
                id="maximumRetailPrice"
                name="maximumRetailPrice"
                className={styles.input}
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.maximumRetailPrice}
                onChange={handleNumberChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="costPrice" className={styles.label}>Cost Price *</label>
              <input
                type="number"
                id="costPrice"
                name="costPrice"
                className={styles.input}
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={handleNumberChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="sellingPrice" className={styles.label}>Selling Price *</label>
              <input
                type="number"
                id="sellingPrice"
                name="sellingPrice"
                className={styles.input}
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.sellingPrice}
                onChange={handleNumberChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Vendor Section */}
          <div className={styles.vendorSection}>
            <h3 className={styles.sectionTitle}>Vendor Information *</h3>
            <div className={styles.formGroup}>
              <label htmlFor="vendorSearch" className={styles.label}>Vendor Search *</label>
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
                    disabled={isLoading || isSearchingVendor || !vendorSearchQuery.trim()}
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
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {vendor.contactPhone}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {showVendorDropdown && vendorSearchResults.length === 0 && !isSearchingVendor && (
                  <div className={styles.vendorNotFound}>
                    <p>No vendors found. Would you like to create a new vendor?</p>
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
                  <p><strong>Phone:</strong> {selectedVendor.contactPhone}</p>
                  {selectedVendor.contactEmail && (
                    <p><strong>Email:</strong> {selectedVendor.contactEmail}</p>
                  )}
                  {selectedVendor.address && (
                    <p><strong>Address:</strong> {selectedVendor.address}</p>
                  )}
                  <p><strong>Business Type:</strong> {selectedVendor.businessType}</p>
                </div>
              </div>
            )}
          </div>
          <div className={styles.reminderSection}>
            <h3 className={styles.sectionTitle}>Expiry Reminder Settings</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="reminderAt" className={styles.label}>Expiry Reminder Date & Time (Optional)</label>
                <input
                  type="datetime-local"
                  id="reminderAt"
                  name="reminderAt"
                  className={styles.input}
                  value={formData.reminderAt ? new Date(formData.reminderAt).toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    if (dateValue) {
                      const isoDate = new Date(dateValue).toISOString();
                      setFormData((prev) => ({
                        ...prev,
                        reminderAt: isoDate,
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        reminderAt: undefined,
                      }));
                    }
                    setError(null);
                    setSuccess(null);
                  }}
                  disabled={isLoading}
                />
                <p className={styles.helperText}>
                  Set a reminder date to be notified before this inventory item expires
                </p>
              </div>
            </div>
            
            <CustomRemindersSection
              reminders={customReminders}
              onChange={setCustomReminders}
              disabled={isLoading}
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={handleCancel} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register Product'}
            </button>
          </div>
        </form>
      </div>

      {/* Vendor Creation Modal */}
      {showVendorModal && (
        <div className={styles.modalOverlay} onClick={() => !isCreatingVendor && setShowVendorModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Create New Vendor</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setShowVendorModal(false)}
                disabled={isCreatingVendor}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label htmlFor="vendorName" className={styles.label}>Vendor Name *</label>
                <input
                  type="text"
                  id="vendorName"
                  className={styles.input}
                  placeholder="Enter vendor name"
                  value={vendorFormData.name}
                  onChange={(e) => setVendorFormData((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={isCreatingVendor}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="vendorContactPhone" className={styles.label}>Contact Phone *</label>
                <input
                  type="tel"
                  id="vendorContactPhone"
                  className={styles.input}
                  placeholder="Enter contact phone"
                  value={vendorFormData.contactPhone}
                  onChange={(e) => setVendorFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  disabled={isCreatingVendor}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="vendorContactEmail" className={styles.label}>Contact Email</label>
                <input
                  type="email"
                  id="vendorContactEmail"
                  className={styles.input}
                  placeholder="Enter contact email"
                  value={vendorFormData.contactEmail}
                  onChange={(e) => setVendorFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  disabled={isCreatingVendor}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="vendorAddress" className={styles.label}>Address</label>
                <input
                  type="text"
                  id="vendorAddress"
                  className={styles.input}
                  placeholder="Enter address"
                  value={vendorFormData.address}
                  onChange={(e) => setVendorFormData((prev) => ({ ...prev, address: e.target.value }))}
                  disabled={isCreatingVendor}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="vendorBusinessType" className={styles.label}>Business Type *</label>
                <select
                  id="vendorBusinessType"
                  className={styles.input}
                  value={vendorFormData.businessType}
                  onChange={(e) => setVendorFormData((prev) => ({ ...prev, businessType: e.target.value as VendorBusinessType }))}
                  disabled={isCreatingVendor}
                  required
                >
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="RETAIL">Retail</option>
                  <option value="MANUFACTURER">Manufacturer</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowVendorModal(false)}
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

