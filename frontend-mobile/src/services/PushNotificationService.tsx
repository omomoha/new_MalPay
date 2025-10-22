import React, { useEffect, useState } from 'react';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  type: 'transaction' | 'security' | 'promotion' | 'system';
}

export interface PushNotificationService {
  requestPermissions: () => Promise<boolean>;
  getToken: () => Promise<string | null>;
  sendNotification: (notification: NotificationData) => Promise<void>;
  scheduleNotification: (notification: NotificationData, trigger: any) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
}

class PushNotificationServiceImpl implements PushNotificationService {
  private expoPushToken: string | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          Alert.alert('Permission Required', 'Push notifications permission is required to receive updates.');
          return false;
        }
        
        return true;
      } else {
        Alert.alert('Device Required', 'Push notifications only work on physical devices.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your actual project ID
      });
      
      this.expoPushToken = token.data;
      console.log('Expo Push Token:', this.expoPushToken);
      
      return this.expoPushToken;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  async sendNotification(notification: NotificationData): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async scheduleNotification(notification: NotificationData, trigger: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
        },
        trigger,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }
}

export const pushNotificationService = new PushNotificationServiceImpl();

// React Hook for Push Notifications
export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
    });

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification tap
      handleNotificationResponse(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const hasPermission = await pushNotificationService.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const token = await pushNotificationService.getToken();
      return token;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    // Handle different notification types
    switch (data?.type) {
      case 'transaction':
        // Navigate to transaction details
        console.log('Navigate to transaction:', data.transactionId);
        break;
      case 'security':
        // Navigate to security settings
        console.log('Navigate to security settings');
        break;
      case 'promotion':
        // Navigate to promotions
        console.log('Navigate to promotions');
        break;
      default:
        console.log('Handle general notification');
    }
  };

  const sendTestNotification = async () => {
    await pushNotificationService.sendNotification({
      title: 'Test Notification',
      body: 'This is a test notification from MalPay',
      type: 'system',
    });
  };

  return {
    expoPushToken,
    notification,
    isLoading,
    sendTestNotification,
    registerForPushNotificationsAsync,
  };
};

// Notification Templates
export const NotificationTemplates = {
  transactionReceived: (amount: number, sender: string): NotificationData => ({
    title: 'Payment Received',
    body: `You received ${amount} from ${sender}`,
    type: 'transaction',
    data: { amount, sender },
  }),

  transactionSent: (amount: number, recipient: string): NotificationData => ({
    title: 'Payment Sent',
    body: `You sent ${amount} to ${recipient}`,
    type: 'transaction',
    data: { amount, recipient },
  }),

  securityAlert: (message: string): NotificationData => ({
    title: 'Security Alert',
    body: message,
    type: 'security',
    data: { message },
  }),

  cardAdded: (cardType: string): NotificationData => ({
    title: 'Card Added',
    body: `Your ${cardType} card has been successfully added`,
    type: 'system',
    data: { cardType },
  }),

  lowBalance: (balance: number): NotificationData => ({
    title: 'Low Balance Alert',
    body: `Your balance is low: ${balance}`,
    type: 'system',
    data: { balance },
  }),

  promotion: (title: string, description: string): NotificationData => ({
    title,
    body: description,
    type: 'promotion',
    data: { title, description },
  }),
};

// Notification Settings Component
interface NotificationSettingsProps {
  onToggle: (enabled: boolean) => void;
  enabled: boolean;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onToggle,
  enabled,
}) => {
  const { expoPushToken, isLoading, sendTestNotification } = usePushNotifications();

  const handleTestNotification = async () => {
    await sendTestNotification();
    Alert.alert('Test Sent', 'A test notification has been sent!');
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Push Notifications</h3>
      
      <div style={{ marginBottom: 16 }}>
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          Enable Push Notifications
        </label>
      </div>

      {enabled && (
        <div>
          <p>Status: {expoPushToken ? 'Enabled' : 'Not Available'}</p>
          <p>Token: {expoPushToken ? `${expoPushToken.substring(0, 20)}...` : 'Not available'}</p>
          
          <button
            onClick={handleTestNotification}
            disabled={isLoading}
            style={{
              backgroundColor: '#1A2B4D',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {isLoading ? 'Loading...' : 'Send Test Notification'}
          </button>
        </div>
      )}
    </div>
  );
};

export default pushNotificationService;
