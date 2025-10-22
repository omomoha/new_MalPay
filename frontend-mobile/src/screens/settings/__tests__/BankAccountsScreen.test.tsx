import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import BankAccountsScreen from '../BankAccountsScreen';
import { authSlice } from '@store/slices/authSlice';
import { walletSlice } from '@store/slices/walletSlice';

// Mock fetch
global.fetch = jest.fn();

// Mock Alert
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
  };
});

// Mock BankSelectionModal
jest.mock('@components/BankSelectionModal', () => {
  return function MockBankSelectionModal({ visible, onDismiss, onSelectBank }: any) {
    if (!visible) return null;
    return (
      <div data-testid="bank-selection-modal">
        <button onClick={() => onSelectBank({ code: '044', name: 'Access Bank' })}>
          Select Access Bank
        </button>
        <button onClick={onDismiss}>Close</button>
      </div>
    );
  };
});

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      wallet: walletSlice.reducer,
    },
    preloadedState: {
      auth: {
        user: { id: 'user123', email: 'test@example.com' },
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
        isAuthenticated: true,
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
    },
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <NavigationContainer>
        {component}
      </NavigationContainer>
    </Provider>
  );
};

describe('BankAccountsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render empty state when no bank accounts', () => {
    const { getByText } = renderWithProviders(<BankAccountsScreen />);
    
    expect(getByText('No Bank Accounts')).toBeTruthy();
    expect(getByText('Add your bank accounts to enable withdrawals and transfers')).toBeTruthy();
    expect(getByText('Add Bank Account')).toBeTruthy();
  });

  it('should show add form when FAB is pressed', () => {
    const { getByText, getByTestId } = renderWithProviders(<BankAccountsScreen />);
    
    const fab = getByTestId('fab');
    fireEvent.press(fab);
    
    expect(getByText('Add Bank Account')).toBeTruthy();
    expect(getByText('Enter Account Number')).toBeTruthy();
    expect(getByText('Select Bank')).toBeTruthy();
  });

  it('should validate account number input', async () => {
    const { getByText, getByTestId, getByPlaceholderText } = renderWithProviders(<BankAccountsScreen />);
    
    // Open add form
    const fab = getByTestId('fab');
    fireEvent.press(fab);
    
    const accountNumberInput = getByPlaceholderText('1234567890');
    const verifyButton = getByText('Verify Account');
    
    // Test with invalid account number (too short)
    fireEvent.changeText(accountNumberInput, '123');
    expect(verifyButton.props.disabled).toBe(true);
    
    // Test with valid account number
    fireEvent.changeText(accountNumberInput, '1234567890');
    expect(verifyButton.props.disabled).toBe(true); // Still disabled because no bank selected
  });

  it('should open bank selection modal when bank input is pressed', () => {
    const { getByText, getByTestId } = renderWithProviders(<BankAccountsScreen />);
    
    // Open add form
    const fab = getByTestId('fab');
    fireEvent.press(fab);
    
    const bankInput = getByText('Tap to select bank');
    fireEvent.press(bankInput);
    
    expect(getByTestId('bank-selection-modal')).toBeTruthy();
  });

  it('should handle bank selection', () => {
    const { getByText, getByTestId } = renderWithProviders(<BankAccountsScreen />);
    
    // Open add form
    const fab = getByTestId('fab');
    fireEvent.press(fab);
    
    // Open bank selection modal
    const bankInput = getByText('Tap to select bank');
    fireEvent.press(bankInput);
    
    // Select bank
    const selectBankButton = getByText('Select Access Bank');
    fireEvent.press(selectBankButton);
    
    // Verify bank is selected
    expect(getByText('Access Bank')).toBeTruthy();
  });

  it('should call verification API when verify button is pressed', async () => {
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        data: {
          accountName: 'John Doe',
          bankName: 'Access Bank',
          accountNumber: '1234567890',
          bankCode: '044',
        },
      }),
    });

    const { getByText, getByTestId, getByPlaceholderText } = renderWithProviders(<BankAccountsScreen />);
    
    // Open add form
    const fab = getByTestId('fab');
    fireEvent.press(fab);
    
    // Fill form
    const accountNumberInput = getByPlaceholderText('1234567890');
    fireEvent.changeText(accountNumberInput, '1234567890');
    
    // Select bank
    const bankInput = getByText('Tap to select bank');
    fireEvent.press(bankInput);
    const selectBankButton = getByText('Select Access Bank');
    fireEvent.press(selectBankButton);
    
    // Verify account
    const verifyButton = getByText('Verify Account');
    fireEvent.press(verifyButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/bank-accounts/verify'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accountNumber: '1234567890',
            bankCode: '044',
          }),
        })
      );
    });
  });

  it('should show confirmation screen after successful verification', async () => {
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        data: {
          accountName: 'John Doe',
          bankName: 'Access Bank',
          accountNumber: '1234567890',
          bankCode: '044',
        },
      }),
    });

    const { getByText, getByTestId, getByPlaceholderText } = renderWithProviders(<BankAccountsScreen />);
    
    // Open add form
    const fab = getByTestId('fab');
    fireEvent.press(fab);
    
    // Fill form
    const accountNumberInput = getByPlaceholderText('1234567890');
    fireEvent.changeText(accountNumberInput, '1234567890');
    
    // Select bank
    const bankInput = getByText('Tap to select bank');
    fireEvent.press(bankInput);
    const selectBankButton = getByText('Select Access Bank');
    fireEvent.press(selectBankButton);
    
    // Verify account
    const verifyButton = getByText('Verify Account');
    fireEvent.press(verifyButton);
    
    await waitFor(() => {
      expect(getByText('Confirm Bank Account')).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Access Bank')).toBeTruthy();
      expect(getByText('••••7890')).toBeTruthy();
    });
  });

  it('should handle verification API error', async () => {
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: false,
        error: 'Account verification failed',
      }),
    });

    const { getByText, getByTestId, getByPlaceholderText } = renderWithProviders(<BankAccountsScreen />);
    
    // Open add form
    const fab = getByTestId('fab');
    fireEvent.press(fab);
    
    // Fill form
    const accountNumberInput = getByPlaceholderText('1234567890');
    fireEvent.changeText(accountNumberInput, '1234567890');
    
    // Select bank
    const bankInput = getByText('Tap to select bank');
    fireEvent.press(bankInput);
    const selectBankButton = getByText('Select Access Bank');
    fireEvent.press(selectBankButton);
    
    // Verify account
    const verifyButton = getByText('Verify Account');
    fireEvent.press(verifyButton);
    
    await waitFor(() => {
      expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
        'Verification Failed',
        'Account verification failed'
      );
    });
  });

  it('should call add account API when confirm button is pressed', async () => {
    const mockFetch = global.fetch as jest.Mock;
    
    // Mock verification response
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        data: {
          accountName: 'John Doe',
          bankName: 'Access Bank',
          accountNumber: '1234567890',
          bankCode: '044',
        },
      }),
    });
    
    // Mock add account response
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        data: { id: 'account123' },
      }),
    });

    const { getByText, getByTestId, getByPlaceholderText } = renderWithProviders(<BankAccountsScreen />);
    
    // Open add form
    const fab = getByTestId('fab');
    fireEvent.press(fab);
    
    // Fill form
    const accountNumberInput = getByPlaceholderText('1234567890');
    fireEvent.changeText(accountNumberInput, '1234567890');
    
    // Select bank
    const bankInput = getByText('Tap to select bank');
    fireEvent.press(bankInput);
    const selectBankButton = getByText('Select Access Bank');
    fireEvent.press(selectBankButton);
    
    // Verify account
    const verifyButton = getByText('Verify Account');
    fireEvent.press(verifyButton);
    
    await waitFor(() => {
      expect(getByText('Confirm Bank Account')).toBeTruthy();
    });
    
    // Confirm account
    const confirmButton = getByText('Confirm & Add Account');
    fireEvent.press(confirmButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/bank-accounts'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: JSON.stringify({
            accountNumber: '1234567890',
            bankCode: '044',
            accountName: 'John Doe',
            accountType: 'savings',
            isPrimary: false,
          }),
        })
      );
    });
  });

  it('should handle add account API error', async () => {
    const mockFetch = global.fetch as jest.Mock;
    
    // Mock verification response
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        data: {
          accountName: 'John Doe',
          bankName: 'Access Bank',
          accountNumber: '1234567890',
          bankCode: '044',
        },
      }),
    });
    
    // Mock add account error response
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: false,
        error: 'Failed to add bank account',
      }),
    });

    const { getByText, getByTestId, getByPlaceholderText } = renderWithProviders(<BankAccountsScreen />);
    
    // Complete verification flow
    const fab = getByTestId('fab');
    fireEvent.press(fab);
    
    const accountNumberInput = getByPlaceholderText('1234567890');
    fireEvent.changeText(accountNumberInput, '1234567890');
    
    const bankInput = getByText('Tap to select bank');
    fireEvent.press(bankInput);
    const selectBankButton = getByText('Select Access Bank');
    fireEvent.press(selectBankButton);
    
    const verifyButton = getByText('Verify Account');
    fireEvent.press(verifyButton);
    
    await waitFor(() => {
      expect(getByText('Confirm Bank Account')).toBeTruthy();
    });
    
    // Confirm account
    const confirmButton = getByText('Confirm & Add Account');
    fireEvent.press(confirmButton);
    
    await waitFor(() => {
      expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to add bank account'
      );
    });
  });

  it('should cancel verification and return to form', async () => {
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        data: {
          accountName: 'John Doe',
          bankName: 'Access Bank',
          accountNumber: '1234567890',
          bankCode: '044',
        },
      }),
    });

    const { getByText, getByTestId, getByPlaceholderText } = renderWithProviders(<BankAccountsScreen />);
    
    // Complete verification flow
    const fab = getByTestId('fab');
    fireEvent.press(fab);
    
    const accountNumberInput = getByPlaceholderText('1234567890');
    fireEvent.changeText(accountNumberInput, '1234567890');
    
    const bankInput = getByText('Tap to select bank');
    fireEvent.press(bankInput);
    const selectBankButton = getByText('Select Access Bank');
    fireEvent.press(selectBankButton);
    
    const verifyButton = getByText('Verify Account');
    fireEvent.press(verifyButton);
    
    await waitFor(() => {
      expect(getByText('Confirm Bank Account')).toBeTruthy();
    });
    
    // Cancel verification
    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);
    
    // Should return to add form
    expect(getByText('Add Bank Account')).toBeTruthy();
    expect(getByText('Enter Account Number')).toBeTruthy();
  });
});
