import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '@store';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Auth Screens
import LoginScreen from '@screens/auth/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';
import VerifyEmailScreen from '@screens/auth/VerifyEmailScreen';
import OnboardingScreen from '@screens/auth/OnboardingScreen';

// Main Screens
import HomeScreen from '@screens/main/HomeScreen';
import CardsScreen from '@screens/main/CardsScreen';
import SendMoneyScreen from '@screens/main/SendMoneyScreen';
import TransactionsScreen from '@screens/main/TransactionsScreen';
import AccountScreen from '@screens/main/AccountScreen';

// Payment Screens (for detailed flows)
import SendMoneyFlowScreen from '@screens/payment/SendMoneyScreen';
import RequestMoneyScreen from '@screens/payment/RequestMoneyScreen';
import PaymentConfirmScreen from '@screens/payment/PaymentConfirmScreen';
import PaymentSuccessScreen from '@screens/payment/PaymentSuccessScreen';

// Settings Screens
import SettingsScreen from '@screens/settings/SettingsScreen';
import SecurityScreen from '@screens/settings/SecurityScreen';
import TransactionPINSetupScreen from '@screens/settings/TransactionPINSetupScreen';
import BiometricSettingsScreen from '@screens/settings/BiometricSettingsScreen';
import LinkedCardsScreen from '@screens/settings/LinkedCardsScreen';
import BankAccountsScreen from '@screens/settings/BankAccountsScreen';
import KYCScreen from '@screens/settings/KYCScreen';
import NotificationsScreen from '@screens/settings/NotificationsScreen';

// Card Screens
import AddCardScreen from '@screens/cards/AddCardScreen';
import OTPVerificationScreen from '@screens/cards/OTPVerificationScreen';
import CardFeeConfirmationScreen from '@screens/cards/CardFeeConfirmationScreen';
import CardAdditionSuccessScreen from '@screens/cards/CardAdditionSuccessScreen';

// Withdrawal Screens
import WithdrawAmountScreen from '@screens/withdrawal/WithdrawAmountScreen';
import SelectBankScreen from '@screens/withdrawal/SelectBankScreen';
import WithdrawPINScreen from '@screens/withdrawal/WithdrawPINScreen';
import WithdrawOTPScreen from '@screens/withdrawal/WithdrawOTPScreen';
import WithdrawSuccessScreen from '@screens/withdrawal/WithdrawSuccessScreen';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Payment: {
    screen: 'SendMoney' | 'RequestMoney' | 'PaymentConfirm' | 'PaymentSuccess';
    params?: any;
  };
  Settings: {
    screen: 'Settings' | 'Security' | 'LinkedCards' | 'BankAccounts' | 'KYC' | 'Notifications';
    params?: any;
  };
  Cards: {
    screen: 'AddCard' | 'OTPVerification' | 'CardFeeConfirmation' | 'CardAdditionSuccess';
    params?: any;
  };
  Withdrawal: {
    screen: 'WithdrawAmount' | 'SelectBank' | 'WithdrawPIN' | 'WithdrawOTP' | 'WithdrawSuccess';
    params?: any;
  };
};

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { email: string };
};

export type MainTabParamList = {
  Home: undefined;
  Cards: undefined;
  SendMoney: undefined;
  Transactions: undefined;
  Account: undefined;
};

export type PaymentStackParamList = {
  SendMoney: undefined;
  RequestMoney: undefined;
  PaymentConfirm: {
    recipient: string;
    amount: number;
    currency: string;
    description?: string;
  };
  PaymentSuccess: {
    transactionId: string;
    amount: number;
    currency: string;
    recipient: string;
  };
};

export type SettingsStackParamList = {
  Settings: undefined;
  Security: undefined;
  TransactionPINSetup: undefined;
  BiometricSettings: undefined;
  LinkedCards: undefined;
  BankAccounts: undefined;
  KYC: undefined;
  Notifications: undefined;
};

export type CardsStackParamList = {
  AddCard: undefined;
  OTPVerification: {
    encryptedCardData: any;
    secureToken: string;
    cardType: string;
    phoneNumber: string;
    step: string;
    displayData: any;
  };
  CardFeeConfirmation: {
    encryptedCardData: any;
    secureToken: string;
    cardType: string;
    phoneNumber: string;
    step: string;
    displayData: any;
  };
  CardAdditionSuccess: {
    cardType: string;
    displayData: any;
  };
};

export type WithdrawalStackParamList = {
  WithdrawAmount: undefined;
  SelectBank: {
    amount: number;
  };
  WithdrawPIN: {
    amount: number;
    bankAccount: {
      id: string;
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  };
  WithdrawOTP: {
    amount: number;
    bankAccount: {
      id: string;
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  };
  WithdrawSuccess: {
    amount: number;
    bankAccount: {
      id: string;
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  };
};

// Stack Navigators
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const PaymentStack = createStackNavigator<PaymentStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();
const CardsStack = createStackNavigator<CardsStackParamList>();
const WithdrawalStack = createStackNavigator<WithdrawalStackParamList>();
const RootStack = createStackNavigator<RootStackParamList>();

// Auth Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#FFFFFF' },
    }}
  >
    <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
  </AuthStack.Navigator>
);

