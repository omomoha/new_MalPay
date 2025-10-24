import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  QrCode,
  Share,
  Download,
  Print,
  Refresh,
  AccountBalance,
  CreditCard,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';

// Mock QR Code component (in real app, use a QR code library)
const QRCodeDisplay: React.FC<{ data: string; size?: number }> = ({ data, size = 200 }) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        bgcolor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Mock QR Code Pattern */}
      <Box
        sx={{
          width: '90%',
          height: '90%',
          bgcolor: 'black',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '80%',
            height: '80%',
            background: `
              repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 4px,
                white 4px,
                white 8px
              ),
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                transparent 4px,
                white 4px,
                white 8px
              )
            `,
          },
        }}
      />
      {/* Corner squares */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          width: 24,
          height: 24,
          bgcolor: 'black',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 4,
            left: 4,
            width: 16,
            height: 16,
            bgcolor: 'white',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 2,
              left: 2,
              width: 12,
              height: 12,
              bgcolor: 'black',
            },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 24,
          height: 24,
          bgcolor: 'black',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          width: 24,
          height: 24,
          bgcolor: 'black',
        }}
      />
    </Box>
  );
};

const QRCodePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { cards } = useSelector((state: RootState) => state.cards as any);
  const { bankAccounts } = useSelector((state: RootState) => state.bankAccounts as any);

  const [qrData, setQrData] = useState('');
  const [qrType, setQrType] = useState('payment');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [qrType, amount, description]);

  const generateQRCode = () => {
    setLoading(true);
    
    // Simulate QR code generation
    setTimeout(() => {
      const qrContent = {
        type: qrType,
        userId: user?.id || 'demo-user',
        amount: amount || '0',
        description: description || '',
        timestamp: new Date().toISOString(),
      };
      
      setQrData(JSON.stringify(qrContent));
      setLoading(false);
    }, 1000);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'MalPay QR Code',
          text: 'Scan this QR code to send me money',
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href);
        dispatch(addNotification({
          type: 'success',
          message: 'QR Code link copied to clipboard!',
        }));
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to share QR code',
      }));
    }
  };

  const handleDownload = () => {
    // In a real app, you would generate and download the QR code image
    dispatch(addNotification({
      type: 'success',
      message: 'QR Code downloaded successfully!',
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const qrTypes = [
    { id: 'payment', name: 'Payment Request', icon: <AccountBalance />, description: 'Request money from others' },
    { id: 'profile', name: 'Profile Share', icon: <Person />, description: 'Share your profile' },
    { id: 'contact', name: 'Contact Info', icon: <CreditCard />, description: 'Share contact details' },
  ];

  const recentQRs = [
    { id: '1', type: 'payment', amount: '$50.00', description: 'Coffee money', date: '2 hours ago' },
    { id: '2', type: 'profile', amount: '', description: 'Profile share', date: '1 day ago' },
    { id: '3', type: 'payment', amount: '$25.00', description: 'Lunch split', date: '3 days ago' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Mobile App Bar */}
      <AppBar position="static" sx={{ bgcolor: '#1976d2', boxShadow: 2 }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 1 }}>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            QR Code
          </Typography>
          <IconButton color="inherit" onClick={() => setShowSettingsDialog(true)}>
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {/* QR Code Display */}
        <Card sx={{ borderRadius: 3, mb: 3, textAlign: 'center' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              {qrTypes.find(t => t.id === qrType)?.name}
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress size={60} />
              </Box>
            ) : (
              <QRCodeDisplay data={qrData} size={200} />
            )}

            {amount && (
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold', color: '#1976d2' }}>
                ${amount}
              </Typography>
            )}

            {description && (
              <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
                {description}
              </Typography>
            )}

            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Scan this QR code to {qrType === 'payment' ? 'send money' : 'connect'}
            </Typography>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={handleShare}
            sx={{ flex: 1, borderRadius: 2 }}
          >
            Share
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownload}
            sx={{ flex: 1, borderRadius: 2 }}
          >
            Download
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{ flex: 1, borderRadius: 2 }}
          >
            Print
          </Button>
        </Box>

        {/* Recent QR Codes */}
        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Recent QR Codes
            </Typography>
            
            <List sx={{ p: 0 }}>
              {recentQRs.map((qr, index) => (
                <React.Fragment key={qr.id}>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#1976d2' }}>
                        <QrCode />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {qrTypes.find(t => t.id === qr.type)?.name}
                          </Typography>
                          {qr.amount && (
                            <Chip label={qr.amount} size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {qr.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {qr.date}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentQRs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* QR Code Types */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              QR Code Types
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {qrTypes.map((type) => (
                <Paper
                  key={type.id}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: qrType === type.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    bgcolor: qrType === type.id ? '#f3f9ff' : 'white',
                  }}
                  onClick={() => setQrType(type.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#1976d2' }}>
                      {type.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {type.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                    {qrType === type.id && (
                      <Chip label="Selected" size="small" color="primary" />
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onClose={() => setShowSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR Code Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>QR Code Type</InputLabel>
              <Select
                value={qrType}
                onChange={(e) => setQrType(e.target.value)}
              >
                {qrTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {type.icon}
                      <Typography>{type.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {qrType === 'payment' && (
              <>
                <TextField
                  fullWidth
                  label="Amount (Optional)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this for?"
                  multiline
                  rows={2}
                  sx={{ mb: 3 }}
                />
              </>
            )}

            <Alert severity="info">
              QR codes expire after 24 hours for security reasons.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              generateQRCode();
              setShowSettingsDialog(false);
            }}
            variant="contained"
          >
            Generate QR Code
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QRCodePage;
