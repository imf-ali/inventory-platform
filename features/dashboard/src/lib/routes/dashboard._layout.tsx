import { useEffect, useRef } from 'react';
import { useNavigate, Outlet } from 'react-router';
import { useAuthStore } from '@inventory-platform/store';
import { DashboardLayout } from '@inventory-platform/ui';

export default function DashboardLayoutRoute() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, token, fetchCurrentUser } = useAuthStore();
  const hasCheckedAuth = useRef(false);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    // Reset check flag when authentication state changes
    if (isAuthenticated) {
      hasCheckedAuth.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const checkAuth = async () => {
      // Prevent multiple simultaneous calls
      if (isCheckingRef.current || isLoading) {
        return;
      }

      if (!isAuthenticated) {
        // Only try to fetch if we have a token (might be valid)
        if (token && !hasCheckedAuth.current) {
          isCheckingRef.current = true;
          hasCheckedAuth.current = true;
          try {
            await fetchCurrentUser();
          } catch {
            // If fetch fails, redirect to login and reset flags
            hasCheckedAuth.current = false;
            navigate('/login');
          } finally {
            isCheckingRef.current = false;
          }
        } else if (!token) {
          // No token, redirect immediately
          navigate('/login');
        }
      } else if (user && !user.shopId) {
        // User is authenticated but doesn't have a shop, redirect to onboarding
        navigate('/onboarding');
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, user, token, navigate, fetchCurrentUser]);

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

