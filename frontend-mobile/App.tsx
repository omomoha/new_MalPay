import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { colors } from './src/theme/colors';
import BottomNavigation from './src/components/BottomNavigation';
import HomeScreen from './src/screens/main/HomeScreen';
import CardsScreen from './src/screens/main/CardsScreen';
import TransactionsScreen from './src/screens/main/TransactionsScreen';
import AccountScreen from './src/screens/main/AccountScreen';
import SendMoneyScreen from './src/screens/payment/SendMoneyScreen';
import TransferConfirmationScreen from './src/screens/payment/TransferConfirmationScreen';
import AddCardScreen from './src/screens/cards/AddCardScreen';
import OTPVerificationScreen from './src/screens/cards/OTPVerificationScreen';
import CardFeeConfirmationScreen from './src/screens/cards/CardFeeConfirmationScreen';
import CardAdditionSuccessScreen from './src/screens/cards/CardAdditionSuccessScreen';
import PINVerificationScreen from './src/screens/payment/PINVerificationScreen';
import SendMoneyOTPScreen from './src/screens/payment/SendMoneyOTPScreen';
import TransferSuccessScreen from './src/screens/payment/TransferSuccessScreen';

const theme = {
  colors: {
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    onSurface: colors.text,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'cards':
        return <CardsScreen navigation={{ navigate: (screen: string) => {
          // Handle navigation to card screens
          if (screen === 'AddCard') {
            setActiveTab('addCard');
          } else if (screen === 'OTPVerification') {
            setActiveTab('otpVerification');
          } else if (screen === 'CardFeeConfirmation') {
            setActiveTab('cardFeeConfirmation');
          } else if (screen === 'CardAdditionSuccess') {
            setActiveTab('cardAdditionSuccess');
          }
        } }} />;
      case 'send':
        return <SendMoneyScreen navigation={{ navigate: (screen: string, params?: any) => {
          if (screen === 'PINVerification') {
            setActiveTab('pinVerification');
          }
        }, goBack: () => setActiveTab('home') }} />;
      case 'transactions':
        return <TransactionsScreen />;
      case 'account':
        return <AccountScreen />;
      case 'addCard':
        return <AddCardScreen navigation={{ navigate: (screen: string, params?: any) => {
          if (screen === 'OTPVerification') {
            setActiveTab('otpVerification');
          }
        }, goBack: () => setActiveTab('cards') }} />;
      case 'otpVerification':
        return <OTPVerificationScreen navigation={{ navigate: (screen: string, params?: any) => {
          if (screen === 'CardFeeConfirmation') {
            setActiveTab('cardFeeConfirmation');
          }
        }, goBack: () => setActiveTab('addCard') }} route={{ params: {
          cardData: { cardNumber: '1234567890123456', expiryDate: '12/26', cvv: '123', cardholderName: 'John Doe' },
          cardType: 'visa',
          phoneNumber: '+234 801 234 5678',
          step: 'card_addition'
        } }} />;
      case 'cardFeeConfirmation':
        return <CardFeeConfirmationScreen navigation={{ navigate: (screen: string, params?: any) => {
          if (screen === 'CardAdditionSuccess') {
            setActiveTab('cardAdditionSuccess');
          } else if (screen === 'Home') {
            setActiveTab('home');
          }
        }, goBack: () => setActiveTab('otpVerification') }} route={{ params: {
          cardData: { cardNumber: '1234567890123456', expiryDate: '12/26', cvv: '123', cardholderName: 'John Doe' },
          cardType: 'visa',
          phoneNumber: '+234 801 234 5678',
          step: 'otp_verified'
        } }} />;
      case 'cardAdditionSuccess':
        return <CardAdditionSuccessScreen navigation={{ navigate: (screen: string) => {
          if (screen === 'Cards') {
            setActiveTab('cards');
          } else if (screen === 'Home') {
            setActiveTab('home');
          }
        } }} route={{ params: {
          cardData: { cardNumber: '1234567890123456', expiryDate: '12/26', cvv: '123', cardholderName: 'John Doe' },
          cardType: 'visa',
          feeAmount: 50,
          transactionId: 'TXN_' + Date.now()
        } }} />;
      case 'pinVerification':
        return <PINVerificationScreen navigation={{ navigate: (screen: string, params?: any) => {
          if (screen === 'SendMoneyOTP') {
            setActiveTab('sendMoneyOTP');
          }
        }, goBack: () => setActiveTab('send') }} route={{ params: {
          transferData: {
            recipientEmail: 'john.doe@example.com',
            recipientInfo: {
              name: 'John Doe',
              email: 'john.doe@example.com',
              phoneNumber: '+234 801 234 5678',
              isVerified: true,
            },
            amount: 1000,
            description: 'Test transfer',
            userBalance: 15420.50,
          },
          step: 'send_money'
        } }} />;
      case 'sendMoneyOTP':
        return <SendMoneyOTPScreen navigation={{ navigate: (screen: string, params?: any) => {
          if (screen === 'TransferSuccess') {
            setActiveTab('transferSuccess');
          }
        }, goBack: () => setActiveTab('pinVerification') }} route={{ params: {
          transferData: {
            recipientEmail: 'john.doe@example.com',
            recipientInfo: {
              name: 'John Doe',
              email: 'john.doe@example.com',
              phoneNumber: '+234 801 234 5678',
              isVerified: true,
            },
            amount: 1000,
            description: 'Test transfer',
            userBalance: 15420.50,
          },
          step: 'pin_verified'
        } }} />;
      case 'transferSuccess':
        return <TransferSuccessScreen navigation={{ navigate: (screen: string) => {
          if (screen === 'Home') {
            setActiveTab('home');
          } else if (screen === 'SendMoney') {
            setActiveTab('send');
          } else if (screen === 'Transactions') {
            setActiveTab('transactions');
          }
        } }} route={{ params: {
          transferData: {
            recipientEmail: 'john.doe@example.com',
            recipientInfo: {
              name: 'John Doe',
              email: 'john.doe@example.com',
              phoneNumber: '+234 801 234 5678',
              isVerified: true,
            },
            amount: 1000,
            description: 'Test transfer',
            userBalance: 15420.50,
          },
          transactionId: 'TXN_' + Date.now(),
          timestamp: new Date().toISOString()
        } }} />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <View style={styles.container}>
            <StatusBar style="light" backgroundColor={colors.primary} />
            {renderScreen()}
            {!['addCard', 'otpVerification', 'cardFeeConfirmation', 'cardAdditionSuccess', 'pinVerification', 'sendMoneyOTP', 'transferSuccess'].includes(activeTab) && (
              <BottomNavigation activeTab={activeTab} onTabPress={setActiveTab} />
            )}
          </View>
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});