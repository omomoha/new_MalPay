import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';
import QRCodeScanner from '@components/QRCodeScanner';
import { QRUserScanner, UserQRData } from '@services/UserQRCodeService';

interface SendMoneyScreenProps {
  navigation: any;
}

const SendMoneyScreen: React.FC<SendMoneyScreenProps> = ({ navigation }) => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedUser, setScannedUser] = useState<UserQRData | null>(null);
  const userBalance = 25000.00;

  const quickActions = [
    {
      id: '1',
      title: 'Send Money',
      subtitle: 'Transfer to contacts',
      icon: 'send',
      color: colors.primary,
      onPress: () => navigation.navigate('Payment', { screen: 'SendMoney' }),
    },
    {
      id: '2',
      title: 'Request Money',
      subtitle: 'Request from contacts',
      icon: 'arrow-down-circle',
      color: colors.secondary,
      onPress: () => navigation.navigate('Payment', { screen: 'RequestMoney' }),
    },
    {
      id: '3',
      title: 'QR Code',
      subtitle: 'Scan to pay',
      icon: 'qr-code',
      color: colors.info,
      onPress: () => setShowQRScanner(true),
    },
    {
      id: '4',
      title: 'Bank Transfer',
      subtitle: 'Transfer to bank',
      icon: 'business',
      color: colors.warning,
      onPress: () => Alert.alert('Bank Transfer', 'Bank transfer feature coming soon!'),
    },
  ];

  const recentContacts = [
    {
      id: '1',
      name: 'John Doe',
      phone: '+234 801 234 5678',
      avatar: 'JD',
      lastAmount: 5000,
      lastDate: '2 days ago',
    },
    {
      id: '2',
      name: 'Jane Smith',
      phone: '+234 802 345 6789',
      avatar: 'JS',
      lastAmount: 2500,
      lastDate: '1 week ago',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      phone: '+234 803 456 7890',
      avatar: 'MJ',
      lastAmount: 10000,
      lastDate: '2 weeks ago',
    },
  ];

  const renderQuickAction = (action: any) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionCard}
      onPress={action.onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
        <Ionicons name={action.icon} size={24} color={action.color} />
      </View>
      <Text style={styles.quickActionTitle}>{action.title}</Text>
      <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
    </TouchableOpacity>
  );

  const handleQRCodeScanned = (data: string) => {
    setShowQRScanner(false);
    
    try {
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'malpay_user') {
        // Show receiver information and proceed to transfer
        const userData: UserQRData = {
          userId: qrData.userId,
          email: qrData.email,
          name: qrData.name,
          phoneNumber: qrData.phoneNumber,
          isActive: qrData.isActive,
          createdAt: qrData.timestamp,
        };
        
        setScannedUser(userData);
        
        Alert.alert(
          'User Found',
          `Found: ${userData.name} (${userData.email})\n\nProceed to send money?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Send Money', 
              onPress: () => {
                // Navigate to payment flow with scanned user data
                navigation.navigate('Payment', { 
                  screen: 'SendMoney',
                  params: { 
                    recipientEmail: userData.email,
                    recipientName: userData.name,
                    fromQR: true
                  }
                });
                setScannedUser(null);
              }
            },
          ]
        );
      } else {
        Alert.alert('Invalid QR Code', 'This QR code is not a valid MalPay user QR code.');
      }
    } catch (error) {
      Alert.alert('Invalid QR Code', 'This QR code is not a valid MalPay user QR code.');
    }
  };

  const handleUserFound = (userData: UserQRData) => {
    setScannedUser(userData);
    
    Alert.alert(
      'User Found',
      `Found: ${userData.name} (${userData.email})\n\nProceed to send money?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setScannedUser(null) },
        { 
          text: 'Send Money', 
          onPress: () => {
            // Navigate to payment flow with scanned user data
            navigation.navigate('Payment', { 
              screen: 'SendMoney',
              params: { 
                recipientEmail: userData.email,
                recipientName: userData.name,
                fromQR: true
              }
            });
            setScannedUser(null);
          }
        },
      ]
    );
  };

  if (showQRScanner) {
    return (
      <QRUserScanner
        onUserFound={handleUserFound}
        onClose={() => setShowQRScanner(false)}
      />
    );
  }

  const renderRecentContact = (contact: any) => (
    <TouchableOpacity
      key={contact.id}
      style={styles.contactCard}
      onPress={() => navigation.navigate('Payment', { 
        screen: 'SendMoney',
        params: { recipientEmail: contact.phone }
      })}
    >
      <View style={styles.contactAvatar}>
        <Text style={styles.contactAvatarText}>{contact.avatar}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactPhone}>{contact.phone}</Text>
        <Text style={styles.contactLastAmount}>
          Last: {formatCurrency(contact.lastAmount)} • {contact.lastDate}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.time}>9:41</Text>
          <View style={styles.statusIcons}>
            <Ionicons name="cellular-outline" size={16} color="white" />
            <Ionicons name="wifi-outline" size={16} color="white" style={styles.statusIcon} />
            <Ionicons name="battery-half-outline" size={16} color="white" />
          </View>
        </View>
        
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {balanceVisible ? formatCurrency(userBalance) : '••••••'}
            </Text>
            <TouchableOpacity
              onPress={() => setBalanceVisible(!balanceVisible)}
              style={styles.eyeButton}
            >
              <Ionicons 
                name={balanceVisible ? 'eye' : 'eye-off'} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Recent Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Contacts</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.contactsList}>
            {recentContacts.map(renderRecentContact)}
          </View>
        </View>

        {/* Send to New Contact */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.newContactButton}
            onPress={() => navigation.navigate('Payment', { screen: 'SendMoney' })}
          >
            <View style={styles.newContactIcon}>
              <Ionicons name="person-add" size={24} color={colors.primary} />
            </View>
            <Text style={styles.newContactText}>Send to New Contact</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  time: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginLeft: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  balanceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceAmount: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  eyeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    ...shadows.small,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  contactsList: {
    backgroundColor: 'white',
    borderRadius: 12,
    ...shadows.small,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  contactLastAmount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  newContactButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.small,
  },
  newContactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  newContactText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});

export default SendMoneyScreen;
