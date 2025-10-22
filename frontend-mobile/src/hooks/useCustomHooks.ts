import React, { useState, useCallback } from 'react';
import { validateEmail, validatePassword, validatePIN } from '@utils/helpers';

// Form validation hook
export const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((name: string, value: string, rules: any) => {
    let error = '';

    if (rules.required && !value.trim()) {
      error = `${name} is required`;
    } else if (rules.email && !validateEmail(value)) {
      error = 'Please enter a valid email address';
    } else if (rules.password && !validatePassword(value)) {
      error = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    } else if (rules.pin && !validatePIN(value)) {
      error = 'PIN must be 4 digits';
    } else if (rules.minLength && value.length < rules.minLength) {
      error = `${name} must be at least ${rules.minLength} characters`;
    } else if (rules.maxLength && value.length > rules.maxLength) {
      error = `${name} must be no more than ${rules.maxLength} characters`;
    } else if (rules.pattern && !rules.pattern.test(value)) {
      error = rules.message || `${name} format is invalid`;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  }, []);

  const validateForm = useCallback((fields: Record<string, { value: string; rules: any }>) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.entries(fields).forEach(([name, { value, rules }]) => {
      const fieldValid = validateField(name, value, rules);
      if (!fieldValid) {
        isValid = false;
      }
    });

    return isValid;
  }, [validateField]);

  const clearError = useCallback((name: string) => {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
  };
};

// Debounce hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Local storage hook
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};

// Toggle hook
export const useToggle = (initialValue: boolean = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, { toggle, setTrue, setFalse }] as const;
};