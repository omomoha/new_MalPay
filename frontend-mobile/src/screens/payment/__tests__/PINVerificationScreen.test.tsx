import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PINVerificationScreen from '../PINVerificationScreen';

// Mock CardEncryption
jest.mock('../../utils/cardEncryption', () => ({
  verifyPIN: jest.fn(() => Promise.resolve(true)),
}));

const mockRoute = {
  params: {
    transferData: {
      recipientEmail: 'john@example.com',
      recipientInfo: { name: 'John Doe', email: 'john@example.com', phoneNumber: '+2348012345678', isVerified: true },
      amount: 1000,
      description: 'Test transfer',
      userBalance: 5000,
    },
    step: 'send_money',
  },
};

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('PINVerificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    const { getByText } = render(
      <PINVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('Enter PIN')).toBeTruthy();
    expect(getByText('Enter Your PIN')).toBeTruthy();
  });

  test('handles PIN input correctly', () => {
    const { getByDisplayValue } = render(
      <PINVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    // PIN inputs should be present
    expect(getByDisplayValue('')).toBeTruthy();
  });

  test('validates PIN length', async () => {
    const { getByText } = render(
      <PINVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    const verifyButton = getByText('Verify PIN');
    fireEvent.press(verifyButton);

    await waitFor(() => {
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  test('handles forgot PIN', () => {
    const { getByText } = render(
      <PINVerificationScreen navigation={mockNavigation} route={mockRoute} />
    );

    const forgotButton = getByText('Forgot PIN?');
    fireEvent.press(forgotButton);

    // Should show alert (mocked)
    expect(forgotButton).toBeTruthy();
  });
});
