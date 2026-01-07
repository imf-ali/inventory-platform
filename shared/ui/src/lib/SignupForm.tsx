import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '@inventory-platform/store';
import styles from './SignupForm.module.css';

export function SignupForm() {
  const navigate = useNavigate();
  const { signup, isAuthenticated, isLoading, error, clearError } =
    useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setLocalError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'CASHIER', // Default role
      });
      navigate('/shop-selection');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Signup failed. Please try again.';
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
        await signup({
          idToken: credentialResponse.credential,
          role: 'CASHIER', // Default role
        });
        navigate('/shop-selection');
      } else {
        setLocalError('Google signup failed. No credential received.');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Google signup failed. Please try again.';
      setLocalError(errorMessage);
    }
  };

  const handleGoogleError = () => {
    setLocalError('Google signup failed. Please try again.');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    setFormData({
      ...formData,
      [target.name]: target.value,
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
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Get started with StockKart today</p>
      </div>

      {displayError && (
        <div className={styles.errorMessage}>{displayError}</div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={styles.input}
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

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
            required
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
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className={styles.input}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" className={styles.checkbox} required />
            <span>
              I agree to the{' '}
              <a href="#terms" className={styles.termsLink}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className={styles.termsLink}>
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

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
          text="signup_with"
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
            text="signup_with"
            shape="rectangular"
            width="100%"
          />
        </div>
      )}

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
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
              <p className={styles.modalTitle}>Sign up with Google</p>
            </div>
            <div className={styles.modalBody} ref={googleLoginRef}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                auto_select={false}
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
                width="100%"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
