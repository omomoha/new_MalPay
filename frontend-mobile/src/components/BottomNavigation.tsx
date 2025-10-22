import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/colors';

interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabPress }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { id: 'cards', label: 'Cards', icon: 'card-outline', activeIcon: 'card' },
    { id: 'send', label: 'Send Money', icon: 'paper-plane-outline', activeIcon: 'paper-plane' },
    { id: 'transactions', label: 'Transaction History', icon: 'list-outline', activeIcon: 'list' },
    { id: 'account', label: 'Account', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigation}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress(tab.id)}
            >
              <Ionicons
                name={isActive ? (tab.activeIcon as any) : (tab.icon as any)}
                size={24}
                color={isActive ? colors.tabActive : colors.tabInactive}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.tabActive : colors.tabInactive }
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
  },
  navigation: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default BottomNavigation;
