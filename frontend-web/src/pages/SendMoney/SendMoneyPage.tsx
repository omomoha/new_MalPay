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
} from '@mui/material';
import {
  ArrowBack,
  Send,
  AccountBalance,
  CreditCard,
  QrCode,
  Person,
  Phone,
  Email,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';

const SendMoneyPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { cards } = useSelector((state: RootState) => state.cards as any);
  const { bankAccounts } = useSelector((state: RootState) => state.bankAccounts as any);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    description: '',
    paymentMethod: 'card',
    selectedCard: '',
    selectedBank: '',
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
    if (step === 1 && formData.recipient && formData.amount) {
      setStep(2);
    } else if (step === 2 && formData.paymentMethod) {
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

  const handleSend = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      dispatch(addNotification({
        type: 'success',
        message: `Successfully sent $${formData.amount} to ${formData.recipient}`,
      }));
      
      setShowConfirmDialog(false);
      navigate('/dashboard');
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to send money. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  };

  const recentContacts = [
    { name: 'John Doe', type: 'email', value: 'john@example.com', avatar: 'JD' },
    { name: 'Jane Smith', type: 'phone', value: '+1234567890', avatar: 'JS' },
    { name: 'Mike Johnson', type: 'email', value: 'mike@example.com', avatar: 'MJ' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Mobile App Bar */}
      <AppBar position="static" sx={{ bgcolor: '#1976d2', boxShadow: 2 }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 1 }}>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Send Money
          </Typography>
          <IconButton color="inherit">
            <QrCode />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Progress Indicator */}
      <Box sx={{ p: 2, bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          {[1, 2, 3].map((stepNumber) => (
            <Box
              key={stepNumber}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: step >= stepNumber ? '#1976d2' : '#e0e0e0',
              }}
            />
          ))}
        </Box>
        <Typography variant="body2" sx={{ textAlign: 'center', mt: 1, color: 'text.secondary' }}>
          Step {step} of 3
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Step 1: Recipient & Amount */}
        {step === 1 && (
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Who are you sending to?
              </Typography>
              
              <TextField
                fullWidth
                label="Recipient"
                value={formData.recipient}
                onChange={handleInputChange('recipient')}
                placeholder="Enter email, phone, or name"
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

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

              <TextField
                fullWidth
                label="Description (Optional)"
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="What's this for?"
                multiline
                rows={2}
                sx={{ mb: 3 }}
              />

              <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                Recent Contacts
              </Typography>
              
              <List sx={{ p: 0 }}>
                {recentContacts.map((contact, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      sx={{ px: 0, py: 1, cursor: 'pointer' }}
                      onClick={() => setFormData({ ...formData, recipient: contact.value })}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#1976d2', width: 40, height: 40 }}>
                          {contact.avatar}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={contact.name}
                        secondary={contact.value}
                      />
                      <Chip
                        label={contact.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </ListItem>
                    {index < recentContacts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Choose Payment Method
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  onChange={handleInputChange('paymentMethod')}
                >
                  <MenuItem value="card">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCard />
                      <Typography>Credit/Debit Card</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="bank">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalance />
                      <Typography>Bank Account</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {formData.paymentMethod === 'card' && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select Card</InputLabel>
                  <Select
                    value={formData.selectedCard}
                    onChange={handleInputChange('selectedCard')}
                  >
                    {cards?.cards?.map((card: any) => (
                      <MenuItem key={card.id} value={card.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CreditCard />
                          <Typography>{card.cardNumberMasked}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {formData.paymentMethod === 'bank' && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select Bank Account</InputLabel>
                  <Select
                    value={formData.selectedBank}
                    onChange={handleInputChange('selectedBank')}
                  >
                    {bankAccounts?.bankAccounts?.map((account: any) => (
                      <MenuItem key={account.id} value={account.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountBalance />
                          <Typography>{account.bankName} - {account.accountNumber}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Alert severity="info" sx={{ mb: 2 }}>
                Transaction fee: $2.50
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Review Transaction
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Recipient
                </Typography>
                <Typography variant="h6">{formData.recipient}</Typography>
              </Box>

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
                  Payment Method
                </Typography>
                <Typography variant="body1">
                  {formData.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Account'}
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Transaction Fee</Typography>
                <Typography variant="body2">$2.50</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  ${(parseFloat(formData.amount) + 2.50).toFixed(2)}
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
              disabled={!formData.recipient || !formData.amount}
              sx={{ flex: 1, borderRadius: 2 }}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => setShowConfirmDialog(true)}
              disabled={!formData.selectedCard && !formData.selectedBank}
              sx={{ flex: 1, borderRadius: 2 }}
              startIcon={<Send />}
            >
              Send Money
            </Button>
          )}
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Confirm Transaction</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to send ${formData.amount} to {formData.recipient}?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSend}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          >
            {loading ? 'Sending...' : 'Confirm Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SendMoneyPage;
