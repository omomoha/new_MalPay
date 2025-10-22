# MalPay Project Folder Structure

This document provides the complete folder structure for all components of the MalPay platform.

---

## Root Project Structure

```
malpay-platform/
├── backend/                    # Node.js + TypeScript backend
├── frontend-web/              # React web application
├── frontend-mobile/           # React Native mobile application
├── infrastructure/            # Infrastructure as Code (Terraform/CloudFormation)
├── docs/                      # Documentation
├── scripts/                   # Utility scripts
├── .github/                   # GitHub Actions workflows
├── docker-compose.yml         # Local development setup
├── .gitignore
├── README.md
└── package.json              # Root workspace configuration
```

---

## Backend Structure (Node.js + TypeScript)

```
backend/
├── src/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── routes/
│   │   │   │   ├── index.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── user.routes.ts
│   │   │   │   ├── card.routes.ts
│   │   │   │   ├── wallet.routes.ts
│   │   │   │   ├── payment.routes.ts
│   │   │   │   ├── transaction.routes.ts
│   │   │   │   ├── kyc.routes.ts
│   │   │   │   ├── notification.routes.ts
│   │   │   │   └── admin.routes.ts
│   │   │   │
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── card.controller.ts
│   │   │   │   ├── wallet.controller.ts
│   │   │   │   ├── payment.controller.ts
│   │   │   │   ├── transaction.controller.ts
│   │   │   │   ├── kyc.controller.ts
│   │   │   │   ├── notification.controller.ts
│   │   │   │   └── admin.controller.ts
│   │   │   │
│   │   │   ├── validators/
│   │   │   │   ├── auth.validator.ts
│   │   │   │   ├── user.validator.ts
│   │   │   │   ├── payment.validator.ts
│   │   │   │   └── common.validator.ts
│   │   │   │
│   │   │   └── middleware/
│   │   │       ├── authenticate.middleware.ts
│   │   │       ├── authorize.middleware.ts
│   │   │       ├── validate.middleware.ts
│   │   │       ├── rateLimiter.middleware.ts
│   │   │       ├── errorHandler.middleware.ts
│   │   │       └── logger.middleware.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── services/
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── token.service.ts
│   │   │   ├── twoFactor.service.ts
│   │   │   └── session.service.ts
│   │   │
│   │   ├── user/
│   │   │   ├── user.service.ts
│   │   │   └── profile.service.ts
│   │   │
│   │   ├── card/
│   │   │   ├── card.service.ts
│   │   │   └── cardVerification.service.ts
│   │   │
│   │   ├── wallet/
│   │   │   ├── wallet.service.ts
│   │   │   └── balance.service.ts
│   │   │
│   │   ├── payment/
│   │   │   ├── payment.service.ts
│   │   │   ├── transfer.service.ts
│   │   │   └── withdrawal.service.ts
│   │   │
│   │   ├── transaction/
│   │   │   ├── transaction.service.ts
│   │   │   └── transactionHistory.service.ts
│   │   │
│   │   ├── kyc/
│   │   │   ├── kyc.service.ts
│   │   │   └── documentVerification.service.ts
│   │   │
│   │   ├── notification/
│   │   │   ├── notification.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── sms.service.ts
│   │   │   └── push.service.ts
│   │   │
│   │   ├── blockchain/
│   │   │   ├── blockchain.service.ts
│   │   │   ├── wallet.manager.ts
│   │   │   ├── transaction.monitor.ts
│   │   │   ├── contracts/
│   │   │   │   ├── usdt.contract.ts
│   │   │   │   └── contract.interface.ts
│   │   │   ├── providers/
│   │   │   │   ├── tron.provider.ts
│   │   │   │   └── polygon.provider.ts
│   │   │   └── gasFee.manager.ts
│   │   │
│   │   ├── security/
│   │   │   ├── encryption.service.ts
│   │   │   ├── fraudDetection.service.ts
│   │   │   └── audit.service.ts
│   │   │
│   │   ├── external/
│   │   │   ├── exchangeRate.service.ts
│   │   │   ├── kycProvider.service.ts
│   │   │   └── paymentGateway.service.ts
│   │   │
│   │   └── admin/
│   │       ├── admin.service.ts
│   │       ├── analytics.service.ts
│   │       └── reporting.service.ts
│   │
│   ├── database/
│   │   ├── repositories/
│   │   │   ├── user.repository.ts
│   │   │   ├── wallet.repository.ts
│   │   │   ├── transaction.repository.ts
│   │   │   ├── card.repository.ts
│   │   │   ├── kyc.repository.ts
│   │   │   ├── notification.repository.ts
│   │   │   └── session.repository.ts
│   │   │
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── userProfile.model.ts
│   │   │   ├── userRole.model.ts
│   │   │   ├── wallet.model.ts
│   │   │   ├── linkedCard.model.ts
│   │   │   ├── transaction.model.ts
│   │   │   ├── transactionLog.model.ts
│   │   │   ├── kycDocument.model.ts
│   │   │   ├── notification.model.ts
│   │   │   ├── dispute.model.ts
│   │   │   ├── twoFaCode.model.ts
│   │   │   ├── exchangeRate.model.ts
│   │   │   ├── auditLog.model.ts
│   │   │   ├── session.model.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── migrations/
│   │   │   ├── 001_create_users_table.ts
│   │   │   ├── 002_create_user_profiles_table.ts
│   │   │   ├── 003_create_wallets_table.ts
│   │   │   ├── 004_create_transactions_table.ts
│   │   │   ├── 005_create_linked_cards_table.ts
│   │   │   ├── 006_create_kyc_documents_table.ts
│   │   │   ├── 007_create_notifications_table.ts
│   │   │   └── ...
│   │   │
│   │   ├── seeds/
│   │   │   ├── 001_user_roles.ts
│   │   │   ├── 002_test_users.ts
│   │   │   └── ...
│   │   │
│   │   ├── connection.ts
│   │   └── index.ts
│   │
│   ├── jobs/
│   │   ├── queues/
│   │   │   ├── payment.queue.ts
│   │   │   ├── notification.queue.ts
│   │   │   ├── blockchain.queue.ts
│   │   │   └── kyc.queue.ts
│   │   │
│   │   ├── workers/
│   │   │   ├── payment.worker.ts
│   │   │   ├── notification.worker.ts
│   │   │   ├── blockchain.worker.ts
│   │   │   └── kyc.worker.ts
│   │   │
│   │   └── schedulers/
│   │       ├── exchangeRate.scheduler.ts
│   │       ├── transactionMonitor.scheduler.ts
│   │       └── cleanup.scheduler.ts
│   │
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── encryption.ts
│   │   ├── validation.ts
│   │   ├── formatters.ts
│   │   ├── helpers.ts
│   │   ├── constants.ts
│   │   └── errors/
│   │       ├── AppError.ts
│   │       ├── BadRequestError.ts
│   │       ├── UnauthorizedError.ts
│   │       ├── ForbiddenError.ts
│   │       ├── NotFoundError.ts
│   │       └── ConflictError.ts
│   │
│   ├── types/
│   │   ├── express/
│   │   │   └── index.d.ts
│   │   ├── user.types.ts
│   │   ├── transaction.types.ts
│   │   ├── payment.types.ts
│   │   ├── blockchain.types.ts
│   │   ├── api.types.ts
│   │   └── common.types.ts
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── blockchain.config.ts
│   │   ├── security.config.ts
│   │   ├── notification.config.ts
│   │   └── index.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── auth.service.test.ts
│   │   │   ├── payment.service.test.ts
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── encryption.test.ts
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── payment.test.ts
│   │   ├── transaction.test.ts
│   │   └── ...
│   │
│   ├── e2e/
│   │   ├── userFlow.test.ts
│   │   ├── paymentFlow.test.ts
│   │   └── ...
│   │
│   ├── fixtures/
│   │   ├── users.ts
│   │   ├── transactions.ts
│   │   └── ...
│   │
│   └── setup.ts
│
├── logs/
│   ├── error.log
│   ├── combined.log
│   └── .gitkeep
│
├── .env.example
├── .env.local
├── .env.test
├── .env.production
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Frontend Web Structure (React + TypeScript)

```
frontend-web/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
│
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── endpoints/
│   │   │   ├── auth.api.ts
│   │   │   ├── user.api.ts
│   │   │   ├── payment.api.ts
│   │   │   ├── transaction.api.ts
│   │   │   ├── card.api.ts
│   │   │   ├── wallet.api.ts
│   │   │   ├── kyc.api.ts
│   │   │   ├── notification.api.ts
│   │   │   └── admin.api.ts
│   │   └── interceptors.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Header.styles.ts
│   │   │   │   └── index.ts
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Sidebar.styles.ts
│   │   │   │   └── index.ts
│   │   │   ├── Footer/
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── index.ts
│   │   │   └── DashboardLayout/
│   │   │       ├── DashboardLayout.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.styles.ts
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   │   ├── Input.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── Loading/
│   │   │   ├── ErrorBoundary/
│   │   │   ├── Table/
│   │   │   ├── Tabs/
│   │   │   ├── Dropdown/
│   │   │   └── ...
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── index.ts
│   │   │   ├── RegisterForm/
│   │   │   ├── TwoFactorModal/
│   │   │   └── ...
│   │   │
│   │   ├── dashboard/
│   │   │   ├── BalanceCard/
│   │   │   ├── RecentTransactions/
│   │   │   ├── QuickActions/
│   │   │   ├── ActivityChart/
│   │   │   └── ...
│   │   │
│   │   ├── payment/
│   │   │   ├── PaymentForm/
│   │   │   ├── RecipientSelector/
│   │   │   ├── AmountInput/
│   │   │   ├── PaymentConfirmation/
│   │   │   └── ...
│   │   │
│   │   ├── transaction/
│   │   │   ├── TransactionList/
│   │   │   ├── TransactionCard/
│   │   │   ├── TransactionDetail/
│   │   │   ├── TransactionFilter/
│   │   │   └── ...
│   │   │
│   │   ├── wallet/
│   │   │   ├── WalletCard/
│   │   │   ├── WalletList/
│   │   │   └── ...
│   │   │
│   │   ├── card/
│   │   │   ├── CardList/
│   │   │   ├── CardForm/
│   │   │   ├── CardItem/
│   │   │   └── ...
│   │   │
│   │   ├── kyc/
│   │   │   ├── KYCForm/
│   │   │   ├── DocumentUpload/
│   │   │   ├── VerificationStatus/
│   │   │   └── ...
│   │   │
│   │   ├── admin/
│   │   │   ├── UserManagement/
│   │   │   ├── TransactionMonitor/
│   │   │   ├── KYCReviewPanel/
│   │   │   ├── AnalyticsDashboard/
│   │   │   └── ...
│   │   │
│   │   └── merchant/
│   │       ├── SalesOverview/
│   │       ├── PaymentLinks/
│   │       ├── ExportReports/
│   │       └── ...
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── VerifyEmailPage.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── HomePage.tsx
│   │   │   ├── WalletPage.tsx
│   │   │   ├── TransactionsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   │
│   │   ├── payment/
│   │   │   ├── SendMoneyPage.tsx
│   │   │   └── RequestMoneyPage.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   ├── TransactionsPage.tsx
│   │   │   ├── KYCReviewPage.tsx
│   │   │   └── ReportsPage.tsx
│   │   │
│   │   ├── merchant/
│   │   │   ├── MerchantDashboard.tsx
│   │   │   └── SalesPage.tsx
│   │   │
│   │   └── NotFoundPage.tsx
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   ├── PrivateRoute.tsx
│   │   ├── PublicRoute.tsx
│   │   └── AdminRoute.tsx
│   │
│   ├── store/
│   │   ├── index.ts
│   │   ├── slices/
│   │   │   ├── auth.slice.ts
│   │   │   ├── user.slice.ts
│   │   │   ├── wallet.slice.ts
│   │   │   ├── transaction.slice.ts
│   │   │   ├── card.slice.ts
│   │   │   ├── notification.slice.ts
│   │   │   └── ui.slice.ts
│   │   └── api/
│   │       └── api.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUser.ts
│   │   ├── useWallet.ts
│   │   ├── useTransactions.ts
│   │   ├── useNotifications.ts
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validation.ts
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── localStorage.ts
│   │
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── transaction.types.ts
│   │   ├── payment.types.ts
│   │   ├── wallet.types.ts
│   │   ├── api.types.ts
│   │   └── common.types.ts
│   │
│   ├── styles/
│   │   ├── theme.ts
│   │   ├── global.css
│   │   └── variables.css
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── config/
│   │   ├── api.config.ts
│   │   └── app.config.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── tests/
│   ├── components/
│   ├── pages/
│   └── utils/
│
├── .env.example
├── .env.local
├── .env.production
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

