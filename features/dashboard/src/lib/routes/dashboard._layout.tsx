import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router';
import { useAuthStore } from '@inventory-platform/store';
import { DashboardLayout } from '@inventory-platform/ui';

export default function DashboardLayoutRoute() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading) {
        if (!isAuthenticated) {
          // Try to fetch current user to check if token is valid
          try {
            await fetchCurrentUser();
          } catch {
            // If fetch fails, redirect to login
            navigate('/login');
          }
        } else if (user && !user.shopId) {
          // User is authenticated but doesn't have a shop, redirect to onboarding
          navigate('/onboarding');
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, user, navigate, fetchCurrentUser]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  // If user doesn't have shopId, redirect to onboarding
  if (user && !user.shopId) {
    return null; // Will redirect
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

