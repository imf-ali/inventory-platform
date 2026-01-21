import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '@inventory-platform/store';
import styles from './SignupForm.module.css';

declare global {
  interface Window {
    FB?: {
      init: (config: { appId: string; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { accessToken: string } }) => void,
        options?: { scope: string }
      ) => void;
      getLoginStatus: (
        callback: (response: { status: string; authResponse?: { accessToken: string } }) => void
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

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
  const [isFacebookReady, setIsFacebookReady] = useState(false);

  // Load Facebook SDK
  useEffect(() => {
    const initializeFacebook = () => {
      const appId = import.meta.env.VITE_FACEBOOK_APP_ID || '';
      if (!appId) {
        return;
      }

      // If FB is already loaded, initialize it immediately
      if (window.FB) {
        window.FB.init({
          appId: appId,
          version: 'v18.0',
        });
        setIsFacebookReady(true);
        return;
      }

      // If script already exists, wait for it to load
      if (document.getElementById('facebook-jssdk')) {
        // Set up the callback in case it hasn't been called yet
        window.fbAsyncInit = () => {
          if (window.FB) {
            window.FB.init({
              appId: appId,
              version: 'v18.0',
            });
            setIsFacebookReady(true);
          }
        };
        // If the script is already loaded, try to initialize
        const checkInterval = setInterval(() => {
          if (window.FB) {
            window.FB.init({
              appId: appId,
              version: 'v18.0',
            });
            setIsFacebookReady(true);
            clearInterval(checkInterval);
          }
        }, 100);
        // Clear interval after 5 seconds
        setTimeout(() => clearInterval(checkInterval), 5000);
        return;
      }

      // Create and load the script
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);

      window.fbAsyncInit = () => {
        if (window.FB) {
          window.FB.init({
            appId: appId,
            version: 'v18.0',
          });
          setIsFacebookReady(true);
        }
      };
    };

    initializeFacebook();
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
          signupType: 'google',
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

  const handleFacebookSignup = async () => {
    try {
      setLocalError(null);
      clearError();

      if (!window.FB) {
        setLocalError('Facebook SDK not loaded. Please refresh the page.');
        return;
      }

      window.FB.login(
        async (response) => {
          if (response.authResponse && response.authResponse.accessToken) {
            try {
              await signup({
                idToken: response.authResponse.accessToken,
                signupType: 'facebook',
                role: 'CASHIER', // Default role
              });
              navigate('/shop-selection');
            } catch (err) {
              const errorMessage =
                err instanceof Error
                  ? err.message
                  : 'Facebook signup failed. Please try again.';
              setLocalError(errorMessage);
            }
          } else {
            setLocalError('Facebook signup failed. Please try again.');
          }
        },
        { scope: 'email,public_profile' }
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Facebook signup failed. Please try again.';
      setLocalError(errorMessage);
    }
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

      <div className={styles.socialButtons}>
        <div className={styles.googleButtonWrapper}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            auto_select={false}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
          />
        </div>
        <button
          type="button"
          className={styles.facebookButton}
          onClick={handleFacebookSignup}
          disabled={isLoading || !isFacebookReady}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.facebookIcon}
          >
            <path
              d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              fill="#0866FF"
            />
          </svg>
        </button>
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
