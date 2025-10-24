import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Grid, 
  Card, 
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import BalancePage from './Balance/BalancePage';
import TransactionDetailPage from './TransactionDetail/TransactionDetailPage';
import SendMoneyPage from './SendMoney/SendMoneyPage';
import WithdrawPage from './Withdraw/WithdrawPage';
import QRCodePage from './QRCode/QRCodePage';
import ProfileSetupPage from './ProfileSetup/ProfileSetupPage';

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
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [cards, setCards] = useState([
    {
      id: 'card-1',
      cardNumberMasked: '4532 **** **** 9012',
      cardType: 'visa',
      expiryMonth: 12,
      expiryYear: 2026,
      cardholderName: 'Demo User',
      isDefault: true,
      isActive: true,
    },
    {
      id: 'card-2',
      cardNumberMasked: '5555 **** **** 4444',
      cardType: 'mastercard',
      expiryMonth: 8,
      expiryYear: 2025,
      cardholderName: 'Demo User',
      isDefault: false,
      isActive: true,
    }
  ]);

  const handleAddCard = () => {
    setAddCardOpen(true);
  };

  const handleCloseAddCard = () => {
    setAddCardOpen(false);
  };

  const handleSubmitCard = (cardData: any) => {
    // In a real app, this would make an API call
    console.log('Adding card:', cardData);
    setAddCardOpen(false);
    // For demo purposes, we'll just show a success message
    alert('Card added successfully!');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Mobile App Bar */}
      <Box sx={{ 
        bgcolor: 'white', 
        px: 2, 
        py: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: 1
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'black' }}>
          Your Cards
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCard}
          sx={{ borderRadius: 2 }}
        >
          Add Card
        </Button>
      </Box>

      <Box sx={{ p: 2 }}>
        {cards.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              No cards added yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add your first card to start making payments
            </Typography>
            <Button variant="contained" onClick={handleAddCard} sx={{ borderRadius: 2 }}>
              Add Your First Card
            </Button>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {cards.map((card) => (
              <Grid size={12} key={card.id}>
                <Card 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: card.cardType === 'visa' 
                      ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                      : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {card.cardType.toUpperCase()}
                    </Typography>
                    {card.isDefault && (
                      <Chip 
                        label="Default" 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: 'white',
                          fontWeight: 'medium'
                        }} 
                      />
                    )}
                  </Box>
                  
                  <Typography variant="h4" sx={{ mb: 3, fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {card.cardNumberMasked}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                        {card.cardholderName}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: 40, 
                      height: 30, 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {card.cardType === 'visa' ? 'VISA' : 'MC'}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <AddCardDialog
          open={addCardOpen}
          onClose={handleCloseAddCard}
          onSubmit={handleSubmitCard}
        />
      </Box>
    </Box>
  );
};

// Add Card Dialog Component
interface AddCardDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (cardData: any) => void;
}

const AddCardDialog: React.FC<AddCardDialogProps> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardType: 'visa'
  });

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.cardNumber || !formData.cardholderName || !formData.expiryMonth || !formData.expiryYear || !formData.cvv) {
      alert('Please fill in all fields');
      return;
    }

    // Mask the card number for display
    const maskedNumber = formData.cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 **** **** $4');
    
    const cardData = {
      cardNumberMasked: maskedNumber,
      cardholderName: formData.cardholderName,
      expiryMonth: parseInt(formData.expiryMonth),
      expiryYear: parseInt(formData.expiryYear),
      cardType: formData.cardType,
      isDefault: false,
      isActive: true
    };

    onSubmit(cardData);
    
    // Reset form
    setFormData({
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardType: 'visa'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Card</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Card Number"
                value={formData.cardNumber}
                onChange={handleInputChange('cardNumber')}
                placeholder="1234 5678 9012 3456"
                inputProps={{ maxLength: 19 }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Cardholder Name"
                value={formData.cardholderName}
                onChange={handleInputChange('cardholderName')}
                placeholder="John Doe"
              />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Expiry Month</InputLabel>
                <Select
                  value={formData.expiryMonth}
                  onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {(i + 1).toString().padStart(2, '0')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Expiry Year</InputLabel>
                <Select
                  value={formData.expiryYear}
                  onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="CVV"
                value={formData.cvv}
                onChange={handleInputChange('cvv')}
                placeholder="123"
                inputProps={{ maxLength: 4 }}
                type="password"
              />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Card Type</InputLabel>
                <Select
                  value={formData.cardType}
                  onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
                >
                  <MenuItem value="visa">Visa</MenuItem>
                  <MenuItem value="mastercard">Mastercard</MenuItem>
                  <MenuItem value="verve">Verve</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Add Card
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Add Bank Account Dialog Component
interface AddBankDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (bankData: any) => void;
}

const AddBankDialog: React.FC<AddBankDialogProps> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    bankCode: ''
  });

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.accountName || !formData.accountNumber || !formData.bankName || !formData.bankCode) {
      alert('Please fill in all fields');
      return;
    }

    const bankData = {
      accountName: formData.accountName,
      accountNumber: formData.accountNumber,
      bankName: formData.bankName,
      bankCode: formData.bankCode,
      isPrimary: false,
      isActive: true
    };

    onSubmit(bankData);
    
    // Reset form
    setFormData({
      accountName: '',
      accountNumber: '',
      bankName: '',
      bankCode: ''
    });
  };

  const nigerianBanks = [
    { name: 'Access Bank', code: '044' },
    { name: 'Citibank Nigeria', code: '023' },
    { name: 'Diamond Bank', code: '063' },
    { name: 'Ecobank Nigeria', code: '050' },
    { name: 'Fidelity Bank', code: '070' },
    { name: 'First Bank of Nigeria', code: '011' },
    { name: 'First City Monument Bank', code: '214' },
    { name: 'Guaranty Trust Bank', code: '058' },
    { name: 'Heritage Bank', code: '030' },
    { name: 'Keystone Bank', code: '082' },
    { name: 'Kuda Bank', code: '50211' },
    { name: 'Opay', code: '100032' },
    { name: 'PalmPay', code: '999991' },
    { name: 'Polaris Bank', code: '076' },
    { name: 'Providus Bank', code: '101' },
    { name: 'Stanbic IBTC Bank', code: '221' },
    { name: 'Standard Chartered Bank', code: '068' },
    { name: 'Sterling Bank', code: '232' },
    { name: 'Suntrust Bank', code: '100' },
    { name: 'Union Bank of Nigeria', code: '032' },
    { name: 'United Bank for Africa', code: '033' },
    { name: 'Unity Bank', code: '215' },
    { name: 'VFD Microfinance Bank', code: '566' },
    { name: 'Wema Bank', code: '035' },
    { name: 'Zenith Bank', code: '057' }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Bank Account</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Account Name"
                value={formData.accountName}
                onChange={handleInputChange('accountName')}
                placeholder="John Doe"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Account Number"
                value={formData.accountNumber}
                onChange={handleInputChange('accountNumber')}
                placeholder="1234567890"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>Bank</InputLabel>
                <Select
                  value={formData.bankName}
                  onChange={(e) => {
                    const selectedBank = nigerianBanks.find(bank => bank.name === e.target.value);
                    setFormData({ 
                      ...formData, 
                      bankName: e.target.value,
                      bankCode: selectedBank?.code || ''
                    });
                  }}
                >
                  {nigerianBanks.map((bank) => (
                    <MenuItem key={bank.code} value={bank.name}>
                      {bank.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Bank Code"
                value={formData.bankCode}
                onChange={handleInputChange('bankCode')}
                placeholder="044"
                disabled
                helperText="Bank code is automatically set based on selected bank"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Add Bank Account
        </Button>
      </DialogActions>
    </Dialog>
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
  const [addBankOpen, setAddBankOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([
    {
      id: 'bank-1',
      accountName: 'Demo User',
      accountNumber: '1234567890',
      bankName: 'Access Bank',
      bankCode: '044',
      isPrimary: true,
      isActive: true,
    },
    {
      id: 'bank-2',
      accountName: 'Demo User',
      accountNumber: '0987654321',
      bankName: 'GTBank',
      bankCode: '058',
      isPrimary: false,
      isActive: true,
    }
  ]);

  const handleAddBank = () => {
    setAddBankOpen(true);
  };

  const handleCloseAddBank = () => {
    setAddBankOpen(false);
  };

  const handleSubmitBank = (bankData: any) => {
    // In a real app, this would make an API call
    console.log('Adding bank account:', bankData);
    setAddBankOpen(false);
    // For demo purposes, we'll just show a success message
    alert('Bank account added successfully!');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Mobile App Bar */}
      <Box sx={{ 
        bgcolor: 'white', 
        px: 2, 
        py: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: 1
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'black' }}>
          Bank Accounts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddBank}
          sx={{ borderRadius: 2 }}
        >
          Add Account
        </Button>
      </Box>

      <Box sx={{ p: 2 }}>
        {bankAccounts.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              No bank accounts added yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add your first bank account to start receiving payments
            </Typography>
            <Button variant="contained" onClick={handleAddBank} sx={{ borderRadius: 2 }}>
              Add Your First Bank Account
            </Button>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {bankAccounts.map((account) => (
              <Grid size={12} key={account.id}>
                <Card 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: account.isPrimary
                      ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {account.bankName}
                    </Typography>
                    {account.isPrimary && (
                      <Chip 
                        label="Primary" 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: 'white',
                          fontWeight: 'medium'
                        }} 
                      />
                    )}
                  </Box>
                  
                  <Typography variant="h4" sx={{ mb: 3, fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {account.accountNumber}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                        {account.accountName}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Bank Code: {account.bankCode}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: 40, 
                      height: 30, 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {account.bankName.substring(0, 2).toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <AddBankDialog
          open={addBankOpen}
          onClose={handleCloseAddBank}
          onSubmit={handleSubmitBank}
        />
      </Box>
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
  BalancePage,
  TransactionDetailPage,
  ProfileSetupPage,
  NotFoundPage,
};
