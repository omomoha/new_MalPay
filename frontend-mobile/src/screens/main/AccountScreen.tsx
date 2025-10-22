import React, { useState, useEffect } from 'react';
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
import { UserQRCodeDisplay, UserQRData } from '@services/UserQRCodeService';

interface AccountScreenProps {
  navigation: any;
}

const AccountScreen: React.FC<AccountScreenProps> = ({ navigation }) => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const userBalance = 25000.00;
  const userName = 'John Doe';
  const userEmail = 'john.doe@example.com';
  const userPhone = '+234 801 234 5678';

  // Mock user data for QR code
  const userQRData: UserQRData = {
    userId: 'user_123456',
    email: userEmail,
    name: userName,
    phoneNumber: userPhone,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const accountSections = [
    {
      title: 'Payment',
      items: [
        {
          title: 'My QR Code',
          subtitle: 'Share your QR code to receive money',
          icon: 'qr-code',
          onPress: () => setShowQRCode(true),
        },
        {
          title: 'Withdraw',
          subtitle: 'Withdraw money to your bank account',
          icon: 'card-outline',
          onPress: () => navigation.navigate('Withdrawal', { screen: 'WithdrawAmount' }),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          title: 'Profile',
          subtitle: 'Personal information',
          icon: 'person',
          onPress: () => navigation.navigate('Settings', { screen: 'Settings' }),
        },
        {
          title: 'Security',
          subtitle: 'Password, PIN, and security',
          icon: 'shield-checkmark',
          onPress: () => navigation.navigate('Settings', { screen: 'Security' }),
        },
        {
          title: 'Notifications',
          subtitle: 'Push and email notifications',
          icon: 'notifications',
          onPress: () => navigation.navigate('Settings', { screen: 'Notifications' }),
        },
      ],
    },
    {
      title: 'Payment Methods',
      items: [
        {
          title: 'Cards',
          subtitle: 'Manage your cards',
          icon: 'card',
          onPress: () => navigation.navigate('Settings', { screen: 'LinkedCards' }),
        },
        {
          title: 'Bank Accounts',
          subtitle: 'Manage bank accounts',
          icon: 'business',
          onPress: () => navigation.navigate('Settings', { screen: 'BankAccounts' }),
        },
      ],
    },
    {
      title: 'Verification',
      items: [
        {
          title: 'KYC Verification',
          subtitle: 'Complete identity verification',
          icon: 'checkmark-circle',
          onPress: () => navigation.navigate('Settings', { screen: 'KYC' }),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help Center',
          subtitle: 'Get help and support',
          icon: 'help-circle',
          onPress: () => Alert.alert('Help Center', 'Help center coming soon!'),
        },
        {
          title: 'Contact Us',
          subtitle: 'Get in touch with us',
          icon: 'mail',
          onPress: () => Alert.alert('Contact Us', 'Contact us feature coming soon!'),
        },
        {
          title: 'About',
          subtitle: 'App version and info',
          icon: 'information-circle',
          onPress: () => Alert.alert('About', 'MalPay v1.0.0\n© 2025 MalPay. All rights reserved.'),
        },
      ],
    },
  ];

  const renderAccountSection = (section: any) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map((item: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index === section.items.length - 1 && styles.lastMenuItem,
            ]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
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
        
        <Text style={styles.headerTitle}>Account</Text>
        
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{userName.split(' ').map(n => n[0]).join('')}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
            <Text style={styles.userPhone}>{userPhone}</Text>
          </View>
        </View>

        {/* Balance */}
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
        {accountSections.map(renderAccountSection)}
        
        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Logout', style: 'destructive', onPress: () => {
                    // TODO: Implement logout
                    Alert.alert('Logout', 'Logout feature coming soon!');
                  }},
                ]
              );
            }}
          >
            <Ionicons name="log-out" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* QR Code Modal */}
      {showQRCode && (
        <View style={styles.qrModal}>
          <View style={styles.qrModalContent}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>Your Payment QR Code</Text>
              <TouchableOpacity
                style={styles.qrCloseButton}
                onPress={() => setShowQRCode(false)}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <UserQRCodeDisplay
              userData={userQRData}
              onShare={() => {
                Alert.alert('Share QR Code', 'QR code sharing feature coming soon!');
              }}
              onSave={() => {
                Alert.alert('Save QR Code', 'QR code saving feature coming soon!');
              }}
              onRefresh={() => {
                Alert.alert('Refresh QR Code', 'QR code refreshed!');
              }}
            />
          </View>
        </View>
      )}
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 2,
  },
  userPhone: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    ...shadows.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logoutSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.error,
    marginLeft: 8,
  },
  qrModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  qrModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  qrModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  qrCloseButton: {
    padding: 4,
  },
});

export default AccountScreen;