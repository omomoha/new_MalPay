import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from './store';
import { MalPayThemeProvider } from './theme/index';
import { initializeAuth } from './store/slices/authSlice';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import {
  EmailVerificationPage,
  ProfileCompletionPage,
  CardsPage,
  AddCardPage,
  SendMoneyPage,
  TransactionHistoryPage,
  BankAccountsPage,
  AddBankAccountPage,
  WithdrawPage,
  ProfilePage,
  SettingsPage,
  QRCodePage,
  NotFoundPage,
} from './pages';
import DashboardPage from './pages/Dashboard/DashboardPage';

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    console.log('AppContent mounted, initializing auth...');
    dispatch(initializeAuth());
  }, [dispatch]);

  console.log('AppContent rendering...');

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile-completion" element={<ProfileCompletionPage />} />
            
            {/* Cards */}
            <Route path="cards" element={<CardsPage />} />
            <Route path="cards/add" element={<AddCardPage />} />
            
            {/* Payments */}
            <Route path="send-money" element={<SendMoneyPage />} />
            <Route path="transactions" element={<TransactionHistoryPage />} />
            
            {/* Bank Accounts */}
            <Route path="bank-accounts" element={<BankAccountsPage />} />
            <Route path="bank-accounts/add" element={<AddBankAccountPage />} />
            
            {/* Withdrawals */}
            <Route path="withdraw" element={<WithdrawPage />} />
            
            {/* Profile & Settings */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            
            {/* QR Code */}
            <Route path="qr-code" element={<QRCodePage />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  console.log('App component rendering...');
  
  return (
    <Provider store={store}>
      <MalPayThemeProvider>
        <AppContent />
      </MalPayThemeProvider>
    </Provider>
  );
}

export default App;