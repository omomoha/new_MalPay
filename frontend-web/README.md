# 🌐 MalPay Web Application

A comprehensive web-based international money transfer platform built with React, TypeScript, and Material-UI. This web application provides the same functionality as the mobile app with a responsive design that works seamlessly across all devices.

## 🚀 Features

### 🔐 Authentication & Security
- **User Registration**: Complete signup flow with email verification
- **Secure Login**: JWT-based authentication with refresh tokens
- **Profile Completion**: Guided setup for new users
- **Input Sanitization**: XSS and injection attack prevention
- **Rate Limiting**: Protection against brute force attacks

### 💳 Card Management
- **Add Cards**: Secure card addition with encryption
- **Card Validation**: Luhn algorithm and format validation
- **Default Card**: Set primary card for transactions
- **Card Limits**: Maximum 3 cards per user
- **Fee Management**: ₦50 fee for card addition

### 💰 Payment Processing
- **Send Money**: International transfers via email
- **QR Code Payments**: Scan and pay functionality
- **Transaction History**: Complete transaction tracking
- **Fee Calculation**: Transparent fee structure
- **Multi-Currency**: Support for NGN, USD, EUR

### 🏦 Bank Integration
- **Account Linking**: Connect multiple bank accounts
- **Instant Verification**: Real-time account validation
- **Withdrawals**: Direct bank transfers
- **Primary Account**: Set default withdrawal account

### 🌍 International Transfers
- **Global Reach**: Send money to any country
- **USDT Bridge**: Blockchain-powered transfers
- **Real-Time Settlement**: Instant processing
- **Multi-Network**: Tron, Polygon, Ethereum support

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Material-UI**: Professional UI components
- **Redux Toolkit**: State management
- **React Router**: Client-side routing
- **Formik + Yup**: Form handling and validation
- **Axios**: HTTP client with interceptors

### Design System
- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: User preference support
- **Material Design**: Google's design principles
- **Accessibility**: WCAG compliant components
- **Custom Theme**: MalPay brand colors and typography

### State Management
- **Redux Toolkit**: Centralized state management
- **RTK Query**: Efficient data fetching
- **Persistent Storage**: Local storage integration
- **Real-time Updates**: Live data synchronization

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 0px - 599px (xs)
- **Tablet**: 600px - 899px (sm)
- **Desktop**: 900px+ (md+)

### Features
- **Mobile Navigation**: Collapsible sidebar
- **Touch-Friendly**: Optimized for touch devices
- **Adaptive Layout**: Components adjust to screen size
- **Progressive Enhancement**: Works on all devices

## 🔧 Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend API running on port 3000

### Installation
```bash
# Clone the repository
git clone https://github.com/omomoha/new_MalPay.git
cd new_MalPay/frontend-web

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Configuration
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_ENV=development
REACT_APP_NAME=MalPay
REACT_APP_VERSION=1.0.0
```

## 🏗️ Project Structure

```
frontend-web/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   ├── Layout/
│   │   └── UI/
│   ├── pages/
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── Cards/
│   │   ├── Payments/
│   │   └── BankAccounts/
│   ├── store/
│   │   ├── slices/
│   │   └── index.ts
│   ├── services/
│   │   └── api.ts
│   ├── theme/
│   │   └── index.ts
│   ├── types/
│   └── utils/
├── package.json
└── tsconfig.json
```

## 🎨 UI Components

### Layout Components
- **Layout**: Main application layout with sidebar
- **ProtectedRoute**: Authentication guard
- **NotificationSnackbar**: Toast notifications

### Form Components
- **LoginForm**: User authentication
- **RegisterForm**: User registration
- **CardForm**: Card addition form
- **BankAccountForm**: Bank account linking

### Data Display
- **TransactionList**: Transaction history
- **CardList**: User's cards
- **BankAccountList**: Linked accounts
- **Dashboard**: Overview and quick actions

## 🔌 API Integration

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/verify-email` - Email verification
- `GET /auth/profile-completion` - Profile status

### Card Management
- `GET /cards` - Fetch user cards
- `POST /cards` - Add new card
- `PUT /cards/:id/set-default` - Set default card
- `DELETE /cards/:id` - Remove card

### Payment Processing
- `POST /payments/transfer` - Send money
- `GET /payments/transactions` - Transaction history
- `GET /payments/transactions/:id` - Transaction details

### Bank Accounts
- `GET /bank-accounts` - Fetch accounts
- `POST /bank-accounts` - Add account
- `DELETE /bank-accounts/:id` - Remove account

## 🧪 Testing

### Test Commands
```bash
# Run tests
npm test

