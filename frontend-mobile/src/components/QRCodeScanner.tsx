import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';

interface QRCodeScannerProps {
  navigation: any;
  onQRCodeScanned: (data: string) => void;
  onClose: () => void;
}

interface QRPaymentData {
  type: 'payment_request' | 'user_profile' | 'merchant';
  userId?: string;
  merchantId?: string;
  amount?: number;
  currency?: string;
  description?: string;
  merchantName?: string;
  userName?: string;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ navigation, onQRCodeScanned, onClose }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      // Parse QR code data
      const qrData: QRPaymentData = JSON.parse(data);
      onQRCodeScanned(data);
    } catch (error) {
      // Handle non-JSON QR codes (simple text)
      Alert.alert(
        'QR Code Scanned',
        `Scanned: ${data}`,
        [
          { text: 'Cancel', onPress: () => setScanned(false) },
          { text: 'Process', onPress: () => onQRCodeScanned(data) },
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera permission is required to scan QR codes</Text>
        <TouchableOpacity style={styles.button} onPress={getCameraPermissions}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <TouchableOpacity 
          style={styles.flashButton} 
          onPress={() => setFlashOn(!flashOn)}
        >
          <Ionicons 
            name={flashOn ? "flash" : "flash-off"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
          flashMode={flashOn ? Camera.Constants.FlashMode.torch : Camera.Constants.FlashMode.off}
        />
        
        {/* Scanning Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Position the QR code within the frame to scan
        </Text>
        <Text style={styles.instructionSubtext}>
          Make sure the QR code is well-lit and clearly visible
        </Text>
      </View>

      {/* Reset Button */}
      {scanned && (
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={() => setScanned(false)}
        >
          <Text style={styles.resetButtonText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

// QR Code Generator Component
interface QRCodeGeneratorProps {
  userId: string;
  userName: string;
  amount?: number;
  description?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  userId,
  userName,
  amount,
  description,
}) => {
  const [qrData, setQrData] = useState<string>('');

  useEffect(() => {
    const paymentData: QRPaymentData = {
      type: 'payment_request',
      userId,
      userName,
      amount,
      description,
    };
    setQrData(JSON.stringify(paymentData));
  }, [userId, userName, amount, description]);

  const handleShareQR = () => {
    // TODO: Implement QR code sharing
    Alert.alert('Share QR Code', 'QR code sharing feature coming soon!');
  };

  const handleSaveQR = () => {
    // TODO: Implement QR code saving
    Alert.alert('Save QR Code', 'QR code saving feature coming soon!');
  };

  return (
    <View style={styles.qrContainer}>
      <Text style={styles.qrTitle}>Your Payment QR Code</Text>
      
      {/* QR Code Placeholder */}
      <View style={styles.qrCodePlaceholder}>
        <Ionicons name="qr-code" size={120} color={colors.primary} />
        <Text style={styles.qrPlaceholderText}>QR Code</Text>
        <Text style={styles.qrDataText}>{qrData}</Text>
      </View>

      {/* QR Info */}
      <View style={styles.qrInfo}>
        <Text style={styles.qrInfoTitle}>Payment Request</Text>
        <Text style={styles.qrInfoText}>Name: {userName}</Text>
        {amount && <Text style={styles.qrInfoText}>Amount: {formatCurrency(amount)}</Text>}
        {description && <Text style={styles.qrInfoText}>Description: {description}</Text>}
      </View>

      {/* Action Buttons */}
      <View style={styles.qrActions}>
        <TouchableOpacity style={styles.qrActionButton} onPress={handleShareQR}>
          <Ionicons name="share" size={20} color={colors.primary} />
          <Text style={styles.qrActionText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.qrActionButton} onPress={handleSaveQR}>
          <Ionicons name="download" size={20} color={colors.primary} />
          <Text style={styles.qrActionText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// QR Payment Processing Component
interface QRPaymentProcessorProps {
  qrData: string;
  onProcessPayment: (paymentData: QRPaymentData) => void;
  onCancel: () => void;
}

export const QRPaymentProcessor: React.FC<QRPaymentProcessorProps> = ({
  qrData,
  onProcessPayment,
  onCancel,
}) => {
  const [paymentData, setPaymentData] = useState<QRPaymentData | null>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(qrData);
      setPaymentData(parsed);
    } catch (error) {
      Alert.alert('Invalid QR Code', 'This QR code is not a valid payment request.');
      onCancel();
    }
  }, [qrData]);

  const handleProcessPayment = () => {
    if (paymentData) {
      onProcessPayment(paymentData);
    }
  };

  if (!paymentData) {
    return (
      <View style={styles.container}>
        <Text>Processing QR code...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Request</Text>
      
      <View style={styles.paymentDetails}>
        <Text style={styles.detailLabel}>From:</Text>
        <Text style={styles.detailValue}>{paymentData.userName || 'Unknown User'}</Text>
        
        {paymentData.amount && (
          <>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>{formatCurrency(paymentData.amount)}</Text>
          </>
        )}
        
        {paymentData.description && (
          <>
            <Text style={styles.detailLabel}>Description:</Text>
            <Text style={styles.detailValue}>{paymentData.description}</Text>
          </>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.payButton} onPress={handleProcessPayment}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  flashButton: {
    padding: 8,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructions: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: colors.primary,
    padding: 16,
    margin: 20,
    borderRadius: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  qrContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  qrCodePlaceholder: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    marginBottom: 20,
  },
  qrPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 12,
  },
  qrDataText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  qrInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  qrInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  qrInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  qrActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  qrActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    flex: 0.4,
    justifyContent: 'center',
  },
  qrActionText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentDetails: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    flex: 0.48,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 0.48,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default QRCodeScanner;
