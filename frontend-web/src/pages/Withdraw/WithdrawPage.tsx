import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ArrowBack,
  AccountBalance,
  CreditCard,
  QrCode,
  TrendingUp,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';

const WithdrawPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { bankAccounts } = useSelector((state: RootState) => state.bankAccounts as any);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: '',
    bankAccount: '',
    withdrawalMethod: 'bank',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleInputChange = (field: string) => (event: any) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleNext = () => {
    if (step === 1 && formData.amount && formData.bankAccount) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      dispatch(addNotification({
        type: 'success',
        message: `Successfully withdrew $${formData.amount} to your bank account`,
      }));
      
      setShowConfirmDialog(false);
      navigate('/dashboard');
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to withdraw funds. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  };

  const withdrawalMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: <AccountBalance />, fee: 0, time: '1-3 business days' },
    { id: 'card', name: 'Card Withdrawal', icon: <CreditCard />, fee: 2.50, time: 'Instant' },
    { id: 'crypto', name: 'Crypto Transfer', icon: <TrendingUp />, fee: 1.00, time: '5-10 minutes' },
  ];

  const steps = ['Amount & Account', 'Withdrawal Method', 'Review & Confirm'];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Mobile App Bar */}
      <AppBar position="static" sx={{ bgcolor: '#1976d2', boxShadow: 2 }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 1 }}>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Withdraw Funds
          </Typography>
          <IconButton color="inherit">
            <QrCode />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Progress Stepper */}
      <Box sx={{ p: 2, bgcolor: 'white' }}>
        <Stepper activeStep={step - 1} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Step 1: Amount & Account */}
        {step === 1 && (
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                How much do you want to withdraw?
              </Typography>
              
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange('amount')}
                placeholder="0.00"
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Bank Account</InputLabel>
                <Select
                  value={formData.bankAccount}
                  onChange={handleInputChange('bankAccount')}
                >
                  {bankAccounts?.bankAccounts?.map((account: any) => (
                    <MenuItem key={account.id} value={account.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <AccountBalance />
                        <Box>
                          <Typography variant="body1">{account.bankName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {account.accountNumber}
                          </Typography>
                        </Box>
                        {account.isPrimary && (
                          <Chip label="Primary" size="small" color="primary" />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Description (Optional)"
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="What's this withdrawal for?"
                multiline
                rows={2}
                sx={{ mb: 3 }}
              />

              <Alert severity="info">
                Available balance: $32,149.00
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Withdrawal Method */}
        {step === 2 && (
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Choose Withdrawal Method
              </Typography>

              <List sx={{ p: 0 }}>
                {withdrawalMethods.map((method, index) => (
                  <React.Fragment key={method.id}>
                    <ListItem
                      sx={{
                        px: 0,
                        py: 2,
                        cursor: 'pointer',
                        borderRadius: 2,
                        mb: 1,
                        border: formData.withdrawalMethod === method.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        bgcolor: formData.withdrawalMethod === method.id ? '#f3f9ff' : 'white',
                      }}
                      onClick={() => setFormData({ ...formData, withdrawalMethod: method.id })}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#1976d2' }}>
                          {method.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={method.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Fee: ${method.fee} • {method.time}
                            </Typography>
                          </Box>
                        }
                      />
                      {formData.withdrawalMethod === method.id && (
                        <CheckCircle color="primary" />
                      )}
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>

              <Alert severity="warning" sx={{ mt: 2 }}>
                Withdrawal limits: $500 per day, $5,000 per month
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Review Withdrawal
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Amount
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  ${formData.amount}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Bank Account
                </Typography>
                <Typography variant="body1">
                  {bankAccounts?.bankAccounts?.find((acc: any) => acc.id === formData.bankAccount)?.bankName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bankAccounts?.bankAccounts?.find((acc: any) => acc.id === formData.bankAccount)?.accountNumber}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Withdrawal Method
                </Typography>
                <Typography variant="body1">
                  {withdrawalMethods.find(m => m.id === formData.withdrawalMethod)?.name}
                </Typography>
              </Box>

              {formData.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1">{formData.description}</Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Withdrawal Fee</Typography>
                <Typography variant="body2">
                  ${withdrawalMethods.find(m => m.id === formData.withdrawalMethod)?.fee}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Processing Time</Typography>
                <Typography variant="body2">
                  {withdrawalMethods.find(m => m.id === formData.withdrawalMethod)?.time}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total Amount
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  ${(parseFloat(formData.amount) + (withdrawalMethods.find(m => m.id === formData.withdrawalMethod)?.fee || 0)).toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            sx={{ flex: 1, borderRadius: 2 }}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {step < 3 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!formData.amount || !formData.bankAccount}
              sx={{ flex: 1, borderRadius: 2 }}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => setShowConfirmDialog(true)}
              sx={{ flex: 1, borderRadius: 2 }}
              startIcon={<AccountBalance />}
            >
              Withdraw Funds
            </Button>
          )}
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Confirm Withdrawal</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to withdraw ${formData.amount} to your bank account?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button
            onClick={handleWithdraw}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AccountBalance />}
          >
            {loading ? 'Processing...' : 'Confirm Withdrawal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WithdrawPage;
