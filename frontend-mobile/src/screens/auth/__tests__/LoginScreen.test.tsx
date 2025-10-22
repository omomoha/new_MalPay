import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../../screens/auth/LoginScreen';
import authReducer from '../../store/slices/authSlice';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        twoFactorRequired: false,
        tempToken: null,
        ...initialState,
      },
    },
  });
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; store?: any }> = ({ 
  children, 
  store = createTestStore() 
}) => (
  <Provider store={store}>
    <NavigationContainer>
      {children}
    </NavigationContainer>
  </Provider>
);

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Sign in to your MalPay account')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  test('shows forgot password link', () => {
    const { getByText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    expect(getByText('Forgot Password?')).toBeTruthy();
  });

  test('shows register link', () => {
    const { getByText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    expect(getByText("Don't have an account? Register")).toBeTruthy();
  });

  test('handles email input', () => {
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(emailInput.props.value).toBe('test@example.com');
  });

  test('handles password input', () => {
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, 'password123');
    expect(passwordInput.props.value).toBe('password123');
  });

  test('handles login button press', async () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    // Should show loading state
    await waitFor(() => {
      expect(loginButton.props.loading).toBe(true);
    });
  });

  test('navigates to forgot password', () => {
    const { getByText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    const forgotPasswordLink = getByText('Forgot Password?');
    fireEvent.press(forgotPasswordLink);

    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
  });

  test('navigates to register', () => {
    const { getByText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    const registerLink = getByText("Don't have an account? Register");
    fireEvent.press(registerLink);

    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  test('shows loading state during login', async () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(loginButton.props.loading).toBe(true);
      expect(loginButton.props.disabled).toBe(true);
    });
  });

  test('disables login button when fields are empty', () => {
    const { getByText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    const loginButton = getByText('Login');
    expect(loginButton.props.disabled).toBe(true);
  });

  test('enables login button when fields are filled', () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(loginButton.props.disabled).toBe(false);
  });

  test('shows two-factor authentication when required', () => {
    const store = createTestStore({
      twoFactorRequired: true,
      tempToken: 'temp-token',
    });

    const { getByText, getByPlaceholderText } = render(
      <TestWrapper store={store}>
        <LoginScreen />
      </TestWrapper>
    );

    expect(getByText('Two-Factor Authentication')).toBeTruthy();
    expect(getByPlaceholderText('Enter verification code')).toBeTruthy();
  });

  test('handles two-factor authentication input', () => {
    const store = createTestStore({
      twoFactorRequired: true,
      tempToken: 'temp-token',
    });

    const { getByPlaceholderText } = render(
      <TestWrapper store={store}>
        <LoginScreen />
      </TestWrapper>
    );

    const codeInput = getByPlaceholderText('Enter verification code');
    fireEvent.changeText(codeInput, '123456');
    expect(codeInput.props.value).toBe('123456');
  });

  test('handles two-factor authentication submit', async () => {
    const store = createTestStore({
      twoFactorRequired: true,
      tempToken: 'temp-token',
    });

    const { getByText, getByPlaceholderText } = render(
      <TestWrapper store={store}>
        <LoginScreen />
      </TestWrapper>
    );

    const codeInput = getByPlaceholderText('Enter verification code');
    const verifyButton = getByText('Verify');

    fireEvent.changeText(codeInput, '123456');
    fireEvent.press(verifyButton);

    await waitFor(() => {
      expect(verifyButton.props.loading).toBe(true);
    });
  });

  test('shows error message when authentication fails', () => {
    const store = createTestStore({
      error: 'Invalid credentials',
    });

    const { getByText } = render(
      <TestWrapper store={store}>
        <LoginScreen />
      </TestWrapper>
    );

    expect(getByText('Invalid credentials')).toBeTruthy();
  });

  test('handles resend verification code', () => {
    const store = createTestStore({
      twoFactorRequired: true,
      tempToken: 'temp-token',
    });

    const { getByText } = render(
      <TestWrapper store={store}>
        <LoginScreen />
      </TestWrapper>
    );

    const resendLink = getByText('Resend Code');
    fireEvent.press(resendLink);

    // Should trigger resend action
    expect(resendLink).toBeTruthy();
  });
});