---

## Frontend Mobile Structure (React Native + TypeScript)

```
frontend-mobile/
├── android/
│   ├── app/
│   ├── build.gradle
│   └── ...
│
├── ios/
│   ├── MalPay/
│   ├── MalPay.xcodeproj/
│   ├── Podfile
│   └── ...
│
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── endpoints/
│   │   │   ├── auth.api.ts
│   │   │   ├── user.api.ts
│   │   │   ├── payment.api.ts
│   │   │   ├── transaction.api.ts
│   │   │   ├── card.api.ts
│   │   │   ├── wallet.api.ts
│   │   │   ├── kyc.api.ts
│   │   │   └── notification.api.ts
│   │   └── interceptors.ts
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.styles.ts
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── Loading/
│   │   │   ├── ErrorBoundary/
│   │   │   ├── Header/
│   │   │   └── ...
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm/
│   │   │   ├── RegisterForm/
│   │   │   ├── TwoFactorModal/
│   │   │   └── BiometricPrompt/
│   │   │
│   │   ├── home/
│   │   │   ├── BalanceCard/
│   │   │   ├── QuickActions/
│   │   │   ├── RecentActivity/
│   │   │   └── ...
│   │   │
│   │   ├── payment/
│   │   │   ├── PaymentForm/
│   │   │   ├── RecipientSelector/
│   │   │   ├── AmountInput/
│   │   │   ├── PINInput/
│   │   │   └── ...
│   │   │
│   │   ├── transaction/
│   │   │   ├── TransactionList/
│   │   │   ├── TransactionCard/
│   │   │   ├── TransactionDetail/
│   │   │   └── ...
│   │   │
│   │   ├── wallet/
│   │   │   ├── WalletCard/
│   │   │   ├── WalletList/
│   │   │   └── ...
│   │   │
│   │   ├── card/
│   │   │   ├── CardList/
│   │   │   ├── CardForm/
│   │   │   ├── CardItem/
│   │   │   └── ...
│   │   │
│   │   └── kyc/
│   │       ├── DocumentScanner/
│   │       ├── SelfieCapture/
│   │       ├── KYCForm/
│   │       └── ...
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   ├── VerifyEmailScreen.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   │
│   │   ├── main/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── WalletScreen.tsx
│   │   │   ├── TransactionsScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   │
│   │   ├── payment/
│   │   │   ├── SendMoneyScreen.tsx
│   │   │   ├── RequestMoneyScreen.tsx
│   │   │   ├── PaymentConfirmScreen.tsx
│   │   │   └── PaymentSuccessScreen.tsx
│   │   │
│   │   └── settings/
│   │       ├── SettingsScreen.tsx
│   │       ├── SecurityScreen.tsx
│   │       ├── LinkedCardsScreen.tsx
│   │       ├── KYCScreen.tsx
│   │       └── NotificationsScreen.tsx
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   ├── PaymentNavigator.tsx
│   │   └── types.ts
│   │
│   ├── store/
│   │   ├── index.ts
│   │   ├── slices/
│   │   │   ├── auth.slice.ts
│   │   │   ├── user.slice.ts
│   │   │   ├── wallet.slice.ts
│   │   │   ├── transaction.slice.ts
│   │   │   ├── card.slice.ts
│   │   │   └── notification.slice.ts
│   │   └── api/
│   │       └── api.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useWallet.ts
│   │   ├── useTransactions.ts
│   │   ├── useNotifications.ts
│   │   ├── useBiometric.ts
│   │   └── useCamera.ts
│   │
│   ├── services/
│   │   ├── biometricService.ts
│   │   ├── notificationService.ts
│   │   ├── secureStorageService.ts
│   │   ├── cameraService.ts
│   │   └── locationService.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validation.ts
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── storage.ts
│   │
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── transaction.types.ts
│   │   ├── payment.types.ts
│   │   ├── navigation.types.ts
│   │   └── common.types.ts
│   │
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── config/
│   │   ├── api.config.ts
│   │   └── app.config.ts
│   │
│   └── App.tsx
│
├── __tests__/
│   ├── components/
│   ├── screens/
│   ├── utils/
│   └── services/
│
├── .env.example
├── .env.local
├── .env.production
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── babel.config.js
├── metro.config.js
├── app.json
├── package.json
└── README.md
```

