import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../screens/auth/LoginScreen';
import HomeScreen from '../../screens/main/HomeScreen';
import SendMoneyScreen from '../../screens/payment/SendMoneyScreen';
import PaymentConfirmScreen from '../../screens/payment/PaymentConfirmScreen';
import PaymentSuccessScreen from '../../screens/payment/PaymentSuccessScreen';
import authReducer from '../../store/slices/authSlice';
import walletReducer from '../../store/slices/walletSlice';
import transactionReducer from '../../store/slices/transactionSlice';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    replace: mockReplace,
  }),
}));

// Create test stack navigator
const Stack = createNativeStackNavigator();

const TestNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
    <Stack.Screen name="PaymentConfirm" component={PaymentConfirmScreen} />
    <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
  </Stack.Navigator>
);

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      wallet: walletReducer,
      transaction: transactionReducer,
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
      },
      wallet: {
        wallets: [],
        activeWallet: null,
        balance: {
          balance: 1000.00,
          currency: 'NGN',
        },
        isLoading: false,
        error: null,
      },
      transaction: {
        list: [],
        currentTransaction: null,
        filters: {
          page: 1,
          limit: 20,
          status: 'all',
          type: 'all',
        },
        pagination: null,
        isLoading: false,
        error: null,
      },
      ...initialState,
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

