import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '@inventory-platform/store';
import styles from './LoginForm.module.css';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, clearError } =
    useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const googleLoginRef = useRef<HTMLDivElement>(null);
  const hiddenButtonRef = useRef<HTMLDivElement>(null);

  // Check for Google account detection
  useEffect(() => {
    const checkForAccount = () => {
      if (!hiddenButtonRef.current) return;
      
      // Check all divs within the hidden button container
      const allDivs = hiddenButtonRef.current.querySelectorAll('div');
      allDivs.forEach((div) => {
        const text = div.textContent || '';
        // If button shows account info (name/email), show modal
        if (text.includes('@') || text.includes('Sign in as') || text.includes('Sign in with')) {
          setShowAccountModal(true);
        }
      });

      // Also check iframe content if accessible
      const iframes = hiddenButtonRef.current.querySelectorAll('iframe');
      if (iframes.length > 0) {
        // Iframe exists, might have account info - check after a delay
        setTimeout(() => {
          const allText = hiddenButtonRef.current?.textContent || '';
          if (allText.includes('@') || allText.includes('Sign in as')) {
            setShowAccountModal(true);
          }
        }, 500);
      }
    };

    // Check after a delay to allow Google button to render
    const timer = setTimeout(checkForAccount, 2000);
    
    // Also use MutationObserver to watch for changes
    const observer = new MutationObserver(() => {
      setTimeout(checkForAccount, 100);
    });
    
    if (hiddenButtonRef.current) {
      observer.observe(hiddenButtonRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to the original location if available, otherwise go to dashboard
      const from = (location.state as { from?: string })?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSubmit = async () => {
    setLocalError(null);
    clearError();

    if (isLoading) {
      return;
    }

    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all required fields');
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      // Redirect to the original location if available, otherwise go to dashboard
      const from = (location.state as { from?: string })?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      setLocalError(errorMessage);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      setLocalError(null);
      clearError();
      if (credentialResponse.credential) {
        await login({
          idToken: credentialResponse.credential,
        });
        // Redirect to the original location if available, otherwise go to dashboard
        const from =
          (location.state as { from?: string })?.from || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setLocalError('Google login failed. No credential received.');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Google login failed. Please try again.';
      setLocalError(errorMessage);
    }
  };

  const handleGoogleError = () => {
    setLocalError('Google login failed. Please try again.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (localError || error) {
      setLocalError(null);
      clearError();
    }
  };

  const displayError = localError || error;

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to your StockKart account</p>
      </div>

      {displayError && (
        <div className={styles.errorMessage}>{displayError}</div>
      )}

      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={styles.input}
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className={styles.input}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
        </div>

        <div className={styles.options}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" className={styles.checkbox} />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>
        </div>

        <button
          type="button"
          className={styles.submitButton}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        <div className={styles.divider}>
          <span className={styles.dividerText}>or</span>
        </div>

        {/* Hidden button to detect account */}
        <div ref={hiddenButtonRef} style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            auto_select={false}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        {!showAccountModal && (
          <div className={styles.googleButtonWrapper}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              auto_select={false}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
          </div>
        )}
      </div>

      {/* Google Account Modal in top right */}
      {showAccountModal && (
        <div className={styles.googleAccountModal}>
          <div className={styles.modalContent}>
            <button
              className={styles.modalClose}
              onClick={() => setShowAccountModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className={styles.modalHeader}>
              <p className={styles.modalTitle}>Sign in with Google</p>
            </div>
            <div className={styles.modalBody} ref={googleLoginRef}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                auto_select={false}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="100%"
              />
            </div>
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className={styles.link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
