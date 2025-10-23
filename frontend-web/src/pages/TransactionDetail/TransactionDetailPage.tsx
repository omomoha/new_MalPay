import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Share,
  CheckCircle,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const TransactionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mock transaction data - in real app, this would come from route params or state
  const transaction = {
    id: 'tx-123',
    amount: 32.00,
    recipient: 'Nezuko Kamado',
    type: 'BI-FAST',
    date: '10:48 AM • 20 May, 2024',
    fee: 'Free',
    status: 'completed',
  };

  const SparkleIcon = () => (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: '#ffd700',
        position: 'absolute',
        animation: 'sparkle 2s infinite',
        '@keyframes sparkle': {
          '0%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
          '50%': { opacity: 1, transform: 'scale(1.2)' },
        },
      }}
    />
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Mobile App Bar */}
      <AppBar 
        position="static" 
        sx={{ 
          bgcolor: 'transparent', 
          boxShadow: 'none',
          px: 2,
          py: 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 0 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ color: 'black', p: 1 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ color: 'black', fontWeight: 'bold' }}>
            9:41
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 12, bgcolor: 'black', borderRadius: 1 }} />
            <Box sx={{ width: 20, height: 12, bgcolor: 'black', borderRadius: 1 }} />
            <Box sx={{ width: 20, height: 12, bgcolor: 'black', borderRadius: 1 }} />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ px: 2, pb: 4 }}>
        {/* Success Header */}
        <Box sx={{ textAlign: 'center', mb: 4, position: 'relative' }}>
          {/* Success Icon with Sparkles */}
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: '#4caf50',
                mx: 'auto',
                position: 'relative',
              }}
            >
              <CheckCircle sx={{ fontSize: 60, color: 'white' }} />
            </Avatar>
            
            {/* Sparkle Effects */}
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 20,
                height: 20,
              }}
            >
              <SparkleIcon />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: 20,
                left: 10,
                width: 16,
                height: 16,
              }}
            >
              <SparkleIcon />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: 15,
                right: 20,
                width: 12,
                height: 12,
              }}
            >
              <SparkleIcon />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: 25,
                left: 15,
                width: 14,
                height: 14,
              }}
            >
              <SparkleIcon />
            </Box>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'black' }}>
            You've sent ${transaction.amount} to {transaction.recipient}
          </Typography>
        </Box>

        {/* Transaction Details Card */}
        <Card sx={{ borderRadius: 3, mb: 4, bgcolor: 'white' }}>
          <CardContent sx={{ p: 0 }}>
            {/* Date */}
            <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'black' }}>
                  Date
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {transaction.date}
                </Typography>
              </Box>
            </Box>

            {/* Type */}
            <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'black' }}>
                  Type
                </Typography>
                <Chip
                  label={transaction.type}
                  sx={{
                    bgcolor: '#e3f2fd',
                    color: '#1976d2',
                    fontWeight: 'medium',
                  }}
                />
              </Box>
            </Box>

            {/* Nominal */}
            <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'black' }}>
                  Nominal
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black' }}>
                  ${transaction.amount}
                </Typography>
              </Box>
            </Box>

            {/* Fee */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'black' }}>
                  Fee
                </Typography>
                <Typography variant="body1" sx={{ color: '#4caf50', fontWeight: 'medium' }}>
                  {transaction.fee}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Share Button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<Share />}
          sx={{
            bgcolor: '#1976d2',
            borderRadius: 3,
            py: 2,
            fontSize: '16px',
            fontWeight: 'bold',
            textTransform: 'none',
            boxShadow: 2,
            '&:hover': {
              bgcolor: '#1565c0',
              boxShadow: 4,
            },
          }}
        >
          Share detail transfer
        </Button>
      </Box>
    </Box>
  );
};

export default TransactionDetailPage;
