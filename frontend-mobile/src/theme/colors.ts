export const colors = {
  // Primary colors
  primary: '#1A2B4D', // Dark blue
  primaryLight: '#2A3B5D',
  primaryDark: '#0F1A2E',
  
  // Secondary colors
  secondary: '#4A90E2', // Bright blue
  secondaryLight: '#6BA3E8',
  secondaryDark: '#357ABD',
  
  // Background colors
  background: '#F8F9FA', // Light grey/off-white
  surface: '#FFFFFF',
  surfaceVariant: '#F1F3F4',
  
  // Text colors
  text: '#1A1A1A', // Black/dark grey
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  
  // Status colors
  success: '#10B981', // Green
  successLight: '#34D399',
  successDark: '#059669',
  
  error: '#EF4444', // Red
  errorLight: '#F87171',
  errorDark: '#DC2626',
  
  warning: '#F59E0B', // Amber
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  
  info: '#3B82F6', // Blue
  infoLight: '#60A5FA',
  infoDark: '#2563EB',
  
  // Financial colors
  positive: '#10B981', // Green for credits
  negative: '#EF4444', // Red for debits
  neutral: '#6B7280', // Grey for neutral amounts
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Brand colors for transaction icons
  vimeo: '#1AB7EA',
  youtube: '#FF0000',
  paypal: '#0070BA',
  mastercard: '#EB001B',
  visa: '#1A1F71',
  
  // Navigation colors
  tabActive: '#4A90E2',
  tabInactive: '#9CA3AF',
  
  // Card colors
  cardBackground: '#FFFFFF',
  cardBorder: '#E5E7EB',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
};

export const gradients = {
  primary: ['#1A2B4D', '#2A3B5D'],
  secondary: ['#4A90E2', '#6BA3E8'],
  success: ['#10B981', '#34D399'],
  error: ['#EF4444', '#F87171'],
  surface: ['#FFFFFF', '#F8F9FA'],
};

export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
};
