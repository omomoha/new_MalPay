import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Add,
  Refresh,
  Info,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  fetchAllCardBalances,
  refreshCardBalance,
  clearError,
  clearNotification,
} from '../../store/slices/balanceSlice';
import BalanceCard from './BalanceCard';
import RefreshBalanceDialog from './RefreshBalanceDialog';

const BalanceList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    balances,
    totalBalance,
    currency,
    notification,
    loading,
    error,
    hasMastercardBalances,
    refreshing,
  } = useSelector((state: RootState) => state.balance);

  const [refreshDialogOpen, setRefreshDialogOpen] = React.useState(false);
  const [selectedCardId, setSelectedCardId] = React.useState<string>('');

  useEffect(() => {
    dispatch(fetchAllCardBalances());
  }, [dispatch]);

  const handleRefresh = (cardId: string) => {
    setSelectedCardId(cardId);
    setRefreshDialogOpen(true);
  };

  const handleRefreshConfirm = (cardData: any) => {
    dispatch(refreshCardBalance({ cardId: selectedCardId, cardData }));
    setRefreshDialogOpen(false);
  };

  const handleRefreshAll = () => {
    // Refresh all Mastercard balances
    balances.forEach(balance => {
      if (balance.isMastercard) {
        // For demo purposes, we'll just refetch all balances
        // In a real app, you'd need to store card details securely
        dispatch(fetchAllCardBalances());
      }
    });
  };

  const handleCloseNotification = () => {
    dispatch(clearNotification());
  };

  const handleCloseError = () => {
    dispatch(clearError());
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Account Balances
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View your Mastercard account balances
          </Typography>
        </Box>
        
        {balances.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefreshAll}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh All'}
          </Button>
        )}
      </Box>

      {/* Notification */}
      {notification && (
        <Alert
          severity={notification.type === 'error' ? 'error' : 'info'}
          onClose={handleCloseNotification}
          sx={{ mb: 3 }}
          icon={<Info />}
        >
          {notification.message}
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          onClose={handleCloseError}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Total Balance Summary */}
      {balances.length > 0 && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 0.5 }}>
                  Total Available Balance
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: currency,
                  }).format(totalBalance)}
                </Typography>
              </Box>
              <AccountBalanceWallet sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Mastercard Only Notice */}
      <Alert
        severity="info"
        icon={<Info />}
        sx={{ mb: 3 }}
      >
        <Typography variant="body2">
          <strong>Mastercard Only:</strong> Only Mastercard holders can view their account balance. 
          Other card types (Visa, American Express, etc.) are not supported for balance checking.
        </Typography>
      </Alert>

      {/* Balances Grid */}
      {balances.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <AccountBalanceWallet sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" mb={2}>
              No Mastercard Balances Found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Add a Mastercard to your account to view your balance information.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              href="/cards"
            >
              Add Mastercard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {balances.map((balance) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={balance.cardId}>
              <BalanceCard
                balance={balance}
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Refresh Balance Dialog */}
      <RefreshBalanceDialog
        open={refreshDialogOpen}
        onClose={() => setRefreshDialogOpen(false)}
        onConfirm={handleRefreshConfirm}
        cardId={selectedCardId}
      />
    </Box>
  );
};

export default BalanceList;
