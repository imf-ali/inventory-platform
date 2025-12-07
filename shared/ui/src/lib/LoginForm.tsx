import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '@inventory-platform/store';
import styles from './LoginForm.module.css';

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

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
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setLocalError(errorMessage);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setLocalError(null);
      clearError();
      if (credentialResponse.credential) {
        await login({
          idToken: credentialResponse.credential,
        });
        navigate('/dashboard');
      } else {
        setLocalError('Google login failed. No credential received.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed. Please try again.';
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
        <p className={styles.subtitle}>Sign in to your InventoryPro account</p>
      </div>
      
      {displayError && (
        <div className={styles.errorMessage}>
          {displayError}
        </div>
      )}
      
      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
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
          <label htmlFor="password" className={styles.label}>Password</label>
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
          <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
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

        <div className={styles.googleButtonWrapper}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="100%"
          />
        </div>
      </div>
      
      <div className={styles.footer}>
        <p className={styles.footerText}>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

