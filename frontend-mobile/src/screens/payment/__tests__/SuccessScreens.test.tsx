import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CardAdditionSuccessScreen from '../../cards/CardAdditionSuccessScreen';
import TransferSuccessScreen from '../TransferSuccessScreen';

const mockCardRoute = {
  params: {
    cardData: { cardNumber: '1234567890123456', expiryDate: '12/26', cvv: '123', cardholderName: 'John Doe' },
    cardType: 'visa',
    feeAmount: 50,
    transactionId: 'TXN_123456',
  },
};

const mockTransferRoute = {
  params: {
    transferData: {
      recipientEmail: 'john@example.com',
      recipientInfo: { name: 'John Doe', email: 'john@example.com', phoneNumber: '+2348012345678', isVerified: true },
      amount: 1000,
      description: 'Test transfer',
      userBalance: 5000,
    },
    transactionId: 'TXN_123456',
    timestamp: new Date().toISOString(),
  },
};

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('CardAdditionSuccessScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    const { getByText } = render(
      <CardAdditionSuccessScreen navigation={mockNavigation} route={mockCardRoute} />
    );

    expect(getByText('Card Added Successfully!')).toBeTruthy();
    expect(getByText('Your New Card')).toBeTruthy();
  });

  test('shows transaction details', () => {
    const { getByText } = render(
      <CardAdditionSuccessScreen navigation={mockNavigation} route={mockCardRoute} />
    );

    expect(getByText('Transaction Details')).toBeTruthy();
    expect(getByText('TXN_123456')).toBeTruthy();
    expect(getByText('₦50.00')).toBeTruthy();
  });

  test('handles navigation buttons', () => {
    const { getByText } = render(
      <CardAdditionSuccessScreen navigation={mockNavigation} route={mockCardRoute} />
    );

    const viewCardsButton = getByText('View Cards');
    const goHomeButton = getByText('Go to Home');

    fireEvent.press(viewCardsButton);
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Cards');

    fireEvent.press(goHomeButton);
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
  });
});

describe('TransferSuccessScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    const { getByText } = render(
      <TransferSuccessScreen navigation={mockNavigation} route={mockTransferRoute} />
    );

    expect(getByText('Transfer Successful!')).toBeTruthy();
    expect(getByText('Transfer Details')).toBeTruthy();
  });

  test('shows transfer details', () => {
    const { getByText } = render(
      <TransferSuccessScreen navigation={mockNavigation} route={mockTransferRoute} />
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('₦1,000.00')).toBeTruthy();
    expect(getByText('TXN_123456')).toBeTruthy();
  });

  test('handles navigation buttons', () => {
    const { getByText } = render(
      <TransferSuccessScreen navigation={mockNavigation} route={mockTransferRoute} />
    );

    const sendMoreButton = getByText('Send More');
    const doneButton = getByText('Done');

    fireEvent.press(sendMoreButton);
    expect(mockNavigation.navigate).toHaveBeenCalledWith('SendMoney');

    fireEvent.press(doneButton);
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
  });
});
