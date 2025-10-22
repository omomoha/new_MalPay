import { renderHook, act } from '@testing-library/react-native';
import { useFormValidation } from '../../hooks/useCustomHooks';

describe('useFormValidation', () => {
  const validationRules = {
    email: {
      required: 'Email is required',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email format',
    },
    password: {
      required: 'Password is required',
      minLength: 8,
      message: 'Password must be at least 8 characters',
    },
    confirmPassword: {
      required: 'Confirm password is required',
      custom: (value: string, values: any) => value === values.password,
      message: 'Passwords do not match',
    },
  };

  test('should initialize with initial values', () => {
    const initialValues = {
      email: '',
      password: '',
      confirmPassword: '',
    };

    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationRules)
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isValid).toBe(false);
  });

  test('should handle field changes', () => {
    const initialValues = {
      email: '',
      password: '',
      confirmPassword: '',
    };

    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationRules)
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    expect(result.current.values.email).toBe('test@example.com');
    expect(result.current.errors.email).toBe('');
  });

  test('should validate on blur', () => {
    const initialValues = {
      email: '',
      password: '',
      confirmPassword: '',
    };

    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationRules)
    );

    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.touched.email).toBe(true);
    expect(result.current.errors.email).toBe('Email is required');
  });

  test('should validate required fields', () => {
    const initialValues = {
      email: '',
      password: '',
      confirmPassword: '',
    };

    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationRules)
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.email).toBe('Email is required');
    expect(result.current.errors.password).toBe('Password is required');
    expect(result.current.errors.confirmPassword).toBe('Confirm password is required');
    expect(result.current.isValid).toBe(false);
  });

  test('should validate email format', () => {
    const initialValues = {
      email: 'invalid-email',
      password: '',
      confirmPassword: '',
    };

    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationRules)
    );

    act(() => {
      result.current.handleChange('email', 'invalid-email');
      result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBe('Invalid email format');
  });

  test('should validate password length', () => {
    const initialValues = {
      email: '',
      password: 'short',
      confirmPassword: '',
    };

    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationRules)
    );

    act(() => {
      result.current.handleChange('password', 'short');
      result.current.handleBlur('password');
    });

    expect(result.current.errors.password).toBe('Password must be at least 8 characters');
  });

  test('should validate password confirmation', () => {
    const initialValues = {
      email: '',
      password: 'password123',
      confirmPassword: 'different',
    };

    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationRules)
    );

    act(() => {
      result.current.handleChange('password', 'password123');
      result.current.handleChange('confirmPassword', 'different');
      result.current.handleBlur('confirmPassword');
    });

    expect(result.current.errors.confirmPassword).toBe('Passwords do not match');
  });

  test('should clear errors when user starts typing', () => {
    const initialValues = {
      email: '',
      password: '',
      confirmPassword: '',
    };

    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationRules)
    );

    // First, create an error
    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBe('Email is required');

    // Then, start typing to clear the error
    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    expect(result.current.errors.email).toBe('');
  });

  test('should validate specific field', () => {
    const initialValues = {
      email: '',
      password: '',
      confirmPassword: '',
    };

    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationRules)
    );

    act(() => {
      result.current.validate('email');
    });

    expect(result.current.errors.email).toBe('Email is required');
    expect(result.current.errors.password).toBe(''); // Should not validate other fields
  });

  test('should reset form', () => {
    const initialValues = {
      email: '',
      password: '',
      confirmPassword: '',
    };

    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationRules)
    );

    // Make some changes
    act(() => {
      result.current.handleChange('email', 'test@example.com');
      result.current.handleChange('password', 'password123');
      result.current.handleBlur('email');
    });

    expect(result.current.values.email).toBe('test@example.com');
    expect(result.current.touched.email).toBe(true);

    // Reset form
    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  test('should be valid when all fields are correct', () => {
    const initialValues = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationRules)
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  test('should handle field validation with custom function', () => {
    const customValidationRules = {
      username: {
        required: 'Username is required',
        custom: (value: string) => value.length >= 3,
        message: 'Username must be at least 3 characters',
      },
    };

    const initialValues = {
      username: '',
    };

    const { result } = renderHook(() =>
      useFormValidation(initialValues, customValidationRules)
    );

    act(() => {
      result.current.handleChange('username', 'ab');
      result.current.handleBlur('username');
    });

    expect(result.current.errors.username).toBe('Username must be at least 3 characters');

    act(() => {
      result.current.handleChange('username', 'abc');
    });

    expect(result.current.errors.username).toBe('');
  });
});
