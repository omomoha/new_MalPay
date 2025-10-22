import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OTPVerificationScreen from '../../cards/OTPVerificationScreen';
import SendMoneyOTPScreen from '../SendMoneyOTPScreen';

const mockRoute = {
  params: {
    cardData: { cardNumber: '1234567890123456', expiryDate: '12/26', cvv: '123', cardholderName: 'John Doe' },
    cardType: 'visa',
    phoneNumber: '+234 801 234 5678',
    step: 'card_addition',
  },
};

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('OTPVerificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    const { getByText } = render(
      <OTPVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('Verify OTP')).toBeTruthy();
    expect(getByText('Enter Verification Code')).toBeTruthy();
  });

  test('handles OTP input correctly', () => {
    const { getByDisplayValue } = render(
      <OTPVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    // OTP inputs should be present
    expect(getByDisplayValue('')).toBeTruthy();
  });

  test('validates OTP length', async () => {
    const { getByText } = render(
      <OTPVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    const verifyButton = getByText('Verify OTP');
    fireEvent.press(verifyButton);

    await waitFor(() => {
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  test('handles resend OTP', async () => {
    const { getByText } = render(
      <OTPVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Wait for resend to be available
    await waitFor(() => {
      const resendButton = getByText('Resend OTP');
      if (resendButton) {
        fireEvent.press(resendButton);
      }
    });
  });
});

describe('SendMoneyOTPScreen', () => {
  const sendMoneyRoute = {
    params: {
      transferData: {
        recipientEmail: 'john@example.com',
        recipientInfo: { name: 'John Doe', email: 'john@example.com', phoneNumber: '+2348012345678', isVerified: true },
        amount: 1000,
        description: 'Test transfer',
        userBalance: 5000,
      },
      step: 'pin_verified',
    },
  };

  test('renders correctly', () => {
    const { getByText } = render(
      <SendMoneyOTPScreen navigation={mockNavigation} route={sendMoneyRoute} />
    );

    expect(getByText('Verify OTP')).toBeTruthy();
    expect(getByText('Enter Verification Code')).toBeTruthy();
  });

  test('shows transfer summary', () => {
    const { getByText } = render(
      <SendMoneyOTPScreen navigation={mockNavigation} route={sendMoneyRoute} />
    );

    expect(getByText('Transfer Details')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
  });
});
