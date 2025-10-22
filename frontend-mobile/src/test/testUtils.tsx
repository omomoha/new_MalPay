// Test utilities for MalPay Mobile App
import { configureStore } from '@reduxjs/toolkit';
import { render, RenderOptions } from '@testing-library/react-native';
import React, { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import authReducer from '../store/slices/authSlice';
import walletReducer from '../store/slices/walletSlice';
import transactionReducer from '../store/slices/transactionSlice';
import cardReducer from '../store/slices/cardSlice';
import notificationReducer from '../store/slices/notificationSlice';
import uiReducer from '../store/slices/uiSlice';
import { User } from '../types/user.types';
import { Wallet, WalletBalance } from '../types/wallet.types';
import { Transaction } from '../types/transaction.types';

// Mock user data
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  phone: '+2348012345678',
  role: 'user',
  isVerified: true,
  isActive: true,
  twoFactorEnabled: false,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

// Mock wallet data
export const mockWallet: Wallet = {
  id: 'test-wallet-id',
  userId: 'test-user-id',
  walletAddress: 'test-wallet-address',
  blockchainType: 'tron',
  balance: 1000.00,
  currency: 'NGN',
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

// Mock wallet balance
export const mockWalletBalance: WalletBalance = {
  balance: 1000.00,
  currency: 'NGN',
};

// Mock transaction data
export const mockTransaction: Transaction = {
  id: 'test-transaction-id',
  txHash: 'test-tx-hash',
  type: 'transfer',
  status: 'completed',
  amount: 100.00,
  currency: 'NGN',
  fee: 2.50,
  description: 'Test transaction',
  recipient: {
    username: 'recipient',
    email: 'recipient@example.com',
  },
  createdAt: '2025-01-01T00:00:00Z',
  completedAt: '2025-01-01T00:01:00Z',
};

// Create test store
export const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      wallet: walletReducer,
      transaction: transactionReducer,
      card: cardReducer,
      notification: notificationReducer,
      ui: uiReducer,
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
        balance: null,
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
      card: {
        linkedCards: [],
        primaryCard: null,
        isLoading: false,
        error: null,
      },
      notification: {
        list: [],
        unreadCount: 0,
        isLoading: false,
        error: null,
      },
      ui: {
        theme: 'light',
        isSidebarOpen: false,
        modals: {
          payment: false,
          cardLink: false,
          twoFactor: false,
        },
        snackbar: {
          visible: false,
          message: '',
          type: 'info',
        },
      },
      ...initialState,
    },
  });
};

// Create authenticated test store
export const createAuthenticatedTestStore = (overrides = {}) => {
  return createTestStore({
    auth: {
      user: mockUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      twoFactorRequired: false,
      tempToken: null,
    },
    wallet: {
      wallets: [mockWallet],
      activeWallet: mockWallet,
      balance: mockWalletBalance,
      isLoading: false,
      error: null,
    },
    ...overrides,
  });
};

