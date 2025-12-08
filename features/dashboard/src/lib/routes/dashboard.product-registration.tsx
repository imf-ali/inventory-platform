import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { inventoryApi } from '@inventory-platform/api';
import type { CreateInventoryDto, CustomReminderInput } from '@inventory-platform/types';
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
  });

  const [customReminders, setCustomReminders] = useState<CustomReminderInput[]>([]);

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
        });
        setCustomReminders([]);
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
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>Description</label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              rows={4}
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          
          <div className={styles.reminderSection}>
            <h3 className={styles.sectionTitle}>Reminder Settings</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="reminderAt" className={styles.label}>Reminder Date & Time (Optional)</label>
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
                  Set a reminder date for this inventory item (e.g., before expiry)
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
    </div>
  );
}

