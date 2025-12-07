import type { UserRole } from '@inventory-platform/types';
import styles from './RoleBadge.module.css';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const getRoleColor = (role: UserRole): string => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return styles.admin;
      case 'MANAGER':
        return styles.manager;
<<<<<<< Updated upstream
      case 'STAFF':
        return styles.staff;
=======
>>>>>>> Stashed changes
      case 'CASHIER':
        return styles.cashier;
      default:
        return styles.default;
    }
  };

  return (
    <span className={`${styles.badge} ${getRoleColor(role)} ${className}`}>
      {role}
    </span>
  );
}