---

## Infrastructure Structure (Terraform)

```
infrastructure/
├── environments/
│   ├── development/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terraform.tfvars
│   │
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terraform.tfvars
│   │
│   └── production/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── terraform.tfvars
│
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── ecs/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── rds/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── elasticache/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── s3/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   └── cloudfront/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
├── kubernetes/
│   ├── base/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── configmap.yaml
│   │   └── secret.yaml
│   │
│   ├── overlays/
│   │   ├── development/
│   │   │   └── kustomization.yaml
│   │   ├── staging/
│   │   │   └── kustomization.yaml
│   │   └── production/
│   │       └── kustomization.yaml
│   │
│   └── helm/
│       └── malpay/
│           ├── Chart.yaml
│           ├── values.yaml
│           └── templates/
│
└── scripts/
    ├── init.sh
    ├── deploy.sh
    └── teardown.sh
```

---

## Documentation Structure

```
docs/
├── api/
│   ├── authentication.md
│   ├── payments.md
│   ├── transactions.md
│   ├── users.md
│   └── webhooks.md
│
├── architecture/
│   ├── system-overview.md
│   ├── database-design.md
│   ├── security.md
│   └── blockchain-integration.md
│
├── guides/
│   ├── getting-started.md
│   ├── local-development.md
│   ├── deployment.md
│   └── testing.md
│
├── mobile/
│   ├── android-setup.md
│   └── ios-setup.md
│
├── compliance/
│   ├── kyc-aml.md
│   ├── data-protection.md
│   └── security-policies.md
│
└── README.md
```

