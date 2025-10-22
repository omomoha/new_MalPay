import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  List,
  Avatar,
  Divider,
  Switch,
  ActivityIndicator,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootState, AppDispatch } from '@store';
import { MainTabParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { logout } from '@store/slices/authSlice';

type ProfileScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile } = useSelector((state: RootState) => state.user);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement actual API calls
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading profile data:', error);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Account Deletion', 'Account deletion feature coming soon!');
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@malpay.com?subject=Support Request');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://malpay.com/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://malpay.com/terms');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return customTheme.colors.primary;
      case 'pending':
        return customTheme.colors.tertiary;
      case 'rejected':
        return customTheme.colors.error;
      default:
        return customTheme.colors.onSurfaceVariant;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Profile
          </Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.profileHeader}>
              <Avatar.Text
                size={80}
                label={getInitials(`${profile?.firstName || ''} ${profile?.lastName || ''}`)}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text variant="headlineSmall" style={styles.profileName}>
                  {profile?.firstName} {profile?.lastName}
                </Text>
                <Text variant="bodyMedium" style={styles.profileEmail}>
                  {user?.email}
                </Text>
                <Text variant="bodySmall" style={styles.profileUsername}>
                  @{user?.username}
                </Text>
              </View>
            </View>
            
            <View style={styles.kycStatus}>
              <Text variant="bodySmall" style={styles.kycLabel}>
                KYC Status:
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.kycStatusText, { color: getKYCStatusColor(profile?.kycStatus || 'pending') }]}
              >
                {profile?.kycStatus?.toUpperCase() || 'PENDING'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Account Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Account Settings
            </Text>
            
            <List.Item
              title="Personal Information"
              description="Update your profile details"
              left={(props) => <List.Icon {...props} icon="account-edit" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Settings', { screen: 'Settings' })}
            />
            <Divider />
            
            <List.Item
              title="Security"
              description="Password, 2FA, and security settings"
              left={(props) => <List.Icon {...props} icon="security" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Settings', { screen: 'Security' })}
            />
            <Divider />
            
            <List.Item
              title="Linked Cards"
              description={`${0} cards linked`}
              left={(props) => <List.Icon {...props} icon="credit-card" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Settings', { screen: 'LinkedCards' })}
            />
            <Divider />
            
            <List.Item
              title="Bank Accounts"
              description="Manage withdrawal accounts"
              left={(props) => <List.Icon {...props} icon="account-balance" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Settings', { screen: 'BankAccounts' })}
            />
            <Divider />
            
            <List.Item
              title="KYC Verification"
              description="Complete identity verification"
              left={(props) => <List.Icon {...props} icon="account-check" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Settings', { screen: 'KYC' })}
            />
          </Card.Content>
        </Card>

        {/* Preferences */}
        <Card style={styles.preferencesCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Preferences
            </Text>
            
            <List.Item
              title="Push Notifications"
              description="Receive transaction and security alerts"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  color={customTheme.colors.primary}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title="Biometric Authentication"
              description="Use fingerprint or face ID for login"
              left={(props) => <List.Icon {...props} icon="fingerprint" />}
              right={() => (
                <Switch
                  value={biometricEnabled}
                  onValueChange={setBiometricEnabled}
                  color={customTheme.colors.primary}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title="Dark Mode"
              description="Switch to dark theme"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={false}
                  onValueChange={() => {}}
                  color={customTheme.colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Support & Legal */}
        <Card style={styles.supportCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Support & Legal
            </Text>
            
            <List.Item
              title="Help Center"
              description="Get help and support"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Linking.openURL('https://malpay.com/help')}
            />
            <Divider />
            
            <List.Item
              title="Contact Support"
              description="Send us a message"
              left={(props) => <List.Icon {...props} icon="email" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleContactSupport}
            />
            <Divider />
            
            <List.Item
              title="Privacy Policy"
              description="How we protect your data"
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handlePrivacyPolicy}
            />
            <Divider />
            
            <List.Item
              title="Terms of Service"
              description="Terms and conditions"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleTermsOfService}
            />
          </Card.Content>
        </Card>

        {/* Account Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Account Actions
            </Text>
            
            <Button
              mode="outlined"
              onPress={handleLogout}
              style={styles.logoutButton}
              contentStyle={styles.buttonContent}
              icon="logout"
            >
              Logout
            </Button>
            
            <Button
              mode="text"
              onPress={handleDeleteAccount}
              style={styles.deleteButton}
              contentStyle={styles.buttonContent}
              textColor={customTheme.colors.error}
              icon="delete"
            >
              Delete Account
            </Button>
          </Card.Content>
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text variant="bodySmall" style={styles.appVersion}>
            MalPay v1.0.0
          </Text>
          <Text variant="bodySmall" style={styles.appCopyright}>
            © 2025 MalPay. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: customTheme.spacing.lg,
    paddingTop: customTheme.spacing.xl,
  },
  title: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
  },
  profileCard: {
    margin: customTheme.spacing.lg,
    marginTop: 0,
    elevation: 4,
    borderRadius: customTheme.borderRadius.lg,
  },
  profileContent: {
    paddingVertical: customTheme.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: customTheme.spacing.md,
  },
  avatar: {
    backgroundColor: customTheme.colors.primary,
    marginRight: customTheme.spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.xs,
  },
  profileEmail: {
    color: customTheme.colors.onSurfaceVariant,
    marginBottom: customTheme.spacing.xs,
  },
  profileUsername: {
    color: customTheme.colors.onSurfaceVariant,
  },
  kycStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: customTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: customTheme.colors.outlineVariant,
  },
  kycLabel: {
    color: customTheme.colors.onSurfaceVariant,
    marginRight: customTheme.spacing.sm,
  },
  kycStatusText: {
    fontWeight: 'bold',
  },
  settingsCard: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.md,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  preferencesCard: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.md,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  supportCard: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.md,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  actionsCard: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.md,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  sectionTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.md,
  },
  logoutButton: {
    marginBottom: customTheme.spacing.md,
    borderRadius: customTheme.borderRadius.lg,
    borderColor: customTheme.colors.outline,
  },
  deleteButton: {
    borderRadius: customTheme.borderRadius.lg,
  },
  buttonContent: {
    paddingVertical: customTheme.spacing.sm,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: customTheme.spacing.xl,
    paddingHorizontal: customTheme.spacing.lg,
  },
  appVersion: {
    color: customTheme.colors.onSurfaceVariant,
    marginBottom: customTheme.spacing.xs,
  },
  appCopyright: {
    color: customTheme.colors.onSurfaceVariant,
  },
});

export default ProfileScreen;
