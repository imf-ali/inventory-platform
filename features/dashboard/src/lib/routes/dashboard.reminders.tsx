import { useState, useEffect } from 'react';
import { remindersApi } from '@inventory-platform/api';
import type { Reminder, ReminderType, CreateReminderDto, UpdateReminderDto } from '@inventory-platform/types';
import { ReminderForm } from '@inventory-platform/ui';
import styles from './dashboard.reminders.module.css';

export function meta() {
  return [
    { title: 'Reminders - InventoryPro' },
    { name: 'description', content: 'Manage your inventory reminders' },
  ];
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'COMPLETED'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ReminderType>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingReminderId, setDeletingReminderId] = useState<string | null>(null);

  const fetchReminders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await remindersApi.getAll();
      setReminders(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reminders';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleCreate = async (data: Parameters<typeof remindersApi.create>[0]) => {
    setIsSubmitting(true);
    try {
      await remindersApi.create(data);
      await fetchReminders();
      setShowCreateForm(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reminder';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Parameters<typeof remindersApi.update>[1]) => {
    if (!editingReminder) return;
    
    setIsSubmitting(true);
    try {
      await remindersApi.update(editingReminder.reminderId, data);
      await fetchReminders();
      setEditingReminder(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update reminder';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data: CreateReminderDto | UpdateReminderDto) => {
    if (editingReminder) {
      await handleUpdate(data as UpdateReminderDto);
    } else {
      await handleCreate(data as CreateReminderDto);
    }
  };

  const handleDeleteClick = (reminderId: string) => {
    setDeletingReminderId(reminderId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReminderId) return;

    try {
      await remindersApi.delete(deletingReminderId);
      await fetchReminders();
      setDeletingReminderId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete reminder';
      setError(errorMessage);
      setDeletingReminderId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingReminderId(null);
  };

  const getDaysUntilReminder = (reminderAt: string): number => {
    const now = new Date();
    const reminderDate = new Date(reminderAt);
    const diffTime = reminderDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriority = (daysLeft: number): 'high' | 'medium' | 'low' => {
    if (daysLeft < 0) return 'high';
    if (daysLeft <= 3) return 'high';
    if (daysLeft <= 7) return 'medium';
    return 'low';
  };

  const filteredReminders = reminders.filter((reminder) => {
    const statusMatch = filter === 'all' || reminder.status === filter;
    const typeMatch = typeFilter === 'all' || reminder.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
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
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Reminders</h2>
          <p className={styles.subtitle}>Manage your inventory reminders</p>
        </div>
        <button
          className={styles.createButton}
          onClick={() => {
            setShowCreateForm(true);
            setEditingReminder(null);
          }}
        >
          + Create Reminder
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
          <button className={styles.dismissButton} onClick={() => setError(null)}>×</button>
        </div>
      )}

      {(showCreateForm || editingReminder) && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingReminder ? 'Edit Reminder' : 'Create Reminder'}</h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingReminder(null);
                }}
              >
                ×
              </button>
            </div>
            <ReminderForm
              reminder={editingReminder || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingReminder(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      {deletingReminderId && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Delete Reminder</h3>
              <button
                className={styles.closeButton}
                onClick={handleDeleteCancel}
              >
                ×
              </button>
            </div>
            <div className={styles.confirmContent}>
              <p>Are you sure you want to delete this reminder? This action cannot be undone.</p>
              <div className={styles.confirmActions}>
                <button
                  className={styles.cancelButton}
                  onClick={handleDeleteCancel}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmButton}
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.remindersContainer}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Status:</span>
            <button
              className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`${styles.filterBtn} ${filter === 'PENDING' ? styles.active : ''}`}
              onClick={() => setFilter('PENDING')}
            >
              Pending
            </button>
            <button
              className={`${styles.filterBtn} ${filter === 'COMPLETED' ? styles.active : ''}`}
              onClick={() => setFilter('COMPLETED')}
            >
              Completed
            </button>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Type:</span>
            <button
              className={`${styles.filterBtn} ${typeFilter === 'all' ? styles.active : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              All
            </button>
            <button
              className={`${styles.filterBtn} ${typeFilter === 'EXPIRY' ? styles.active : ''}`}
              onClick={() => setTypeFilter('EXPIRY')}
            >
              Expiry
            </button>
            <button
              className={`${styles.filterBtn} ${typeFilter === 'CUSTOM' ? styles.active : ''}`}
              onClick={() => setTypeFilter('CUSTOM')}
            >
              Custom
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading reminders...</div>
        ) : filteredReminders.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No reminders found.</p>
            {!showCreateForm && (
              <button
                className={styles.createButton}
                onClick={() => setShowCreateForm(true)}
              >
                Create Your First Reminder
              </button>
            )}
          </div>
        ) : (
          <div className={styles.remindersList}>
            {filteredReminders.map((reminder) => {
              const daysLeft = getDaysUntilReminder(reminder.reminderAt);
              const priority = getPriority(daysLeft);
              
              return (
                <div key={reminder.reminderId} className={`${styles.reminderCard} ${styles[priority]}`}>
                  <div className={styles.reminderIcon}>
                    {reminder.type === 'EXPIRY' ? '📅' : '🔔'}
                  </div>
                  <div className={styles.reminderInfo}>
                    <div className={styles.reminderHeader}>
                      <h3 className={styles.reminderTitle}>
                        {reminder.inventoryId ? `Inventory #${reminder.inventoryId.slice(-6)}` : 'Custom Reminder'}
                      </h3>
                      <div className={styles.badges}>
                        <span className={`${styles.statusBadge} ${styles[reminder.status]}`}>
                          {reminder.status}
                        </span>
                        {reminder.type && (
                          <span className={styles.typeBadge}>
                            {reminder.type}
                          </span>
                        )}
                        <span className={`${styles.priorityBadge} ${styles[priority]}`}>
                          {priority}
                        </span>
                      </div>
                    </div>
                    <div className={styles.reminderDetails}>
                      <div>
                        <strong>Reminder:</strong> {formatDate(reminder.reminderAt)}
                      </div>
                      {reminder.expiryDate && (
                        <div>
                          <strong>End Date:</strong> {formatDate(reminder.expiryDate)}
                        </div>
                      )}
                      {reminder.notes && (
                        <div className={styles.notes}>
                          <strong>Notes:</strong> {reminder.notes}
                        </div>
                      )}
                      <div className={styles.daysLeft}>
                        {daysLeft < 0
                          ? `${Math.abs(daysLeft)} days overdue`
                          : daysLeft === 0
                          ? 'Due today'
                          : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
                      </div>
                    </div>
                  </div>
                  <div className={styles.reminderActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => setEditingReminder(reminder)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.actionBtnDanger}
                      onClick={() => handleDeleteClick(reminder.reminderId)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

