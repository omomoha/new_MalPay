import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Refresh,
  CreditCard,
  Info,
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatCurrency';
import { CardBalance } from '../../store/slices/balanceSlice';

interface BalanceCardProps {
  balance: CardBalance;
  onRefresh: (cardId: string) => void;
  refreshing: boolean;
  showRefreshButton?: boolean;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  onRefresh,
  refreshing,
  showRefreshButton = true,
}) => {
  const getCardTypeColor = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'mastercard':
        return '#eb001b';
      case 'visa':
        return '#1a1f71';
      case 'amex':
        return '#006fcf';
      case 'discover':
        return '#ff6000';
      case 'verve':
        return '#7c3aed';
      default:
        return '#6b7280';
    }
  };

  const getCardTypeIcon = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'mastercard':
        return '💳';
      case 'visa':
        return '💳';
      case 'amex':
        return '💳';
      case 'discover':
        return '💳';
      case 'verve':
        return '💳';
      default:
        return '💳';
    }
  };

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${getCardTypeColor(balance.cardType)} 0%, ${getCardTypeColor(balance.cardType)}CC 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        },
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {getCardTypeIcon(balance.cardType)} {balance.cardType.toUpperCase()}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {balance.maskedCardNumber}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label="Mastercard"
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
            {showRefreshButton && (
              <Tooltip title="Refresh Balance">
                <IconButton
                  size="small"
                  onClick={() => onRefresh(balance.cardId)}
                  disabled={refreshing}
                  sx={{
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    },
                  }}
                >
                  {refreshing ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Refresh fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box mb={2}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {formatCurrency(balance.balance, balance.currency)}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Available Balance
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Last updated: {new Date(balance.lastUpdated).toLocaleString()}
          </Typography>
          
          <Tooltip title="Only Mastercard holders can view their account balance">
            <Info fontSize="small" sx={{ opacity: 0.7 }} />
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
