import React from 'react';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';

export interface UserQRData {
  userId: string;
  email: string;
  name: string;
  phoneNumber?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
}

export interface QRCodeInfo {
  qrData: string;
  displayData: UserQRData;
  qrImage?: string; // Base64 encoded QR code image
}

class UserQRCodeService {
  private static instance: UserQRCodeService;
  
  public static getInstance(): UserQRCodeService {
    if (!UserQRCodeService.instance) {
      UserQRCodeService.instance = new UserQRCodeService();
    }
    return UserQRCodeService.instance;
  }

  /**
   * Generate QR code data for a user
   */
  generateUserQRCode(userData: UserQRData): QRCodeInfo {
    const qrData = JSON.stringify({
      type: 'malpay_user',
      version: '1.0',
      userId: userData.userId,
      email: userData.email,
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      isActive: userData.isActive,
      timestamp: new Date().toISOString(),
    });

    return {
      qrData,
      displayData: userData,
    };
  }

  /**
   * Parse QR code data to extract user information
   */
  parseQRCode(qrData: string): UserQRData | null {
    try {
      const parsed = JSON.parse(qrData);
      
      if (parsed.type !== 'malpay_user') {
        return null;
      }

      return {
        userId: parsed.userId,
        email: parsed.email,
        name: parsed.name,
        phoneNumber: parsed.phoneNumber,
        isActive: parsed.isActive,
        createdAt: parsed.timestamp,
      };
    } catch (error) {
      console.error('Error parsing QR code:', error);
      return null;
    }
  }

  /**
   * Validate QR code data
   */
  validateQRCode(qrData: string): boolean {
    try {
      const parsed = JSON.parse(qrData);
      return (
        parsed.type === 'malpay_user' &&
        parsed.userId &&
        parsed.email &&
        parsed.name &&
        parsed.isActive === true
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Get QR code display name
   */
  getQRCodeDisplayName(userData: UserQRData): string {
    return `${userData.name} (${userData.email})`;
  }

  /**
   * Generate QR code for current user (mock implementation)
   */
  generateCurrentUserQRCode(): QRCodeInfo {
    // In a real app, this would come from user profile/state
    const currentUser: UserQRData = {
      userId: 'user_123456',
      email: 'john.doe@example.com',
      name: 'John Doe',
      phoneNumber: '+234 801 234 5678',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    return this.generateUserQRCode(currentUser);
  }
}

export const userQRCodeService = UserQRCodeService.getInstance();

// User QR Code Display Component
interface UserQRCodeDisplayProps {
  userData: UserQRData;
  onShare?: () => void;
  onSave?: () => void;
  onRefresh?: () => void;
}

export const UserQRCodeDisplay: React.FC<UserQRCodeDisplayProps> = ({
  userData,
  onShare,
  onSave,
  onRefresh,
}) => {
  const qrInfo = userQRCodeService.generateUserQRCode(userData);

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      Alert.alert('Share QR Code', 'QR code sharing feature coming soon!');
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    } else {
      Alert.alert('Save QR Code', 'QR code saving feature coming soon!');
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      Alert.alert('Refresh QR Code', 'QR code refreshed!');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Your Payment QR Code</h3>
        <p style={styles.subtitle}>
          Others can scan this QR code to send you money
        </p>
      </div>

      <div style={styles.qrContainer}>
        {/* QR Code Placeholder */}
        <div style={styles.qrCodePlaceholder}>
          <Ionicons name="qr-code" size={120} color={colors.primary} />
          <p style={styles.qrPlaceholderText}>QR Code</p>
          <p style={styles.qrDataText}>{qrInfo.qrData.substring(0, 50)}...</p>
        </div>

        {/* User Info */}
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            <Ionicons name="person" size={32} color="white" />
          </div>
          <div style={styles.userDetails}>
            <h4 style={styles.userName}>{userData.name}</h4>
            <p style={styles.userEmail}>{userData.email}</p>
            {userData.phoneNumber && (
              <p style={styles.userPhone}>{userData.phoneNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.actions}>
        <button style={styles.actionButton} onClick={handleShare}>
          <Ionicons name="share" size={20} color={colors.primary} />
          <span style={styles.actionText}>Share</span>
        </button>
        
        <button style={styles.actionButton} onClick={handleSave}>
          <Ionicons name="download" size={20} color={colors.primary} />
          <span style={styles.actionText}>Save</span>
        </button>
        
        <button style={styles.actionButton} onClick={handleRefresh}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
          <span style={styles.actionText}>Refresh</span>
        </button>
      </div>

      {/* Instructions */}
      <div style={styles.instructions}>
        <h4 style={styles.instructionsTitle}>How it works:</h4>
        <ul style={styles.instructionsList}>
          <li>Share this QR code with others</li>
          <li>They scan it with their MalPay app</li>
          <li>They enter the amount and send money</li>
          <li>You receive the money instantly</li>
        </ul>
      </div>
    </div>
  );
};

// QR Code Scanner with User Info Display
interface QRUserScannerProps {
  onUserFound: (userData: UserQRData) => void;
  onClose: () => void;
}

export const QRUserScanner: React.FC<QRUserScannerProps> = ({
  onUserFound,
  onClose,
}) => {
  const handleQRCodeScanned = (data: string) => {
    const userData = userQRCodeService.parseQRCode(data);
    
    if (userData) {
      onUserFound(userData);
    } else {
      Alert.alert(
        'Invalid QR Code',
        'This QR code is not a valid MalPay user QR code.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <div style={styles.scannerContainer}>
      <div style={styles.scannerHeader}>
        <h3 style={styles.scannerTitle}>Scan User QR Code</h3>
        <button style={styles.closeButton} onClick={onClose}>
          <Ionicons name="close" size={24} color="white" />
        </button>
      </div>
      
      <div style={styles.scannerPlaceholder}>
        <Ionicons name="camera" size={80} color={colors.primary} />
        <p style={styles.scannerText}>Camera view would be here</p>
        <p style={styles.scannerSubtext}>Scan a MalPay user's QR code</p>
      </div>
      
      <div style={styles.scannerActions}>
        <button 
          style={styles.scanButton}
          onClick={() => handleQRCodeScanned('{"type":"malpay_user","userId":"user_123","email":"jane@example.com","name":"Jane Smith","isActive":true}')}
        >
          <Ionicons name="scan" size={20} color="white" />
          <span style={styles.scanButtonText}>Test Scan</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    backgroundColor: colors.background,
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  qrContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    ...shadows.small,
  },
  qrCodePlaceholder: {
    alignItems: 'center' as const,
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
    textAlign: 'center' as const,
  },
  userInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 100,
    justifyContent: 'center' as const,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  instructions: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  instructionsList: {
    margin: 0,
    paddingLeft: 20,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  scannerHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  scannerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'transparent',
    border: 'none',
  },
  scannerPlaceholder: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  scannerText: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
  },
  scannerSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 8,
  },
  scannerActions: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  scanButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
};

export default userQRCodeService;
