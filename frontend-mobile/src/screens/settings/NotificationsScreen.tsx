import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  List,
  Divider,
  ActivityIndicator,
  Switch,
  Chip,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '@store';
import { SettingsStackParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Notification, NotificationType } from '@types/user.types';

type NotificationsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'Notifications'>;

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    push: true,
    email: true,
    sms: false,
    transactions: true,
    security: true,
    marketing: false,
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement actual API call to load notifications
      setTimeout(() => {
        setIsLoading(false);
        // Mock data loading
      }, 1000);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = (notificationId: string) => {
    dispatch({
      type: 'notifications/markAsRead',
      payload: notificationId,
    });
  };

  const handleMarkAllAsRead = () => {
    dispatch({
      type: 'notifications/markAllAsRead',
    });
  };

  const handleDeleteNotification = (notificationId: string) => {
    dispatch({
      type: 'notifications/removeNotification',
      payload: notificationId,
    });
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TRANSACTION:
        return 'swap-horiz';
      case NotificationType.SECURITY:
        return 'security';
      case NotificationType.KYC:
        return 'account-check';
      case NotificationType.SYSTEM:
        return 'information';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TRANSACTION:
        return customTheme.colors.primary;
      case NotificationType.SECURITY:
        return customTheme.colors.error;
      case NotificationType.KYC:
        return customTheme.colors.tertiary;
      case NotificationType.SYSTEM:
        return customTheme.colors.secondary;
      default:
        return customTheme.colors.onSurfaceVariant;
    }
  };

  const formatNotificationTime = (createdAt: string) => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return notificationTime.toLocaleDateString();
    }
  };

  const renderNotification = (notification: Notification) => (
    <Card key={notification.id} style={[
      styles.notificationCard,
      !notification.isRead && styles.unreadCard
    ]}>
      <Card.Content style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationInfo}>
            <View style={[
              styles.notificationIcon,
              { backgroundColor: getNotificationColor(notification.type) }
            ]}>
              <Icon
                name={getNotificationIcon(notification.type)}
                size={20}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.notificationDetails}>
              <Text variant="bodyLarge" style={[
                styles.notificationTitle,
                !notification.isRead && styles.unreadText
              ]}>
                {notification.title}
              </Text>
              <Text variant="bodySmall" style={styles.notificationTime}>
                {formatNotificationTime(notification.createdAt)}
              </Text>
            </View>
          </View>
          {!notification.isRead && (
            <View style={styles.unreadDot} />
          )}
        </View>
        
        <Text variant="bodyMedium" style={styles.notificationMessage}>
          {notification.message}
        </Text>
        
        <View style={styles.notificationActions}>
          <Button
            mode="text"
            onPress={() => handleMarkAsRead(notification.id)}
            style={styles.actionButton}
            textColor={customTheme.colors.primary}
            compact
          >
            {notification.isRead ? 'Mark Unread' : 'Mark Read'}
          </Button>
          <Button
            mode="text"
            onPress={() => handleDeleteNotification(notification.id)}
            style={styles.actionButton}
            textColor={customTheme.colors.error}
            compact
          >
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <Card style={styles.emptyCard}>
      <Card.Content style={styles.emptyContent}>
        <Icon name="bell-outline" size={64} color={customTheme.colors.onSurfaceVariant} />
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          No Notifications
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          You're all caught up! New notifications will appear here.
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Button
              mode="text"
              onPress={handleMarkAllAsRead}
              style={styles.markAllButton}
            >
              Mark All Read
            </Button>
          )}
        </View>

        {/* Notification Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Notification Settings
            </Text>
            
            <List.Item
              title="Push Notifications"
              description="Receive notifications on your device"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={notificationSettings.push}
                  onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, push: value }))}
                  color={customTheme.colors.primary}
                />
              )}
              style={styles.settingItem}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Email Notifications"
              description="Receive notifications via email"
              left={(props) => <List.Icon {...props} icon="email" />}
              right={() => (
                <Switch
                  value={notificationSettings.email}
                  onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, email: value }))}
                  color={customTheme.colors.primary}
                />
              )}
              style={styles.settingItem}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="SMS Notifications"
              description="Receive notifications via SMS"
              left={(props) => <List.Icon {...props} icon="message-text" />}
              right={() => (
                <Switch
                  value={notificationSettings.sms}
                  onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, sms: value }))}
                  color={customTheme.colors.primary}
                />
              )}
              style={styles.settingItem}
            />
          </Card.Content>
        </Card>

        {/* Notification Types */}
        <Card style={styles.typesCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Notification Types
            </Text>
            
            <List.Item
              title="Transaction Notifications"
              description="Get notified about payments and transfers"
              left={(props) => <List.Icon {...props} icon="swap-horiz" />}
              right={() => (
                <Switch
                  value={notificationSettings.transactions}
                  onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, transactions: value }))}
                  color={customTheme.colors.primary}
                />
              )}
              style={styles.settingItem}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Security Alerts"
              description="Important security notifications"
              left={(props) => <List.Icon {...props} icon="security" />}
              right={() => (
                <Switch
                  value={notificationSettings.security}
                  onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, security: value }))}
                  color={customTheme.colors.primary}
                />
              )}
              style={styles.settingItem}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Marketing Updates"
              description="Product updates and promotional content"
              left={(props) => <List.Icon {...props} icon="bullhorn" />}
              right={() => (
                <Switch
                  value={notificationSettings.marketing}
                  onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, marketing: value }))}
                  color={customTheme.colors.primary}
                />
              )}
              style={styles.settingItem}
            />
          </Card.Content>
        </Card>

        {/* Notifications List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={customTheme.colors.primary} />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Loading notifications...
            </Text>
          </View>
        ) : notifications.length > 0 ? (
          <View style={styles.notificationsContainer}>
            {notifications.map(renderNotification)}
          </View>
        ) : (
          renderEmptyState()
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: customTheme.spacing.lg,
    paddingTop: customTheme.spacing.xl,
  },
  title: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
  },
  markAllButton: {
    marginLeft: -customTheme.spacing.sm,
  },
  settingsCard: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.md,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  typesCard: {
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
  settingItem: {
    paddingVertical: customTheme.spacing.xs,
  },
  divider: {
    marginVertical: customTheme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: customTheme.spacing.xxl,
  },
  loadingText: {
    color: customTheme.colors.onSurfaceVariant,
    marginTop: customTheme.spacing.md,
  },
  notificationsContainer: {
    paddingHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.xxl,
  },
  notificationCard: {
    marginBottom: customTheme.spacing.md,
    elevation: 1,
    borderRadius: customTheme.borderRadius.lg,
  },
  unreadCard: {
    backgroundColor: customTheme.colors.primaryContainer,
    elevation: 2,
  },
  notificationContent: {
    paddingVertical: customTheme.spacing.md,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: customTheme.spacing.sm,
  },
  notificationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: customTheme.spacing.md,
  },
  notificationDetails: {
    flex: 1,
  },
  notificationTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: '500',
    marginBottom: customTheme.spacing.xs,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notificationTime: {
    color: customTheme.colors.onSurfaceVariant,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: customTheme.colors.primary,
    marginLeft: customTheme.spacing.sm,
  },
  notificationMessage: {
    color: customTheme.colors.onSurface,
    marginBottom: customTheme.spacing.md,
    lineHeight: 20,
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: customTheme.spacing.sm,
  },
  emptyCard: {
    margin: customTheme.spacing.lg,
    elevation: 1,
    borderRadius: customTheme.borderRadius.lg,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: customTheme.spacing.xxl,
  },
  emptyTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginTop: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.sm,
  },
  emptyText: {
    color: customTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;