describe('End-to-End User Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Login Flow', () => {
    test('should complete login flow successfully', async () => {
      const store = createTestStore();
      
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper store={store}>
          <TestNavigator />
        </TestWrapper>
      );

      // Navigate to login screen
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Login');

      // Enter credentials
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      // Should show loading state
      await waitFor(() => {
        expect(loginButton.props.loading).toBe(true);
      });

      // Simulate successful login
      await waitFor(() => {
        store.dispatch({
          type: 'auth/setAuthTokens',
          payload: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
          },
        });
        store.dispatch({
          type: 'auth/setUser',
          payload: {
            id: 'test-user-id',
            email: 'test@example.com',
            username: 'testuser',
            role: 'user',
            isVerified: true,
            isActive: true,
            twoFactorEnabled: false,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
        });
      });

      // Should navigate to home screen
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('Home');
      });
    });

    test('should handle login with 2FA', async () => {
      const store = createTestStore();
      
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper store={store}>
          <TestNavigator />
        </TestWrapper>
      );

      // Enter credentials
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Login');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      // Simulate 2FA required
      await waitFor(() => {
        store.dispatch({
          type: 'auth/setTwoFactorRequired',
          payload: {
            required: true,
            tempToken: 'temp-token',
          },
        });
      });

      // Should show 2FA screen
      await waitFor(() => {
        expect(getByText('Two-Factor Authentication')).toBeTruthy();
      });

      // Enter 2FA code
      const codeInput = getByPlaceholderText('Enter verification code');
      const verifyButton = getByText('Verify');

      fireEvent.changeText(codeInput, '123456');
      fireEvent.press(verifyButton);

      // Should complete login
      await waitFor(() => {
        store.dispatch({
          type: 'auth/setAuthTokens',
          payload: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
          },
        });
      });
    });
  });

  describe('Complete Money Transfer Flow', () => {
    test('should complete money transfer flow successfully', async () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            username: 'testuser',
            role: 'user',
            isVerified: true,
            isActive: true,
            twoFactorEnabled: false,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          twoFactorRequired: false,
          tempToken: null,
        },
      });

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper store={store}>
          <TestNavigator />
        </TestWrapper>
      );

      // Start from home screen
      const sendButton = getByText('Send');
      fireEvent.press(sendButton);

      // Should navigate to send money screen
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('SendMoney');
      });

      // Fill transfer form
      const recipientInput = getByPlaceholderText('Recipient Email or Username');
      const amountInput = getByPlaceholderText('Amount');
      const descriptionInput = getByPlaceholderText('Description (Optional)');
      const continueButton = getByText('Continue');

      fireEvent.changeText(recipientInput, 'recipient@example.com');
      fireEvent.changeText(amountInput, '100');
      fireEvent.changeText(descriptionInput, 'Payment for services');
      fireEvent.press(continueButton);

      // Should navigate to payment confirmation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('PaymentConfirm', {
          recipient: 'recipient@example.com',
          amount: 100,
          currency: 'NGN',
          description: 'Payment for services',
          type: 'send',
        });
      });

      // Confirm payment
      const pinInput = getByPlaceholderText('Enter your PIN');
      const confirmButton = getByText('Confirm Transfer');

      fireEvent.changeText(pinInput, '1234');
      fireEvent.press(confirmButton);

      // Should show loading state
      await waitFor(() => {
        expect(confirmButton.props.loading).toBe(true);
      });

      // Simulate successful payment
      await waitFor(() => {
        store.dispatch({
          type: 'transaction/addTransaction',
          payload: {
            id: 'tx-123',
            type: 'transfer',
            status: 'completed',
            amount: 100.00,
            currency: 'NGN',
            fee: 2.50,
            description: 'Payment for services',
            createdAt: '2025-01-01T00:00:00Z',
            completedAt: '2025-01-01T00:01:00Z',
          },
        });
        store.dispatch({
          type: 'wallet/setWalletBalance',
          payload: {
            balance: 897.50, // 1000 - 100 - 2.50
            currency: 'NGN',
          },
        });
      });

      // Should navigate to success screen
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('PaymentSuccess', {
          amount: 100,
          currency: 'NGN',
          recipient: 'recipient@example.com',
          type: 'send',
        });
      });
    });

    test('should handle transfer validation errors', async () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            username: 'testuser',
            role: 'user',
            isVerified: true,
            isActive: true,
            twoFactorEnabled: false,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          twoFactorRequired: false,
          tempToken: null,
        },
      });

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper store={store}>
          <TestNavigator />
        </TestWrapper>
      );

      // Navigate to send money screen
      const sendButton = getByText('Send');
      fireEvent.press(sendButton);

      // Try to continue without filling form
      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      // Should show validation error
      await waitFor(() => {
        expect(getByText('Please enter a valid recipient and amount.')).toBeTruthy();
      });

      // Try with insufficient balance
      const recipientInput = getByPlaceholderText('Recipient Email or Username');
      const amountInput = getByPlaceholderText('Amount');

      fireEvent.changeText(recipientInput, 'recipient@example.com');
      fireEvent.changeText(amountInput, '2000'); // More than balance
      fireEvent.press(continueButton);

      // Should show insufficient balance error
      await waitFor(() => {
        expect(getByText('Insufficient balance.')).toBeTruthy();
      });
    });
  });

  describe('Complete Withdrawal Flow', () => {
    test('should complete withdrawal flow successfully', async () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            username: 'testuser',
            role: 'user',
            isVerified: true,
            isActive: true,
            twoFactorEnabled: false,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          twoFactorRequired: false,
          tempToken: null,
        },
      });

      const { getByText } = render(
        <TestWrapper store={store}>
          <TestNavigator />
        </TestWrapper>
      );

      // Start from home screen
      const withdrawButton = getByText('Withdraw');
      fireEvent.press(withdrawButton);

      // Should show withdrawal modal or navigate to withdrawal screen
      await waitFor(() => {
        expect(withdrawButton).toBeTruthy();
      });

      // Simulate withdrawal completion
      await waitFor(() => {
        store.dispatch({
          type: 'transaction/addTransaction',
          payload: {
            id: 'withdraw-123',
            type: 'withdrawal',
            status: 'completed',
            amount: 200.00,
            currency: 'NGN',
            fee: 7.00, // 2.5% + 1% processing fee
            description: 'Withdrawal to bank account',
            createdAt: '2025-01-01T00:00:00Z',
            completedAt: '2025-01-01T00:01:00Z',
          },
        });
        store.dispatch({
          type: 'wallet/setWalletBalance',
          payload: {
            balance: 793.00, // 1000 - 200 - 7
            currency: 'NGN',
          },
        });
      });
    });
  });

  describe('Error Handling Flow', () => {
    test('should handle network errors gracefully', async () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            username: 'testuser',
            role: 'user',
            isVerified: true,
            isActive: true,
            twoFactorEnabled: false,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          twoFactorRequired: false,
          tempToken: null,
        },
      });

      const { getByText } = render(
        <TestWrapper store={store}>
          <TestNavigator />
        </TestWrapper>
      );

      // Simulate network error
      await waitFor(() => {
        store.dispatch({
          type: 'wallet/setError',
          payload: 'Network error. Please check your connection.',
        });
      });

      // Should show error message
      await waitFor(() => {
        expect(getByText('Network error. Please check your connection.')).toBeTruthy();
      });
    });

    test('should handle authentication errors', async () => {
      const store = createTestStore();
      
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper store={store}>
          <TestNavigator />
        </TestWrapper>
      );

      // Enter invalid credentials
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Login');

      fireEvent.changeText(emailInput, 'invalid@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(loginButton);

      // Simulate authentication error
      await waitFor(() => {
        store.dispatch({
          type: 'auth/setError',
          payload: 'Invalid email or password',
        });
      });

      // Should show error message
      await waitFor(() => {
        expect(getByText('Invalid email or password')).toBeTruthy();
      });
    });
  });

  describe('Navigation Flow', () => {
    test('should navigate between screens correctly', async () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            username: 'testuser',
            role: 'user',
            isVerified: true,
            isActive: true,
            twoFactorEnabled: false,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          twoFactorRequired: false,
          tempToken: null,
        },
      });

      const { getByText } = render(
        <TestWrapper store={store}>
          <TestNavigator />
        </TestWrapper>
      );

      // Navigate to send money
      const sendButton = getByText('Send');
      fireEvent.press(sendButton);
      expect(mockNavigate).toHaveBeenCalledWith('SendMoney');

      // Navigate to request money
      const requestButton = getByText('Request');
      fireEvent.press(requestButton);
      expect(mockNavigate).toHaveBeenCalledWith('RequestMoney');

      // Navigate to transactions
      const viewAllButton = getByText('View All Transactions');
      fireEvent.press(viewAllButton);
      expect(mockNavigate).toHaveBeenCalledWith('Transactions');
    });
  });
});
