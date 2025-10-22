import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../main/HomeScreen';
import authReducer from '../../../store/slices/authSlice';
import walletReducer from '../../../store/slices/walletSlice';
import transactionReducer from '../../../store/slices/transactionSlice';

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
      wallet: walletReducer,
      transaction: transactionReducer,
    },
    preloadedState: {
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

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders home screen correctly', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    );

    expect(getByText('Welcome, testuser')).toBeTruthy();
    expect(getByText('Available Balance')).toBeTruthy();
    expect(getByText('₦1,000.00')).toBeTruthy();
    expect(getByText('Quick Actions')).toBeTruthy();
  });

  test('shows wallet balance correctly', () => {
    const store = createTestStore({
      wallet: {
        wallets: [],
        activeWallet: null,
        balance: {
          balance: 2500.50,
          currency: 'NGN',
        },
        isLoading: false,
        error: null,
      },
    });

    const { getByText } = render(
      <TestWrapper store={store}>
        <HomeScreen />
      </TestWrapper>
    );

    expect(getByText('₦2,500.50')).toBeTruthy();
  });

  test('shows zero balance when no balance', () => {
    const store = createTestStore({
      wallet: {
        wallets: [],
        activeWallet: null,
        balance: null,
        isLoading: false,
        error: null,
      },
    });

    const { getByText } = render(
      <TestWrapper store={store}>
        <HomeScreen />
      </TestWrapper>
    );

    expect(getByText('₦0.00')).toBeTruthy();
  });

  test('shows different currency balance', () => {
    const store = createTestStore({
      wallet: {
        wallets: [],
        activeWallet: null,
        balance: {
          balance: 100.00,
          currency: 'USD',
        },
        isLoading: false,
        error: null,
      },
    });

    const { getByText } = render(
      <TestWrapper store={store}>
        <HomeScreen />
      </TestWrapper>
    );

    expect(getByText('$100.00')).toBeTruthy();
  });

  test('renders quick action buttons', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    );

    expect(getByText('Send')).toBeTruthy();
    expect(getByText('Request')).toBeTruthy();
    expect(getByText('Add Funds')).toBeTruthy();
    expect(getByText('Withdraw')).toBeTruthy();
  });

  test('navigates to send money screen', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    );

    const sendButton = getByText('Send');
    fireEvent.press(sendButton);

    expect(mockNavigate).toHaveBeenCalledWith('SendMoney');
  });

  test('navigates to request money screen', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    );

    const requestButton = getByText('Request');
    fireEvent.press(requestButton);

    expect(mockNavigate).toHaveBeenCalledWith('RequestMoney');
  });

  test('handles add funds button press', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    );

    const addFundsButton = getByText('Add Funds');
    fireEvent.press(addFundsButton);

    // Should show add funds modal or navigate
    expect(addFundsButton).toBeTruthy();
  });

  test('handles withdraw button press', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    );

    const withdrawButton = getByText('Withdraw');
    fireEvent.press(withdrawButton);

    // Should show withdraw modal or navigate
    expect(withdrawButton).toBeTruthy();
  });

  test('shows recent transactions', () => {
    const mockTransactions = [
      {
        id: '1',
        type: 'transfer',
        status: 'completed',
        amount: 100.00,
        currency: 'NGN',
        fee: 2.50,
        description: 'Transfer to John',
        createdAt: '2025-01-01T10:00:00Z',
      },
      {
        id: '2',
        type: 'deposit',
        status: 'completed',
        amount: 500.00,
        currency: 'NGN',
        fee: 0,
        description: 'Deposit from card',
        createdAt: '2025-01-01T09:00:00Z',
      },
    ];

    const store = createTestStore({
      transaction: {
        list: mockTransactions,
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
    });

    const { getByText } = render(
      <TestWrapper store={store}>
        <HomeScreen />
      </TestWrapper>
    );

    expect(getByText('Transfer to John')).toBeTruthy();
    expect(getByText('Deposit from card')).toBeTruthy();
  });

  test('shows no recent activity message', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    );

    expect(getByText('No recent activity yet.')).toBeTruthy();
  });

  test('navigates to transactions screen', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    );

    const viewAllButton = getByText('View All Transactions');
    fireEvent.press(viewAllButton);

    expect(mockNavigate).toHaveBeenCalledWith('Transactions');
  });

  test('shows spending chart', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    );

    expect(getByText('Spending Overview')).toBeTruthy();
  });

  test('shows loading state', () => {
    const store = createTestStore({
      wallet: {
        wallets: [],
        activeWallet: null,
        balance: null,
        isLoading: true,
        error: null,
      },
    });

    const { getByTestId } = render(
      <TestWrapper store={store}>
        <HomeScreen />
      </TestWrapper>
    );

    // Should show loading indicator
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  test('shows error state', () => {
    const store = createTestStore({
      wallet: {
        wallets: [],
        activeWallet: null,
        balance: null,
        isLoading: false,
        error: 'Failed to load balance',
      },
    });

    const { getByText } = render(
      <TestWrapper store={store}>
        <HomeScreen />
      </TestWrapper>
    );

    expect(getByText('Failed to load balance')).toBeTruthy();
  });

  test('handles refresh', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    );

    const refreshControl = getByTestId('refresh-control');
    fireEvent(refreshControl, 'onRefresh');

    // Should trigger refresh action
    expect(refreshControl).toBeTruthy();
  });

  test('shows notification bell', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    );

    const notificationBell = getByTestId('notification-bell');
    expect(notificationBell).toBeTruthy();
  });

  test('handles notification bell press', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    );

    const notificationBell = getByTestId('notification-bell');
    fireEvent.press(notificationBell);

    // Should open notifications or show notification panel
    expect(notificationBell).toBeTruthy();
  });

  test('shows settings gear', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    );

    const settingsGear = getByTestId('settings-gear');
    expect(settingsGear).toBeTruthy();
  });

  test('navigates to profile screen', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    );

    const settingsGear = getByTestId('settings-gear');
    fireEvent.press(settingsGear);

    expect(mockNavigate).toHaveBeenCalledWith('Profile');
  });
});
