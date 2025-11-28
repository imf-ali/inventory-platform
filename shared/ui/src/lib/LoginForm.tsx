import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
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

  console.log('LoginForm render', { isLoading, isAuthenticated });

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
    console.log('handleSubmit called', { isLoading, formData });
    setLocalError(null);
    clearError();

    if (isLoading) {
      console.log('Already loading, returning early');
      return;
    }

    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all required fields');
      return;
    }

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setLocalError(errorMessage);
    }
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
            console.log('Button clicked!', { isLoading, formData });
            handleSubmit();
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
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

