import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  Security,
  CheckCircle,
  ArrowForward,
  ArrowBack,
  Person,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';

const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [showBankDialog, setShowBankDialog] = useState(false);

  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardType: 'visa',
  });

  const [bankData, setBankData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    bankCode: '',
  });

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const steps = [
    {
      label: 'Personal Information',
      description: 'Complete your basic profile details',
      icon: <Person />,
    },
    {
      label: 'Add Payment Card',
      description: 'Add a credit or debit card for payments',
      icon: <CreditCard />,
    },
    {
      label: 'Add Bank Account',
      description: 'Link your bank account for withdrawals',
      icon: <AccountBalance />,
    },
    {
      label: 'Security Setup',
      description: 'Set up PIN and security preferences',
      icon: <Security />,
    },
  ];

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
    { name: 'Zenith Bank', code: '057' },
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      dispatch(addNotification({
        type: 'success',
        message: 'Profile setup completed successfully!',
      }));
      
      navigate('/dashboard');
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to complete profile setup. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const handleCardSubmit = () => {
    console.log('Card data:', cardData);
    handleStepComplete(1);
    setShowCardDialog(false);
    dispatch(addNotification({
      type: 'success',
      message: 'Card added successfully!',
    }));
  };

  const handleBankSubmit = () => {
    console.log('Bank data:', bankData);
    handleStepComplete(2);
    setShowBankDialog(false);
    dispatch(addNotification({
      type: 'success',
      message: 'Bank account added successfully!',
    }));
  };

  const renderStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Personal Information
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="First Name"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="Phone Number"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />

            <TextField
              fullWidth
              label="Address"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="City"
                value={profileData.city}
                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
              />
              <TextField
                fullWidth
                label="State"
                value={profileData.state}
                onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
              />
              <TextField
                fullWidth
                label="ZIP Code"
                value={profileData.zipCode}
                onChange={(e) => setProfileData({ ...profileData, zipCode: e.target.value })}
              />
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              This information is required for identity verification and compliance with financial regulations.
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Add Payment Card
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Add a credit or debit card to enable payments and transactions.
            </Typography>

            <Card sx={{ p: 3, mb: 3, border: '2px dashed #e0e0e0' }}>
              <Box sx={{ textAlign: 'center' }}>
                <CreditCard sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No cards added yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add your first card to start making payments
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowCardDialog(true)}
                  startIcon={<CreditCard />}
                >
                  Add Card
                </Button>
              </Box>
            </Card>

            <Alert severity="warning">
              You need to add at least one card to complete your profile setup.
            </Alert>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Add Bank Account
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Link your bank account to enable withdrawals and transfers.
            </Typography>

            <Card sx={{ p: 3, mb: 3, border: '2px dashed #e0e0e0' }}>
              <Box sx={{ textAlign: 'center' }}>
                <AccountBalance sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No bank accounts added yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add your bank account to enable withdrawals
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowBankDialog(true)}
                  startIcon={<AccountBalance />}
                >
                  Add Bank Account
                </Button>
              </Box>
            </Card>

            <Alert severity="warning">
              You need to add at least one bank account to complete your profile setup.
            </Alert>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Security Setup
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Set up your security preferences and PIN for secure transactions.
            </Typography>

            <List sx={{ p: 0 }}>
              <ListItem sx={{ px: 0, py: 2 }}>
                <ListItemIcon>
                  <Security />
                </ListItemIcon>
                <ListItemText
                  primary="Set Transaction PIN"
                  secondary="Create a 4-digit PIN for secure transactions"
                />
                <Button variant="outlined" size="small">
                  Setup
                </Button>
              </ListItem>
              
              <Divider />
              
              <ListItem sx={{ px: 0, py: 2 }}>
                <ListItemIcon>
                  <CheckCircle />
                </ListItemIcon>
                <ListItemText
                  primary="Enable Biometric Authentication"
                  secondary="Use fingerprint or face ID for quick access"
                />
                <Checkbox defaultChecked />
              </ListItem>
              
              <Divider />
              
              <ListItem sx={{ px: 0, py: 2 }}>
                <ListItemIcon>
                  <CheckCircle />
                </ListItemIcon>
                <ListItemText
                  primary="Enable Two-Factor Authentication"
                  secondary="Add an extra layer of security to your account"
                />
                <Checkbox defaultChecked />
              </ListItem>
            </List>

            <Alert severity="success" sx={{ mt: 3 }}>
              Your security settings have been configured. You can change these anytime in settings.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Complete Your Profile
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Set up your account to start using MalPay
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={({ active, completed }) => (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: completed ? '#4caf50' : active ? '#1976d2' : '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        {completed ? <CheckCircle /> : step.icon}
                      </Box>
                    )}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {step.label}
                      </Typography>
                      {completedSteps.includes(index) && (
                        <Chip label="Completed" size="small" color="success" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    {renderStepContent(index)}
                    <Box sx={{ mb: 2, mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mr: 1 }}
                        disabled={loading}
                        endIcon={loading ? <CircularProgress size={20} /> : <ArrowForward />}
                      >
                        {activeStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
                      </Button>
                      <Button
                        onClick={handleBack}
                        disabled={activeStep === 0}
                        startIcon={<ArrowBack />}
                      >
                        Back
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      </Box>

      {/* Add Card Dialog */}
      <Dialog open={showCardDialog} onClose={() => setShowCardDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Payment Card</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Card Number"
              value={cardData.cardNumber}
              onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
              placeholder="1234 5678 9012 3456"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Cardholder Name"
              value={cardData.cardholderName}
              onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Expiry Month</InputLabel>
                <Select
                  value={cardData.expiryMonth}
                  onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value })}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {(i + 1).toString().padStart(2, '0')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Expiry Year</InputLabel>
                <Select
                  value={cardData.expiryYear}
                  onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value })}
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
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="CVV"
                value={cardData.cvv}
                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                type="password"
                sx={{ flex: 1 }}
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Card Type</InputLabel>
                <Select
                  value={cardData.cardType}
                  onChange={(e) => setCardData({ ...cardData, cardType: e.target.value })}
                >
                  <MenuItem value="visa">Visa</MenuItem>
                  <MenuItem value="mastercard">Mastercard</MenuItem>
                  <MenuItem value="verve">Verve</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCardDialog(false)}>Cancel</Button>
          <Button onClick={handleCardSubmit} variant="contained">
            Add Card
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Bank Dialog */}
      <Dialog open={showBankDialog} onClose={() => setShowBankDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Bank Account</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Account Name"
              value={bankData.accountName}
              onChange={(e) => setBankData({ ...bankData, accountName: e.target.value })}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Account Number"
              value={bankData.accountNumber}
              onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
              sx={{ mb: 3 }}
            />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Bank</InputLabel>
              <Select
                value={bankData.bankName}
                onChange={(e) => {
                  const selectedBank = nigerianBanks.find(bank => bank.name === e.target.value);
                  setBankData({
                    ...bankData,
                    bankName: e.target.value,
                    bankCode: selectedBank?.code || '',
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
            <TextField
              fullWidth
              label="Bank Code"
              value={bankData.bankCode}
              disabled
              helperText="Bank code is automatically set based on selected bank"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBankDialog(false)}>Cancel</Button>
          <Button onClick={handleBankSubmit} variant="contained">
            Add Bank Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileSetupPage;
