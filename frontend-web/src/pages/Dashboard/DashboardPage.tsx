import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Divider,
  Fab,
  AppBar,
  Toolbar,
  Badge,
  Drawer,
  ListItemIcon,
  ListItemButton,
} from '@mui/material';
import {
  AccountBalance,
  CreditCard,
  Send,
  TrendingUp,
  QrCode,
  Add,
  Notifications,
  Visibility,
  VisibilityOff,
  AccountBalanceWallet,
  AttachMoney,
  Security,
  Menu,
  Dashboard as DashboardIcon,
  History,
  Settings,
  Person,
  Logout,
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

  const [balance] = useState(32149.00);
  const [showBalance, setShowBalance] = useState(true);
  const [weeklySpending] = useState(320);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Initialize any required data
  }, [dispatch]);

  const quickActions = [
    {
      title: 'Send',
      icon: <Send sx={{ fontSize: 24 }} />,
      color: '#1976d2',
      onClick: () => navigate('/send-money'),
    },
    {
      title: 'Withdraw',
      icon: <AccountBalance sx={{ fontSize: 24 }} />,
      color: '#2e7d32',
      onClick: () => navigate('/withdraw'),
    },
    {
      title: 'Invest',
      icon: <AttachMoney sx={{ fontSize: 24 }} />,
      color: '#ed6c02',
      onClick: () => navigate('/invest'),
    },
    {
      title: 'Add',
      icon: <Add sx={{ fontSize: 24 }} />,
      color: '#9c27b0',
      onClick: () => navigate('/cards'),
    },
  ];

  const recentTransactions = [
    {
      id: '1',
      title: 'Subscription payments',
      subtitle: '20 May, 13:28',
      amount: -20.00,
      icon: 'V',
      iconColor: '#1976d2',
    },
    {
      id: '2',
      title: 'Creator payments',
      subtitle: '20 May, 10:32',
      amount: 12.99,
      icon: 'YT',
      iconColor: '#ff0000',
    },
    {
      id: '3',
      title: 'Purchase payments',
      subtitle: '20 May, 09:24',
      amount: -32.00,
      icon: 'PP',
      iconColor: '#0070ba',
    },
  ];


  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Balance', icon: <AccountBalanceWallet />, path: '/balance' },
    { text: 'Cards', icon: <CreditCard />, path: '/cards' },
    { text: 'Send Money', icon: <Send />, path: '/send-money' },
    { text: 'Transaction History', icon: <History />, path: '/transactions' },
    { text: 'Bank Accounts', icon: <AccountBalance />, path: '/bank-accounts' },
    { text: 'Withdraw', icon: <TrendingUp />, path: '/withdraw' },
    { text: 'QR Code', icon: <QrCode />, path: '/qr-code' },
  ];

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Mobile App Bar */}
      <AppBar 
        position="static" 
        sx={{ 
          bgcolor: '#1976d2', 
          boxShadow: 2,
          px: 2,
          py: 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleSidebarToggle}
              sx={{ mr: 1 }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Dashboard
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <Settings />
            </IconButton>
            <Badge badgeContent={3} color="error">
              <IconButton color="inherit">
                <Notifications />
              </IconButton>
            </Badge>
            <IconButton color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                U
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ px: 2, pb: 10 }}>
        {/* Welcome Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'black' }}>
              Welcome back, {user?.firstName || 'Tanjiro Kamado'}!
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={3} color="error">
              <Notifications sx={{ color: 'black' }} />
            </Badge>
            <Avatar sx={{ bgcolor: '#1976d2', position: 'relative' }}>
              <Security sx={{ fontSize: 20 }} />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 16,
                  height: 16,
                  bgcolor: '#1976d2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Security sx={{ fontSize: 10, color: 'white' }} />
              </Box>
            </Avatar>
          </Box>
        </Box>

        {/* Balance Card */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white',
            borderRadius: 3,
            mb: 3,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Account Balance
              </Typography>
              <IconButton
                onClick={() => setShowBalance(!showBalance)}
                sx={{ color: 'white', p: 0.5 }}
              >
                {showBalance ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              {showBalance ? `$${balance.toLocaleString()}` : '••••••'}
            </Typography>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 4 }}>
          {quickActions.map((action, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' },
              }}
              onClick={action.onClick}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                  boxShadow: 2,
                }}
              >
                <Box sx={{ color: action.color }}>
                  {action.icon}
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: 'black', fontWeight: 'medium' }}>
                {action.title}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Transactions Section */}
        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Transactions
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/transactions')}
                  sx={{ textTransform: 'none', color: '#1976d2' }}
                >
                  See all &gt;
                </Button>
              </Box>
            </Box>
            <List sx={{ p: 0 }}>
              {recentTransactions.map((transaction, index) => (
                <React.Fragment key={transaction.id}>
                  <ListItem sx={{ px: 3, py: 2 }}>
                    <ListItemAvatar>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          bgcolor: transaction.iconColor,
                        }}
                      >
                        {transaction.icon}
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {transaction.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {transaction.subtitle}
                        </Typography>
                      }
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        color: transaction.amount > 0 ? '#2e7d32' : '#d32f2f',
                      }}
                    >
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </Typography>
                  </ListItem>
                  {index < recentTransactions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Weekly Spending */}
        <Card sx={{ borderRadius: 3, bgcolor: 'white' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Weekly spending: ${weeklySpending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You're staying right on track
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccountBalanceWallet sx={{ color: '#666' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          bgcolor: '#1976d2',
        }}
        onClick={() => navigate('/send-money')}
      >
        <Send />
      </Fab>

      {/* Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={handleSidebarToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: '#f8f9fa',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* User Profile Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'white', borderRadius: 2 }}>
            <Avatar sx={{ bgcolor: '#1976d2', mr: 2, width: 48, height: 48 }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black' }}>
                {user?.firstName || 'Tanjiro Kamado'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Premium User
              </Typography>
            </Box>
          </Box>

          {/* Navigation Menu */}
          <List sx={{ px: 1 }}>
            {navigationItems.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: '#e3f2fd',
                    },
                    '&.Mui-selected': {
                      bgcolor: '#1976d2',
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#1565c0',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#666' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: 'medium',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          {/* Settings and Logout */}
          <List sx={{ px: 1 }}>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation('/settings')}
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: '#e3f2fd',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: '#666' }}>
                  <Settings />
                </ListItemIcon>
                <ListItemText 
                  primary="Settings"
                  primaryTypographyProps={{
                    fontWeight: 'medium',
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  // Handle logout
                  console.log('Logout clicked');
                  setSidebarOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: '#ffebee',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: '#d32f2f' }}>
                  <Logout />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout"
                  primaryTypographyProps={{
                    fontWeight: 'medium',
                    color: '#d32f2f',
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default DashboardPage;