---

## Scripts Structure

```
scripts/
├── setup/
│   ├── install-dependencies.sh
│   ├── setup-database.sh
│   └── setup-env.sh
│
├── development/
│   ├── start-dev.sh
│   ├── reset-db.sh
│   └── seed-db.sh
│
├── deployment/
│   ├── build-docker.sh
│   ├── deploy-staging.sh
│   ├── deploy-production.sh
│   └── rollback.sh
│
├── testing/
│   ├── run-unit-tests.sh
│   ├── run-integration-tests.sh
│   └── run-e2e-tests.sh
│
└── maintenance/
    ├── backup-db.sh
    ├── restore-db.sh
    └── cleanup-logs.sh
```

---

## CI/CD Structure

```
.github/
├── workflows/
│   ├── ci.yml
│   ├── deploy-staging.yml
│   ├── deploy-production.yml
│   ├── test.yml
│   └── security-scan.yml
│
├── PULL_REQUEST_TEMPLATE.md
└── ISSUE_TEMPLATE/
    ├── bug_report.md
    ├── feature_request.md
    └── security_issue.md
```

---

## Complete Project Package Structure

```
malpay-platform/
│
├── backend/                       # Node.js + TypeScript API
├── frontend-web/                  # React web dashboard
├── frontend-mobile/               # React Native mobile app
├── infrastructure/                # Infrastructure as Code
├── docs/                         # Documentation
├── scripts/                      # Utility scripts
│
├── .github/
│   └── workflows/                # CI/CD pipelines
│
├── docker-compose.yml            # Local development environment
├── .gitignore
├── .editorconfig
├── LICENSE
├── README.md
└── package.json                  # Workspace root
```

