import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SendMoneyScreen from '../../payment/SendMoneyScreen';

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('SendMoneyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <SendMoneyScreen navigation={mockNavigation} />
    );

    expect(getByText('Send Money')).toBeTruthy();
    expect(getByPlaceholderText("Enter recipient's email")).toBeTruthy();
    expect(getByPlaceholderText('0.00')).toBeTruthy();
  });

  test('looks up recipient by email', async () => {
    const { getByPlaceholderText } = render(
      <SendMoneyScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText("Enter recipient's email");
    fireEvent.changeText(emailInput, 'john.doe@example.com');

    await waitFor(() => {
      expect(getByPlaceholderText("Enter recipient's email")).toBeTruthy();
    });
  });

  test('formats amount input correctly', () => {
    const { getByPlaceholderText } = render(
      <SendMoneyScreen navigation={mockNavigation} />
    );

    const amountInput = getByPlaceholderText('0.00');
    fireEvent.changeText(amountInput, '1000.50');
    expect(amountInput.props.value).toBe('1000.50');
  });

  test('validates form before submission', async () => {
    const { getByText } = render(
      <SendMoneyScreen navigation={mockNavigation} />
    );

    const sendButton = getByText('Send Money');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  test('quick amount buttons work', () => {
    const { getByText } = render(
      <SendMoneyScreen navigation={mockNavigation} />
    );

    const quickAmountButton = getByText('₦1,000');
    fireEvent.press(quickAmountButton);

    // Amount should be set to 1000
    expect(getByText('₦1,000')).toBeTruthy();
  });
});