// Main Tab Navigator
const MainTabNavigator = () => (
  <MainTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;

        switch (route.name) {
          case 'Home':
            iconName = 'home';
            break;
          case 'Cards':
            iconName = 'credit-card';
            break;
          case 'SendMoney':
            iconName = 'send';
            break;
          case 'Transactions':
            iconName = 'history';
            break;
          case 'Account':
            iconName = 'person';
            break;
          default:
            iconName = 'help';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2E7D32',
      tabBarInactiveTintColor: '#757575',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      headerShown: false,
    })}
  >
    <MainTab.Screen name="Home" component={HomeScreen} />
    <MainTab.Screen name="Cards" component={CardsScreen} />
    <MainTab.Screen name="SendMoney" component={SendMoneyScreen} />
    <MainTab.Screen name="Transactions" component={TransactionsScreen} />
    <MainTab.Screen name="Account" component={AccountScreen} />
  </MainTab.Navigator>
);

// Payment Navigator
const PaymentNavigator = () => (
  <PaymentStack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#2E7D32',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <PaymentStack.Screen 
      name="SendMoney" 
      component={SendMoneyFlowScreen}
      options={{ title: 'Send Money' }}
    />
    <PaymentStack.Screen 
      name="RequestMoney" 
      component={RequestMoneyScreen}
      options={{ title: 'Request Money' }}
    />
    <PaymentStack.Screen 
      name="PaymentConfirm" 
      component={PaymentConfirmScreen}
      options={{ title: 'Confirm Payment' }}
    />
    <PaymentStack.Screen 
      name="PaymentSuccess" 
      component={PaymentSuccessScreen}
      options={{ title: 'Payment Success', headerLeft: () => null }}
    />
  </PaymentStack.Navigator>
);

// Settings Navigator
const SettingsNavigator = () => (
  <SettingsStack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#2E7D32',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <SettingsStack.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
        <SettingsStack.Screen
          name="Security"
          component={SecurityScreen}
          options={{ title: 'Security' }}
        />
        <SettingsStack.Screen
          name="TransactionPINSetup"
          component={TransactionPINSetupScreen}
          options={{ title: 'Setup Transaction PIN' }}
        />
        <SettingsStack.Screen
          name="BiometricSettings"
          component={BiometricSettingsScreen}
          options={{ title: 'Biometric Settings' }}
        />
        <SettingsStack.Screen
          name="LinkedCards"
          component={LinkedCardsScreen}
          options={{ title: 'Linked Cards' }}
        />
    <SettingsStack.Screen 
      name="BankAccounts" 
      component={BankAccountsScreen}
      options={{ title: 'Bank Accounts' }}
    />
    <SettingsStack.Screen 
      name="KYC" 
      component={KYCScreen}
      options={{ title: 'KYC Verification' }}
    />
    <SettingsStack.Screen 
      name="Notifications" 
      component={NotificationsScreen}
      options={{ title: 'Notifications' }}
    />
  </SettingsStack.Navigator>
);

// Cards Navigator
const CardsNavigator = () => (
  <CardsStack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#2E7D32',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <CardsStack.Screen
      name="AddCard"
      component={AddCardScreen}
      options={{ title: 'Add Card' }}
    />
    <CardsStack.Screen
      name="OTPVerification"
      component={OTPVerificationScreen}
      options={{ title: 'Verify OTP' }}
    />
    <CardsStack.Screen
      name="CardFeeConfirmation"
      component={CardFeeConfirmationScreen}
      options={{ title: 'Confirm Fee' }}
    />
    <CardsStack.Screen
      name="CardAdditionSuccess"
      component={CardAdditionSuccessScreen}
      options={{ title: 'Success', headerLeft: () => null }}
    />
  </CardsStack.Navigator>
);

// Withdrawal Navigator
const WithdrawalNavigator = () => (
  <WithdrawalStack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#2E7D32',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <WithdrawalStack.Screen
      name="WithdrawAmount"
      component={WithdrawAmountScreen}
      options={{ title: 'Withdraw Amount' }}
    />
    <WithdrawalStack.Screen
      name="SelectBank"
      component={SelectBankScreen}
      options={{ title: 'Select Bank' }}
    />
    <WithdrawalStack.Screen
      name="WithdrawPIN"
      component={WithdrawPINScreen}
      options={{ title: 'Enter PIN' }}
    />
    <WithdrawalStack.Screen
      name="WithdrawOTP"
      component={WithdrawOTPScreen}
      options={{ title: 'Verify OTP' }}
    />
    <WithdrawalStack.Screen
      name="WithdrawSuccess"
      component={WithdrawSuccessScreen}
      options={{ title: 'Success', headerLeft: () => null }}
    />
  </WithdrawalStack.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <>
              <RootStack.Screen name="Main" component={MainTabNavigator} />
              <RootStack.Screen name="Payment" component={PaymentNavigator} />
              <RootStack.Screen name="Settings" component={SettingsNavigator} />
              <RootStack.Screen name="Cards" component={CardsNavigator} />
              <RootStack.Screen name="Withdrawal" component={WithdrawalNavigator} />
            </>
          ) : (
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          )}
        </RootStack.Navigator>
  );
};

export default AppNavigator;