---

## Quick Start Commands

### Initial Setup
```bash
# Install all dependencies
npm run install:all

# Setup environment files
npm run setup:env

# Start Docker services
npm run docker:up

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### Development
```bash
# Start all services
npm run dev

# Start individual services
npm run dev:api        # Backend API
npm run dev:web        # Web frontend
npm run dev:mobile     # Mobile app
```

### Testing
```bash
# Run all tests
npm test

# Run specific tests
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Deployment
```bash
# Build for production
npm run build

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

---

## Notes

1. **File Naming Conventions:**
   - Components: PascalCase (e.g., `UserProfile.tsx`)
   - Utilities: camelCase (e.g., `formatters.ts`)
   - Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)
   - Types/Interfaces: PascalCase with 'I' prefix for interfaces (e.g., `IUser`)

2. **Folder Organization:**
   - Group by feature/domain (e.g., `user/`, `payment/`)
   - Each feature folder contains related components, services, and types
   - Shared/common code in dedicated folders

3. **Import Aliases:**
   ```typescript
   @api/*          → src/api/*
   @components/*   → src/components/*
   @utils/*        → src/utils/*
   @types/*        → src/types/*
   @store/*        → src/store/*
   @hooks/*        → src/hooks/*
   ```

4. **Environment Variables:**
   - Never commit `.env` files
   - Always provide `.env.example` with sample values
   - Use different env files for different environments

This structure provides a scalable, maintainable, and organized codebase for the MalPay platform.
