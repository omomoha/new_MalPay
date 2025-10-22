import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddCardScreen from '../../screens/cards/AddCardScreen';

// Mock CardEncryption
jest.mock('../../utils/cardEncryption', () => ({
  encryptCardData: jest.fn(() => ({
    encryptedCardNumber: 'encrypted123',
    encryptedExpiryDate: 'encrypted12/26',
    encryptedCVV: 'encrypted123',
    encryptedCardholderName: 'encryptedJohn Doe',
    iv1: 'iv1',
    iv2: 'iv2',
    iv3: 'iv3',
    encryptionLevel: 3,
  })),
  generateSecureToken: jest.fn(() => 'secure-token-123'),
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('AddCardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <AddCardScreen navigation={mockNavigation} />
    );

    expect(getByText('Add Card')).toBeTruthy();
    expect(getByPlaceholderText('1234 5678 9012 3456')).toBeTruthy();
    expect(getByPlaceholderText('Enter cardholder name')).toBeTruthy();
    expect(getByPlaceholderText('MM/YY')).toBeTruthy();
    expect(getByPlaceholderText('123')).toBeTruthy();
  });

  test('formats card number input correctly', () => {
    const { getByPlaceholderText } = render(
      <AddCardScreen navigation={mockNavigation} />
    );

    const cardNumberInput = getByPlaceholderText('1234 5678 9012 3456');
    fireEvent.changeText(cardNumberInput, '4111111111111111');
    expect(cardNumberInput.props.value).toBe('4111 1111 1111 1111');
  });

  test('formats expiry date input correctly', () => {
    const { getByPlaceholderText } = render(
      <AddCardScreen navigation={mockNavigation} />
    );

    const expiryInput = getByPlaceholderText('MM/YY');
    fireEvent.changeText(expiryInput, '1226');
    expect(expiryInput.props.value).toBe('12/26');
  });

  test('validates form before submission', async () => {
    const { getByText } = render(
      <AddCardScreen navigation={mockNavigation} />
    );

    const submitButton = getByText('Add Card');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  test('submits form with valid data', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AddCardScreen navigation={mockNavigation} />
    );

    // Fill form
    fireEvent.changeText(getByPlaceholderText('1234 5678 9012 3456'), '4111111111111111');
    fireEvent.changeText(getByPlaceholderText('Enter cardholder name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('MM/YY'), '12/26');
    fireEvent.changeText(getByPlaceholderText('123'), '123');

    // Submit
    fireEvent.press(getByText('Add Card'));

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('OTPVerification', expect.any(Object));
    });
  });
});
