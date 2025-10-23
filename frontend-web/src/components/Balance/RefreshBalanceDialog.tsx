import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CreditCard,
  CalendarToday,
  Security,
  Person,
} from '@mui/icons-material';

interface RefreshBalanceDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (cardData: any) => void;
  cardId: string;
}

const RefreshBalanceDialog: React.FC<RefreshBalanceDialogProps> = ({
  open,
  onClose,
  onConfirm,
  cardId,
}) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
  });
  const [showCvv, setShowCvv] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '');
      const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [field]: formatted }));
    }
    // Format expiry month (2 digits max)
    else if (field === 'expiryMonth') {
      const month = value.replace(/\D/g, '').slice(0, 2);
      setFormData(prev => ({ ...prev, [field]: month }));
    }
    // Format expiry year (4 digits max)
    else if (field === 'expiryYear') {
      const year = value.replace(/\D/g, '').slice(0, 4);
      setFormData(prev => ({ ...prev, [field]: year }));
    }
    // Format CVV (3-4 digits max)
    else if (field === 'cvv') {
      const cvv = value.replace(/\D/g, '').slice(0, 4);
      setFormData(prev => ({ ...prev, [field]: cvv }));
    }
    else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Card number validation
    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{13,19}$/.test(cardNumber)) {
      newErrors.cardNumber = 'Card number must be 13-19 digits';
    } else if (!/^5[1-5]/.test(cardNumber) && !/^2[2-7]/.test(cardNumber)) {
      newErrors.cardNumber = 'Only Mastercard numbers are supported';
    }

    // Expiry month validation
    if (!formData.expiryMonth) {
      newErrors.expiryMonth = 'Expiry month is required';
    } else if (!/^(0[1-9]|1[0-2])$/.test(formData.expiryMonth)) {
      newErrors.expiryMonth = 'Invalid month (01-12)';
    }

    // Expiry year validation
    if (!formData.expiryYear) {
      newErrors.expiryYear = 'Expiry year is required';
    } else {
      const year = parseInt(formData.expiryYear);
      const currentYear = new Date().getFullYear();
      if (year < currentYear || year > currentYear + 20) {
        newErrors.expiryYear = 'Invalid year';
      }
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }

    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    } else if (formData.cardholderName.trim().length < 2) {
      newErrors.cardholderName = 'Cardholder name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm({
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cvv: formData.cvv,
        cardholderName: formData.cardholderName.trim(),
      });
    }
  };

  const handleClose = () => {
    setFormData({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
    });
    setErrors({});
    setShowCvv(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CreditCard color="primary" />
          <Typography variant="h6">Refresh Mastercard Balance</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Enter your Mastercard details to refresh your account balance. 
            This information is encrypted and securely transmitted.
          </Typography>
        </Alert>

        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Card Number"
              value={formData.cardNumber}
              onChange={handleInputChange('cardNumber')}
              error={!!errors.cardNumber}
              helperText={errors.cardNumber || 'Enter your Mastercard number'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCard />
                  </InputAdornment>
                ),
              }}
              placeholder="1234 5678 9012 3456"
            />
          </Grid>

          <Grid size={6}>
            <TextField
              fullWidth
              label="Expiry Month"
              value={formData.expiryMonth}
              onChange={handleInputChange('expiryMonth')}
              error={!!errors.expiryMonth}
              helperText={errors.expiryMonth || 'MM'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday />
                  </InputAdornment>
                ),
              }}
              placeholder="12"
            />
          </Grid>

          <Grid size={6}>
            <TextField
              fullWidth
              label="Expiry Year"
              value={formData.expiryYear}
              onChange={handleInputChange('expiryYear')}
              error={!!errors.expiryYear}
              helperText={errors.expiryYear || 'YYYY'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday />
                  </InputAdornment>
                ),
              }}
              placeholder="2025"
            />
          </Grid>

          <Grid size={6}>
            <TextField
              fullWidth
              label="CVV"
              type={showCvv ? 'text' : 'password'}
              value={formData.cvv}
              onChange={handleInputChange('cvv')}
              error={!!errors.cvv}
              helperText={errors.cvv || 'Security code'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Security />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCvv(!showCvv)}
                      edge="end"
                    >
                      {showCvv ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              placeholder="123"
            />
          </Grid>

          <Grid size={6}>
            <TextField
              fullWidth
              label="Cardholder Name"
              value={formData.cardholderName}
              onChange={handleInputChange('cardholderName')}
              error={!!errors.cardholderName}
              helperText={errors.cardholderName || 'As it appears on card'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
              placeholder="John Doe"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={Object.values(errors).some(error => error !== '')}
        >
          Refresh Balance
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RefreshBalanceDialog;