# Run tests with coverage
npm run test -- --coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

### Test Coverage
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API integration testing
- **E2E Tests**: Complete user flow testing
- **Accessibility Tests**: WCAG compliance testing

## 🚀 Deployment

### Production Build
```bash
# Create production build
npm run build

# Serve build locally
npx serve -s build
```

### Deployment Options
- **Vercel**: Easy deployment with Git integration
- **Netlify**: Static site hosting
- **AWS S3**: Scalable cloud hosting
- **Railway**: Full-stack deployment

### Environment Variables
```env
REACT_APP_API_URL=https://api.malpay.com/api/v1
REACT_APP_ENV=production
REACT_APP_ENABLE_ANALYTICS=true
```

## 🔒 Security Features

### Client-Side Security
- **Input Validation**: Client-side form validation
- **XSS Prevention**: Sanitized user inputs
- **CSRF Protection**: Token-based protection
- **Secure Storage**: Encrypted local storage

### Authentication Security
- **JWT Tokens**: Secure token-based auth
- **Refresh Tokens**: Automatic token renewal
- **Session Management**: Secure session handling
- **Logout Protection**: Secure logout process

## 📊 Performance Optimization

### Code Splitting
- **Route-based Splitting**: Lazy loading of pages
- **Component Splitting**: Dynamic imports
- **Bundle Analysis**: Webpack bundle analyzer

### Caching Strategy
- **API Caching**: RTK Query caching
- **Browser Caching**: Service worker caching
- **CDN Integration**: Static asset delivery

### Performance Metrics
- **Lighthouse Score**: 90+ performance rating
- **Core Web Vitals**: Optimized for Google metrics
- **Bundle Size**: Optimized bundle size
- **Load Time**: Sub-3 second load times

## 🌐 Browser Support

### Supported Browsers
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Progressive Enhancement
- **Modern Features**: ES6+ support
- **Fallbacks**: Graceful degradation
- **Polyfills**: Cross-browser compatibility

## 📱 Mobile Optimization

### Mobile Features
- **Touch Gestures**: Swipe and tap support
- **Mobile Navigation**: Bottom navigation
- **Responsive Images**: Optimized image loading
- **Offline Support**: Service worker caching

### PWA Features
- **Installable**: Add to home screen
- **Offline Mode**: Works without internet
- **Push Notifications**: Real-time updates
- **Background Sync**: Data synchronization

## 🔧 Development

### Development Tools
- **React DevTools**: Component debugging
- **Redux DevTools**: State inspection
- **TypeScript**: Type checking
- **ESLint**: Code quality

### Code Quality
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks

### Development Workflow
1. **Feature Branch**: Create feature branch
2. **Development**: Implement features
3. **Testing**: Write and run tests
4. **Code Review**: Peer review process
5. **Merge**: Merge to main branch

## 📈 Analytics & Monitoring

### User Analytics
- **Page Views**: Track user navigation
- **User Actions**: Monitor user interactions
- **Performance**: Track app performance
- **Errors**: Monitor application errors

### Business Metrics
- **Transaction Volume**: Track payment volume
- **User Growth**: Monitor user acquisition
- **Feature Usage**: Track feature adoption
- **Revenue**: Monitor transaction fees

## 🤝 Contributing

### Contribution Guidelines
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for new features
5. Submit a pull request

### Code Standards
- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow ESLint rules
- **Testing**: Write tests for new features
- **Documentation**: Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check the documentation
- **Issues**: Create GitHub issues
- **Discussions**: Use GitHub discussions
- **Email**: Contact support team

### Common Issues
- **Build Errors**: Check Node.js version
- **API Errors**: Verify backend is running
- **Type Errors**: Run type checking
- **Lint Errors**: Fix ESLint issues

## 🎯 Roadmap

### Upcoming Features
- **Advanced Analytics**: Detailed transaction analytics
- **Multi-Language**: Internationalization support
- **Advanced Security**: Enhanced security features
- **API Integration**: Third-party service integration

### Future Enhancements
- **Mobile App**: React Native mobile app
- **Desktop App**: Electron desktop app
- **API SDK**: Developer SDK
- **White Label**: Customizable branding

---

**MalPay Web Application** - Secure, fast, and reliable international money transfers powered by blockchain technology. 🌍💸