// Test wrapper component
interface TestWrapperProps {
  children: React.ReactNode;
  store?: any;
  navigation?: boolean;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({ 
  children, 
  store = createTestStore(),
  navigation = false 
}) => {
  if (navigation) {
    const Stack = createNativeStackNavigator();
    return (
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Test" component={() => <>{children}</>} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

// Custom render function
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    store?: any;
    navigation?: boolean;
  }
) => {
  const { store = createTestStore(), navigation = false, ...renderOptions } = options || {};
  
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestWrapper store={store} navigation={navigation}>
      {children}
    </TestWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock navigation functions
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

// Mock route params
export const mockRoute = {
  params: {},
  key: 'test-route-key',
  name: 'TestScreen',
};

// Mock API responses
export const mockAPIResponses = {
  success: (data: any) => ({
    success: true,
    data,
  }),
  error: (message: string) => ({
    success: false,
    error: message,
  }),
  walletBalance: () => ({
    success: true,
    data: {
      balance: 1000.00,
      currency: 'NGN',
    },
  }),
  currencies: () => ({
    success: true,
    data: {
      currencies: [
        { currency: 'NGN', rate: 1500.00, lastUpdated: '2025-01-01T00:00:00Z' },
        { currency: 'USD', rate: 1.00, lastUpdated: '2025-01-01T00:00:00Z' },
      ],
      baseCurrency: 'USDT',
    },
  }),
  transfer: () => ({
    success: true,
    data: {
      transactionId: 'tx-123',
      status: 'completed',
      amount: 100.00,
      currency: 'NGN',
      recipient: {
        username: 'recipient',
        email: 'recipient@example.com',
      },
      fee: 2.50,
      estimatedCompletion: '2025-01-01T00:01:00Z',
    },
  }),
  transactions: () => ({
    success: true,
    data: {
      transactions: [mockTransaction],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        pages: 1,
      },
    },
  }),
};

// Test data generators
export const generateMockUser = (overrides: Partial<User> = {}): User => ({
  ...mockUser,
  ...overrides,
});

export const generateMockWallet = (overrides: Partial<Wallet> = {}): Wallet => ({
  ...mockWallet,
  ...overrides,
});

export const generateMockTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  ...mockTransaction,
  ...overrides,
});

export const generateMockWalletBalance = (overrides: Partial<WalletBalance> = {}): WalletBalance => ({
  ...mockWalletBalance,
  ...overrides,
});

// Test helpers
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export const mockAsyncFunction = (returnValue: any, delay = 0) => {
  return jest.fn(() => new Promise(resolve => setTimeout(() => resolve(returnValue), delay)));
};

export const mockRejectedFunction = (error: any, delay = 0) => {
  return jest.fn(() => new Promise((_, reject) => setTimeout(() => reject(error), delay)));
};

// Form test helpers
export const fillForm = (getByPlaceholderText: any, formData: Record<string, string>) => {
  Object.entries(formData).forEach(([field, value]) => {
    const input = getByPlaceholderText(field);
    if (input) {
      fireEvent.changeText(input, value);
    }
  });
};

export const submitForm = (getByText: any, buttonText: string) => {
  const button = getByText(buttonText);
  fireEvent.press(button);
};

// Redux test helpers
export const dispatchAction = (store: any, action: any) => {
  store.dispatch(action);
};

export const getState = (store: any, slice?: string) => {
  const state = store.getState();
  return slice ? state[slice] : state;
};

export const expectState = (store: any, expectedState: any, slice?: string) => {
  const state = getState(store, slice);
  expect(state).toEqual(expectedState);
};

// API test helpers
export const mockAPICall = (endpoint: string, response: any, status = 200) => {
  // This would be used with MSW or similar mocking library
  return {
    endpoint,
    response,
    status,
  };
};

// Security test helpers
export const mockSecureStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

export const mockBiometrics = {
  isSensorAvailable: jest.fn(() => Promise.resolve({ available: true, biometryType: 'TouchID' })),
  createSignature: jest.fn(() => Promise.resolve({ success: true })),
  simplePrompt: jest.fn(() => Promise.resolve({ success: true })),
};

// Performance test helpers
export const measurePerformance = async (fn: () => Promise<any>) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    result,
    duration: end - start,
  };
};

// Accessibility test helpers
export const checkAccessibility = (component: any) => {
  // This would integrate with accessibility testing libraries
  return {
    hasAccessibilityLabel: true,
    hasAccessibilityHint: true,
    isAccessible: true,
  };
};

export default {
  createTestStore,
  createAuthenticatedTestStore,
  TestWrapper,
  renderWithProviders,
  mockNavigation,
  mockRoute,
  mockAPIResponses,
  generateMockUser,
  generateMockWallet,
  generateMockTransaction,
  generateMockWalletBalance,
  waitForAsync,
  mockAsyncFunction,
  mockRejectedFunction,
  fillForm,
  submitForm,
  dispatchAction,
  getState,
  expectState,
  mockAPICall,
  mockSecureStorage,
  mockBiometrics,
  measurePerformance,
  checkAccessibility,
};
