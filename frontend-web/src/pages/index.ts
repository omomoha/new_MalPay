import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const EmailVerificationPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Email Verification
        </Typography>
        <Typography variant="body1">
          Please check your email and click the verification link to activate your account.
        </Typography>
      </Paper>
    </Box>
  );
};

const ProfileCompletionPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Complete Your Profile
        </Typography>
        <Typography variant="body1">
          Please complete your profile by adding a bank account and at least one card.
        </Typography>
      </Paper>
    </Box>
  );
};

const CardsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Cards
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          Card management functionality will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

const AddCardPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Add New Card
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          Add card functionality will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

const SendMoneyPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Send Money
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          Send money functionality will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

const TransactionHistoryPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Transaction History
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          Transaction history functionality will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

const BankAccountsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bank Accounts
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          Bank account management functionality will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

const AddBankAccountPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Add Bank Account
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          Add bank account functionality will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

const WithdrawPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Withdraw Funds
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          Withdrawal functionality will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

const ProfilePage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          Profile management functionality will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

const SettingsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          Settings functionality will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

const QRCodePage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        QR Code
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          QR code functionality will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

const NotFoundPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1">
          The page you're looking for doesn't exist.
        </Typography>
      </Paper>
    </Box>
  );
};

export {
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
};
