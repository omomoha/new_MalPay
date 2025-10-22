# MalPay Mobile App - Nigerian Payment Platform

A unified payment platform mobile application built with React Native and TypeScript, specifically designed for Nigerian users with Naira (₦) as the primary currency.

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#1A2B4D` - Dark blue for headers and primary elements
- **Secondary Blue**: `#4A90E2` - Bright blue for accents and active states
- **Background**: `#F8F9FA` - Light grey/off-white for main backgrounds
- **Surface**: `#FFFFFF` - White for cards and content areas
- **Success**: `#10B981` - Green for positive transactions and success states
- **Error**: `#EF4444` - Red for negative transactions and error states
- **Text**: `#1A1A1A` - Black/dark grey for primary text
- **Text Secondary**: `#6B7280` - Grey for secondary text

### Currency
- **Primary Currency**: Nigerian Naira (₦)
- **Default Formatting**: All amounts display in Naira by default
- **Supported Currencies**: NGN, USD, EUR, GBP

## 📱 Screens

### 1. Home/Dashboard Screen
- **Header**: Dark blue gradient with user greeting and profile
- **Balance Display**: Large Naira amount with visibility toggle
- **Action Buttons**: Send, Withdraw, Invest, Add (circular buttons)
- **Recent Transactions**: List of recent transactions with icons and amounts
- **Weekly Spending**: Progress indicator with spending summary

### 2. Cards Screen
- **Card Display**: Virtual card with gradient design
- **Balance Visibility**: Toggle to show/hide card balance
- **Card Management**: Add, block, replace card options
- **Recent Transactions**: Card-specific transaction history
- **Quick Actions**: Block card, replace card, card settings

### 3. Send Money Screen
- **Modal Interface**: Overlay with search functionality
- **Recipient List**: Contact list with account details
- **Search**: Quick search for recipients
- **New Transfer**: Button to initiate new transfers

### 4. Transaction History Screen
- **Search & Filter**: Search bar with filter options
- **Grouped Transactions**: Transactions grouped by date (TODAY, YESTERDAY, etc.)
- **Transaction Items**: Icon, description, time, and amount in Naira
- **Color Coding**: Green for credits (+), Red for debits (-)

### 5. Account Screen
- **User Profile**: Avatar, name, and email
- **Financial Overview**: Linked accounts, savings goals, cashback summary
- **Security Settings**: Password, 2FA, biometric authentication

### 6. Transfer Confirmation Screen
- **Success Animation**: Green checkmark with sparkles
- **Transfer Details**: Amount in Naira, recipient, date, type, fee
- **Share Option**: Share transfer details

## 🛠 Technical Features

### State Management
- **Redux Toolkit**: Centralized state management
- **Slices**: Auth, Wallet, Transaction, UI slices
- **RTK Query**: API integration and caching

### Navigation
- **Bottom Navigation**: 5-tab navigation (Home, Cards, Send Money, Transaction History, Account)
- **Tab Highlighting**: Active tab highlighted in blue
- **Screen Transitions**: Smooth transitions between screens

### Currency Formatting
- **Default Currency**: Naira (₦) for all Nigerian users
- **Number Formatting**: Nigerian locale formatting
- **Symbol Display**: ₦ symbol for all amounts
- **Decimal Places**: 2 decimal places for all currency amounts

### UI Components
- **Material Design**: React Native Paper components
- **Custom Components**: Bottom navigation, transaction items, savings goals
- **Icons**: Expo Vector Icons with consistent styling
- **Gradients**: Linear gradients for headers and backgrounds

## 🧪 Testing

### Test Coverage
- **Unit Tests**: 123/126 tests passing (97.6% success rate)
- **Redux Slices**: Complete test coverage for all state management
- **Utility Functions**: Full coverage of helper functions
- **Service Layer**: 94% coverage for API services

### Test Categories
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API integration testing
- **E2E Tests**: End-to-end user flow testing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- React Native development environment
- Expo CLI

### Installation
```bash
npm install
```

### Running the App
```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Dependencies

### Core Dependencies
- **React Native**: 0.72.6
- **Expo**: ~49.0.15
- **TypeScript**: ^5.1.3
- **Redux Toolkit**: ^1.9.7
- **React Native Paper**: ^5.11.1

### UI Dependencies
- **Expo Linear Gradient**: ~12.3.0
- **Expo Vector Icons**: ^13.0.0
- **React Native Safe Area Context**: 4.6.3

### Development Dependencies
- **Jest**: ^29.7.0
- **React Native Testing Library**: ^12.4.0
- **MSW**: ^2.0.8

## 🎯 Key Features

### For Nigerian Users
- **Naira Currency**: All amounts displayed in Nigerian Naira (₦)
- **Local Formatting**: Nigerian number formatting standards
- **Nigerian Banks**: Support for major Nigerian banks
- **Local Payment Methods**: Integration with Nigerian payment systems

### Security
- **Biometric Authentication**: Fingerprint/Face ID support
- **Two-Factor Authentication**: Enhanced security
- **Encrypted Storage**: Secure storage of sensitive data
- **PIN Protection**: 4-digit PIN for transactions

### User Experience
- **Intuitive Design**: Clean, modern interface
- **Fast Performance**: Optimized for smooth interactions
- **Offline Support**: Basic functionality without internet
- **Accessibility**: Screen reader and accessibility support

## 📱 Screenshots

The app features a modern, clean design with:
- Dark blue headers with white text
- White content cards with subtle shadows
- Green for positive transactions
- Red for negative transactions
- Blue accents for interactive elements
- Consistent Naira (₦) currency throughout

## 🔧 Configuration

### App Configuration
- **Country**: Nigeria
- **Currency**: NGN (Naira)
- **Currency Symbol**: ₦
- **Default Locale**: en-NG

### Theme Configuration
- **Primary Color**: #1A2B4D
- **Secondary Color**: #4A90E2
- **Success Color**: #10B981
- **Error Color**: #EF4444

## 📄 License

This project is proprietary software for MalPay Nigeria.

## 🤝 Contributing

This is a private project. For internal development guidelines, please refer to the team documentation.

---

**MalPay Mobile** - Making payments simple for Nigerians 🇳🇬