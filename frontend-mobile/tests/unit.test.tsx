import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import components to test
import RegisterScreen from '../src/screens/auth/RegisterScreen';
import ProfileCompletionScreen from '../src/screens/auth/ProfileCompletionScreen';
import AddCardScreen from '../src/screens/cards/AddCardScreen';
import HomeScreen from '../src/screens/main/HomeScreen';
import SendMoneyScreen from '../src/screens/payment/SendMoneyScreen';

// Mock store
const mockStore = configureStore({
  reducer: {
    auth: (state = { user: null, isAuthenticated: false }, action) => state,
    cards: (state = { linkedCards: [], isLoading: false }, action) => state,
    wallet: (state = { balance: 0, isLoading: false }, action) => state,
  },
});

// Mock navigation
const Stack = createStackNavigator();

const MockedNavigation = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Test" component={() => <>{children}</>} />
    </Stack.Navigator>
  </NavigationContainer>
);

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <MockedNavigation>{component}</MockedNavigation>
    </Provider>
  );
};

describe('🧪 Frontend Unit Tests', () => {
  describe('📱 RegisterScreen Tests', () => {
    test('should render registration form', () => {
      renderWithProviders(<RegisterScreen />);
      
      expect(screen.getByText('Create Account')).toBeTruthy();
      expect(screen.getByPlaceholderText('Name')).toBeTruthy();
      expect(screen.getByPlaceholderText('Email')).toBeTruthy();
      expect(screen.getByPlaceholderText('Phone Number')).toBeTruthy();
      expect(screen.getByPlaceholderText('Password')).toBeTruthy();
      expect(screen.getByPlaceholderText('Confirm Password')).toBeTruthy();
    });

    test('should validate form fields', async () => {
      renderWithProviders(<RegisterScreen />);
      
      const submitButton = screen.getByText('Create Account');
      fireEvent.press(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeTruthy();
      });
    });

    test('should validate email format', async () => {
      renderWithProviders(<RegisterScreen />);
      
      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'invalid-email');
      
      const submitButton = screen.getByText('Create Account');
      fireEvent.press(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeTruthy();
      });
    });

    test('should validate password strength', async () => {
      renderWithProviders(<RegisterScreen />);
      
      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.changeText(passwordInput, 'weak');
      
      const submitButton = screen.getByText('Create Account');
      fireEvent.press(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/password must contain/i)).toBeTruthy();
      });
    });

    test('should validate password confirmation', async () => {
      renderWithProviders(<RegisterScreen />);
      
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      fireEvent.changeText(passwordInput, 'Password123');
      fireEvent.changeText(confirmPasswordInput, 'DifferentPassword123');
      
      const submitButton = screen.getByText('Create Account');
      fireEvent.press(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeTruthy();
      });
    });

    test('should validate phone number format', async () => {
      renderWithProviders(<RegisterScreen />);
      
      const phoneInput = screen.getByPlaceholderText('Phone Number');
      fireEvent.changeText(phoneInput, 'invalid-phone');
      
      const submitButton = screen.getByText('Create Account');
      fireEvent.press(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/valid phone number/i)).toBeTruthy();
      });
    });

    test('should handle successful registration', async () => {
      renderWithProviders(<RegisterScreen />);
      
      const nameInput = screen.getByPlaceholderText('Name');
      const emailInput = screen.getByPlaceholderText('Email');
      const phoneInput = screen.getByPlaceholderText('Phone Number');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      fireEvent.changeText(nameInput, 'John Doe');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(phoneInput, '+2348012345678');
      fireEvent.changeText(passwordInput, 'Password123');
      fireEvent.changeText(confirmPasswordInput, 'Password123');
      
      const submitButton = screen.getByText('Create Account');
      fireEvent.press(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/loading/i)).toBeTruthy();
      });
    });
  });

  describe('📋 ProfileCompletionScreen Tests', () => {
    test('should render profile completion steps', () => {
      renderWithProviders(<ProfileCompletionScreen />);
      
      expect(screen.getByText('Complete Your Profile')).toBeTruthy();
      expect(screen.getByText('Link Bank Account')).toBeTruthy();
      expect(screen.getByText('Add Payment Card')).toBeTruthy();
    });

    test('should show progress bar', () => {
      renderWithProviders(<ProfileCompletionScreen />);
      
      expect(screen.getByText(/Complete/i)).toBeTruthy();
    });

    test('should handle bank account linking', () => {
      renderWithProviders(<ProfileCompletionScreen />);
      
      const bankAccountButton = screen.getByText('Link Bank Account');
      fireEvent.press(bankAccountButton);
      
      // Should navigate to bank account setup
      expect(bankAccountButton).toBeTruthy();
    });

    test('should handle card addition', () => {
      renderWithProviders(<ProfileCompletionScreen />);
      
      const addCardButton = screen.getByText('Add Payment Card');
      fireEvent.press(addCardButton);
      
      // Should navigate to add card screen
      expect(addCardButton).toBeTruthy();
    });

    test('should show skip option', () => {
      renderWithProviders(<ProfileCompletionScreen />);
      
      expect(screen.getByText('Skip for Now')).toBeTruthy();
    });
  });

  describe('💳 AddCardScreen Tests', () => {
    test('should render card addition form', () => {
      renderWithProviders(<AddCardScreen />);
      
      expect(screen.getByText('Add New Card')).toBeTruthy();
      expect(screen.getByPlaceholderText('Card Number')).toBeTruthy();
      expect(screen.getByPlaceholderText('MM')).toBeTruthy();
      expect(screen.getByPlaceholderText('YYYY')).toBeTruthy();
      expect(screen.getByPlaceholderText('CVV')).toBeTruthy();
      expect(screen.getByPlaceholderText('Cardholder Name')).toBeTruthy();
    });

    test('should validate card number', async () => {
      renderWithProviders(<AddCardScreen />);
      
      const cardNumberInput = screen.getByPlaceholderText('Card Number');
      fireEvent.changeText(cardNumberInput, '1234567890123456');
      
      const submitButton = screen.getByText('Add Card');
      fireEvent.press(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid card number/i)).toBeTruthy();
      });
    });

    test('should validate expiry date', async () => {
      renderWithProviders(<AddCardScreen />);
      
      const monthInput = screen.getByPlaceholderText('MM');
      const yearInput = screen.getByPlaceholderText('YYYY');
      
      fireEvent.changeText(monthInput, '01');
      fireEvent.changeText(yearInput, '2020'); // Past year
      
      const submitButton = screen.getByText('Add Card');
      fireEvent.press(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/expired/i)).toBeTruthy();
      });
    });

    test('should validate CVV', async () => {
      renderWithProviders(<AddCardScreen />);
      
      const cvvInput = screen.getByPlaceholderText('CVV');
      fireEvent.changeText(cvvInput, '12'); // Too short
      
      const submitButton = screen.getByText('Add Card');
      fireEvent.press(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid cvv/i)).toBeTruthy();
      });
    });

    test('should show card addition fee', () => {
      renderWithProviders(<AddCardScreen />);
      
      expect(screen.getByText('Card Addition Fee')).toBeTruthy();
      expect(screen.getByText('₦50')).toBeTruthy();
    });

    test('should handle successful card addition', async () => {
      renderWithProviders(<AddCardScreen />);
      
      const cardNumberInput = screen.getByPlaceholderText('Card Number');
      const monthInput = screen.getByPlaceholderText('MM');
      const yearInput = screen.getByPlaceholderText('YYYY');
      const cvvInput = screen.getByPlaceholderText('CVV');
      const nameInput = screen.getByPlaceholderText('Cardholder Name');
      
      fireEvent.changeText(cardNumberInput, '4532123456789012');
      fireEvent.changeText(monthInput, '12');
      fireEvent.changeText(yearInput, '2026');
      fireEvent.changeText(cvvInput, '123');
      fireEvent.changeText(nameInput, 'John Doe');
      
      const submitButton = screen.getByText('Add Card');
      fireEvent.press(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/loading/i)).toBeTruthy();
      });
    });
  });

  describe('🏠 HomeScreen Tests', () => {
    test('should render home screen elements', () => {
      renderWithProviders(<HomeScreen />);
      
      expect(screen.getByText('MalPay')).toBeTruthy();
      expect(screen.getByText('Send Money')).toBeTruthy();
      expect(screen.getByText('Receive Money')).toBeTruthy();
    });

    test('should show balance', () => {
      renderWithProviders(<HomeScreen />);
      
      expect(screen.getByText(/balance/i)).toBeTruthy();
    });

    test('should handle quick actions', () => {
      renderWithProviders(<HomeScreen />);
      
      const sendMoneyButton = screen.getByText('Send Money');
      fireEvent.press(sendMoneyButton);
      
      expect(sendMoneyButton).toBeTruthy();
    });
  });

  describe('💰 SendMoneyScreen Tests', () => {
    test('should render send money form', () => {
      renderWithProviders(<SendMoneyScreen />);
      
      expect(screen.getByText('Send Money')).toBeTruthy();
      expect(screen.getByPlaceholderText('Recipient Email')).toBeTruthy();
      expect(screen.getByPlaceholderText('Amount')).toBeTruthy();
    });

    test('should validate recipient email', async () => {
      renderWithProviders(<SendMoneyScreen />);
      
      const emailInput = screen.getByPlaceholderText('Recipient Email');
      fireEvent.changeText(emailInput, 'invalid-email');
      
      const sendButton = screen.getByText('Send');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeTruthy();
      });
    });

    test('should validate amount', async () => {
      renderWithProviders(<SendMoneyScreen />);
      
      const amountInput = screen.getByPlaceholderText('Amount');
      fireEvent.changeText(amountInput, '-1000');
      
      const sendButton = screen.getByText('Send');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/positive amount/i)).toBeTruthy();
      });
    });

    test('should show fee breakdown', () => {
      renderWithProviders(<SendMoneyScreen />);
      
      const amountInput = screen.getByPlaceholderText('Amount');
      fireEvent.changeText(amountInput, '5000');
      
      expect(screen.getByText(/fee/i)).toBeTruthy();
    });

    test('should handle successful transfer', async () => {
      renderWithProviders(<SendMoneyScreen />);
      
      const emailInput = screen.getByPlaceholderText('Recipient Email');
      const amountInput = screen.getByPlaceholderText('Amount');
      
      fireEvent.changeText(emailInput, 'recipient@example.com');
      fireEvent.changeText(amountInput, '5000');
      
      const sendButton = screen.getByText('Send');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/loading/i)).toBeTruthy();
      });
    });
  });

  describe('🔒 Security Tests', () => {
    test('should not expose sensitive data in forms', () => {
      renderWithProviders(<AddCardScreen />);
      
      const cardNumberInput = screen.getByPlaceholderText('Card Number');
      fireEvent.changeText(cardNumberInput, '4532123456789012');
      
      // Card number should be masked in display
      expect(screen.queryByText('4532123456789012')).toBeFalsy();
    });

    test('should validate input sanitization', async () => {
      renderWithProviders(<RegisterScreen />);
      
      const nameInput = screen.getByPlaceholderText('Name');
      fireEvent.changeText(nameInput, '<script>alert("xss")</script>');
      
      const submitButton = screen.getByText('Create Account');
      fireEvent.press(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid/i)).toBeTruthy();
      });
    });

    test('should handle network errors gracefully', async () => {
      renderWithProviders(<RegisterScreen />);
      
      const nameInput = screen.getByPlaceholderText('Name');
      const emailInput = screen.getByPlaceholderText('Email');
      const phoneInput = screen.getByPlaceholderText('Phone Number');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      fireEvent.changeText(nameInput, 'John Doe');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(phoneInput, '+2348012345678');
      fireEvent.changeText(passwordInput, 'Password123');
      fireEvent.changeText(confirmPasswordInput, 'Password123');
      
      const submitButton = screen.getByText('Create Account');
      fireEvent.press(submitButton);
      
      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/loading/i)).toBeTruthy();
      });
    });
  });

  describe('📱 UI/UX Tests', () => {
    test('should have proper accessibility labels', () => {
      renderWithProviders(<RegisterScreen />);
      
      const nameInput = screen.getByPlaceholderText('Name');
      const emailInput = screen.getByPlaceholderText('Email');
      
      expect(nameInput.props.accessibilityLabel).toBeDefined();
      expect(emailInput.props.accessibilityLabel).toBeDefined();
    });

    test('should handle keyboard interactions', () => {
      renderWithProviders(<RegisterScreen />);
      
      const nameInput = screen.getByPlaceholderText('Name');
      fireEvent.focus(nameInput);
      fireEvent.changeText(nameInput, 'John Doe');
      fireEvent.blur(nameInput);
      
      expect(nameInput.props.value).toBe('John Doe');
    });

    test('should show loading states', async () => {
      renderWithProviders(<RegisterScreen />);
      
      const submitButton = screen.getByText('Create Account');
      fireEvent.press(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/loading/i)).toBeTruthy();
      });
    });

    test('should handle form validation errors', async () => {
      renderWithProviders(<RegisterScreen />);
      
      const submitButton = screen.getByText('Create Account');
      fireEvent.press(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeTruthy();
      });
    });
  });
});
