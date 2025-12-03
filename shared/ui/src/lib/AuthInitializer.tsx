import { useEffect } from 'react';
import { useAuthStore } from '@inventory-platform/store';
import { apiClient } from '@inventory-platform/api';

/**
 * Component to initialize API client with token from auth store
 * This ensures the API client is synced with persisted auth state
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Sync API client token with store token
    if (token && isAuthenticated) {
      apiClient.setToken(token);
    } else if (!isAuthenticated) {
      apiClient.setToken(null);
    }
  }, [token, isAuthenticated]);

  return children;
}

