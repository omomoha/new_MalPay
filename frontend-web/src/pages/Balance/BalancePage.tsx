import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import BalanceList from '../../components/Balance/BalanceList';

const BalancePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <AccountBalanceWallet sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
            Account Balances
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary">
          View and manage your Mastercard account balances
        </Typography>
      </Box>

      <BalanceList />
    </Container>
  );
};

export default BalancePage;
