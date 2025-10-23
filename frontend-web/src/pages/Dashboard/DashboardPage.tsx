import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import {
  AccountBalance,
  CreditCard,
  Send,
  TrendingUp,
  QrCode,
  Add,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchCards } from '../../store/slices/cardsSlice';
import { fetchTransactions } from '../../store/slices/transactionsSlice';
import { fetchBankAccounts } from '../../store/slices/bankAccountsSlice';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { cards } = useSelector((state: RootState) => state.cards as any);
  const { transactions } = useSelector((state: RootState) => state.transactions as any);
  const { bankAccounts } = useSelector((state: RootState) => state.bankAccounts as any);

  const [balance] = useState(0);

  useEffect(() => {
    dispatch(fetchCards());
    dispatch(fetchTransactions({ limit: 5 }));
    dispatch(fetchBankAccounts());
  }, [dispatch]);

  const quickActions = [
    {
      title: 'Send Money',
      icon: <Send />,
      color: 'primary',
      onClick: () => navigate('/send-money'),
    },
    {
      title: 'Add Card',
      icon: <CreditCard />,
      color: 'secondary',
      onClick: () => navigate('/cards/add'),
    },
    {
      title: 'Withdraw',
      icon: <AccountBalance />,
      color: 'success',
      onClick: () => navigate('/withdraw'),
    },
    {
      title: 'QR Code',
      icon: <QrCode />,
      color: 'info',
      onClick: () => navigate('/qr-code'),
    },
  ];

  const recentTransactions = transactions.slice(0, 5);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return <ArrowUpward color="primary" />;
      case 'withdrawal':
        return <ArrowDownward color="error" />;
      default:
        return <TrendingUp color="success" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'transfer':
        return 'primary';
      case 'withdrawal':
        return 'error';
      default:
        return 'success';
    }
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.firstName || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your account today.
        </Typography>
      </Box>

      {/* Balance Card */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Total Balance
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                ₦{balance.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Available for transfers and withdrawals
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
              <AccountBalance sx={{ fontSize: 32 }} />
            </Avatar>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
          {quickActions.map((action, index) => (
            <Card
              key={index}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
              }}
              onClick={action.onClick}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: `${action.color}.main`, mx: 'auto', mb: 2 }}>
                  {action.icon}
                </Avatar>
                <Typography variant="body1" fontWeight="medium">
                  {action.title}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Cards Overview */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h3">
                  Your Cards
                </Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => navigate('/cards/add')}
                >
                  Add Card
                </Button>
              </Box>
              <List>
                {cards.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="No cards added yet"
                      secondary="Add a card to start making payments"
                    />
                  </ListItem>
                ) : (
                  cards.map((card: any) => (
                    <ListItem key={card.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <CreditCard />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={card.cardNumberMasked}
                        secondary={`${card.cardholderName} • ${card.cardType.toUpperCase()}`}
                      />
                      <ListItemSecondaryAction>
                        {card.isDefault && (
                          <Chip label="Default" size="small" color="primary" />
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>

          {/* Bank Accounts Overview */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h3">
                  Bank Accounts
                </Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => navigate('/bank-accounts/add')}
                >
                  Add Account
                </Button>
              </Box>
              <List>
                {bankAccounts.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="No bank accounts added yet"
                      secondary="Add a bank account to receive withdrawals"
                    />
                  </ListItem>
                ) : (
                  bankAccounts.map((account: any) => (
                    <ListItem key={account.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <AccountBalance />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={account.accountName}
                        secondary={`${account.bankName} • ${account.accountNumber.slice(-4)}`}
                      />
                      <ListItemSecondaryAction>
                        {account.isPrimary && (
                          <Chip label="Primary" size="small" color="success" />
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Transactions */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h3">
                Recent Transactions
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/transactions')}
              >
                View All
              </Button>
            </Box>
            <List>
              {recentTransactions.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="No transactions yet"
                    secondary="Your transaction history will appear here"
                  />
                </ListItem>
              ) : (
                recentTransactions.map((transaction: any) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: `${getTransactionColor(transaction.type)}.main` }}>
                          {getTransactionIcon(transaction.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" fontWeight="medium">
                              {transaction.description || `${transaction.type} transaction`}
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight="bold"
                              color={transaction.type === 'withdrawal' ? 'error.main' : 'success.main'}
                            >
                              {transaction.type === 'withdrawal' ? '-' : '+'}₦{transaction.amount.toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </Typography>
                            <Chip
                              label={transaction.status}
                              size="small"
                              color={transaction.status === 'completed' ? 'success' : 'default'}
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end">
                          <MoreVert />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPage;
