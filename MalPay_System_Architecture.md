# MalPay System Architecture
## Comprehensive Technical Planning Document

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagrams](#architecture-diagrams)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Architecture](#api-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Blockchain Integration](#blockchain-integration)
8. [Security Architecture](#security-architecture)
9. [Infrastructure & Deployment](#infrastructure--deployment)
10. [Development Workflow](#development-workflow)

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React Native App (iOS/Android)  │  React Web Dashboard         │
│  - User Interface                │  - Admin Panel               │
│  - Merchant Interface            │  - Web User Interface        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  - Load Balancer (AWS ALB / GCP Load Balancer)                  │
│  - Rate Limiting & Throttling                                   │
│  - Request Authentication & Validation                          │
│  - SSL/TLS Termination                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Node.js + Express + TypeScript Services                        │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │ Auth Service │ User Service │Payment Engine│ KYC Service  │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │Card Service  │Wallet Service│Notification  │Admin Service │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │ PostgreSQL   │ Redis Cache  │ S3 Storage   │Message Queue │ │
│  │ (Primary DB) │ (Sessions)   │ (KYC Docs)   │ (RabbitMQ)   │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Blockchain Service (Web3.js / Ethers.js)                 │  │
│  │  - USDT Contract Integration (Tron/Polygon)              │  │
│  │  - Wallet Management                                     │  │
│  │  - Transaction Monitoring                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  - Blockchain Networks (Tron/Polygon)                           │
│  - Exchange Rate APIs (CoinGecko, CoinMarketCap)                │
│  - KYC Provider (Jumio, Onfido)                                 │
│  - SMS/Email Providers (Twilio, SendGrid)                       │
│  - Push Notifications (Firebase Cloud Messaging)                │
│  - Card Processing APIs (Flutterwave, Paystack)                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Core System Components

**Client Applications:**
- React Native mobile app (iOS & Android)
- React web application (user dashboard)
- React admin panel (compliance & monitoring)

**Backend Services:**
- RESTful API with microservices architecture
- Real-time WebSocket server for notifications
- Background job processors for async tasks

**Data Storage:**
- PostgreSQL for transactional data
- Redis for caching and session management
- S3/Cloud Storage for document storage

**Blockchain Layer:**
- Smart contract integration for USDT transactions
- Internal wallet management system
- Blockchain transaction monitoring

---

## 2. Architecture Diagrams

### 2.1 Microservices Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MICROSERVICES BREAKDOWN                       │
└─────────────────────────────────────────────────────────────────┘

1. AUTH SERVICE (Port 3001)
   ├── Registration & Login
   ├── JWT Token Management
   ├── 2FA Implementation
   ├── Password Reset
   └── Session Management

2. USER SERVICE (Port 3002)
   ├── Profile Management
   ├── User Preferences
   ├── Account Settings
   └── User Search (by email/username)

3. CARD SERVICE (Port 3003)
   ├── Link Bank Cards
   ├── Card Verification
   ├── Balance Aggregation
   └── Card Management

4. WALLET SERVICE (Port 3004)
   ├── Internal Wallet Management
   ├── Balance Tracking (fiat equivalent)
   ├── Crypto Wallet Integration
   └── Wallet History

5. PAYMENT ENGINE (Port 3005)
   ├── P2P Transfers
   ├── Crypto Conversion Logic
   ├── Transaction Processing
   ├── Payment Validation
   └── Transaction Queue Management

6. TRANSACTION SERVICE (Port 3006)
   ├── Transaction History
   ├── Transaction Search & Filter
   ├── Export Functionality
   └── Receipt Generation

7. NOTIFICATION SERVICE (Port 3007)
   ├── Push Notifications
   ├── Email Notifications
   ├── SMS Alerts
   └── In-app Notifications

8. KYC SERVICE (Port 3008)
   ├── Document Upload
   ├── Verification Status
   ├── Third-party KYC Integration
   └── Compliance Checks

9. ADMIN SERVICE (Port 3009)
   ├── User Management
   ├── Transaction Monitoring
   ├── Dispute Resolution
   ├── Fraud Detection
   └── Reporting & Analytics

10. BLOCKCHAIN SERVICE (Port 3010)
    ├── Smart Contract Interaction
    ├── USDT Transfer Execution
    ├── Wallet Generation
    ├── Transaction Confirmation
    └── Gas Fee Management
```

### 2.2 Data Flow Diagram - Payment Transaction

```
USER A (Sender)                                          USER B (Receiver)
     │                                                          │
     │ 1. Initiate Payment                                     │
     ├──────────────────┐                                      │
     │                  ↓                                      │
     │         ┌─────────────────┐                             │
     │         │  API GATEWAY    │                             │
     │         │  - Authenticate │                             │
     │         │  - Validate     │                             │
     │         └────────┬────────┘                             │
     │                  │                                      │
     │         2. Check Balance & Permissions                  │
     │                  ↓                                      │
     │         ┌─────────────────┐                             │
     │         │ PAYMENT ENGINE  │                             │
     │         │  - Validate Amt │                             │
     │         │  - Check Limits │                             │
     │         └────────┬────────┘                             │
     │                  │                                      │
     │         3. Create Transaction Record                    │
     │                  ↓                                      │
     │         ┌─────────────────┐                             │
     │         │   POSTGRESQL    │                             │
     │         │  Status: PENDING│                             │
     │         └────────┬────────┘                             │
     │                  │                                      │
     │         4. Execute Blockchain Transfer                  │
     │                  ↓                                      │
     │         ┌─────────────────┐                             │
     │         │BLOCKCHAIN SERVICE│                            │
     │         │  - Convert to   │                             │
     │         │    USDT         │                             │
     │         │  - Transfer     │                             │
     │         └────────┬────────┘                             │
     │                  │                                      │
     │                  ↓                                      │
     │         ┌─────────────────┐                             │
     │         │  TRON/POLYGON   │                             │
     │         │  Smart Contract │                             │
     │         └────────┬────────┘                             │
     │                  │                                      │
     │         5. Confirm Transaction                          │
     │                  ↓                                      │
     │         ┌─────────────────┐                             │
     │         │   POSTGRESQL    │                             │
     │         │Status: COMPLETED│                             │
     │         └────────┬────────┘                             │
     │                  │                                      │
     │         6. Update Balances & Notify                     │
     │                  ├──────────────────────────────────────┤
     │                  ↓                                      ↓
     │         ┌─────────────────┐                    ┌─────────────────┐
     │         │ NOTIFICATION    │                    │ NOTIFICATION    │
     │         │   SERVICE       │                    │   SERVICE       │
     │         └─────────────────┘                    └─────────────────┘
     │                  │                                      │
     ├──────────────────┘                                      │
     │ Debit Notification                        Credit Notification
     ↓                                                          ↓
```

### 2.3 Authentication Flow

```
CLIENT APP                  API GATEWAY              AUTH SERVICE           DATABASE
    │                            │                         │                    │
    │ 1. Login Request           │                         │                    │
    ├────────────────────────────►                         │                    │
    │   (email, password)        │                         │                    │
    │                            │ 2. Forward Request      │                    │
    │                            ├─────────────────────────►                    │
    │                            │                         │ 3. Verify          │
    │                            │                         ├────────────────────►
    │                            │                         │ 4. User Data       │
    │                            │                         │◄────────────────────
    │                            │                         │                    │
    │                            │                         │ 5. Generate JWT    │
    │                            │                         │    & Refresh Token │
    │                            │                         │                    │
    │                            │ 6. Return Tokens        │                    │
    │                            │◄─────────────────────────┤                    │
    │ 7. Tokens + User Profile   │                         │                    │
    │◄────────────────────────────                         │                    │
    │                            │                         │                    │
    │ 8. Store Tokens            │                         │                    │
    │    (Secure Storage)        │                         │                    │
    │                            │                         │                    │
    │ 9. Subsequent Requests     │                         │                    │
    ├────────────────────────────►                         │                    │
    │   (with JWT in Header)     │                         │                    │
    │                            │ 10. Verify JWT          │                    │
    │                            ├─────────────────────────►                    │
    │                            │ 11. Valid/Invalid       │                    │
    │                            │◄─────────────────────────┤                    │
    │                            │                         │                    │
```

---

## 3. Technology Stack

### 3.1 Frontend Technologies

**Mobile App (React Native)**
```
Core:
  - React Native 0.72+
  - TypeScript 5.0+
  - React Navigation 6.x (navigation)
  - Redux Toolkit (state management)
  - RTK Query (API calls)

UI Components:
  - React Native Paper (Material Design)
  - React Native Elements
  - Custom component library

Security:
  - react-native-keychain (secure storage)
  - react-native-biometrics (biometric auth)
  - react-native-encrypted-storage

Additional:
  - react-native-camera (KYC document scanning)
  - react-native-push-notification
  - react-native-chart-kit (transaction graphs)
  - Formik + Yup (form handling & validation)
```

**Web Dashboard (React)**
```
Core:
  - React 18+
  - TypeScript 5.0+
  - React Router v6
  - Redux Toolkit
  - RTK Query

UI Framework:
  - Material-UI (MUI) v5
  - TailwindCSS (utility classes)
  - Recharts (data visualization)

Additional:
  - React Hook Form + Yup
  - date-fns (date manipulation)
  - react-table (data tables)
  - react-toastify (notifications)
```

### 3.2 Backend Technologies

```
Core Framework:
  - Node.js 18+ LTS
  - Express.js 4.x
  - TypeScript 5.0+

API & Middleware:
  - express-validator (input validation)
  - helmet (security headers)
  - cors (cross-origin resource sharing)
  - compression (response compression)
  - express-rate-limit (rate limiting)

Authentication & Security:
  - jsonwebtoken (JWT)
  - bcrypt (password hashing)
  - speakeasy (2FA TOTP)
  - crypto (AES-256 encryption)

Database:
  - pg (PostgreSQL driver)
  - TypeORM or Prisma (ORM)
  - Redis (ioredis client)

Blockchain:
  - ethers.js v6 (Ethereum-compatible chains)
  - tronweb (Tron blockchain)
  - @uniswap/sdk (DEX integration if needed)

Background Jobs:
  - Bull (Redis-based queue)
  - node-cron (scheduled tasks)

Testing:
  - Jest (unit testing)
  - Supertest (API testing)
  - @testing-library/react (component testing)

Logging & Monitoring:
  - Winston (logging)
  - Morgan (HTTP request logging)
  - Sentry (error tracking)
```

### 3.3 Database & Storage

```
Primary Database:
  - PostgreSQL 15+
  - Connection pooling (pg-pool)
  - Read replicas for scaling

Caching:
  - Redis 7.x
  - Cache strategies: LRU
  - Session storage
  - Rate limiting data

File Storage:
  - AWS S3 / Google Cloud Storage
  - KYC documents
  - Profile images
  - Transaction receipts

Message Queue:
  - RabbitMQ or AWS SQS
  - Transaction processing queue
  - Notification queue
  - Blockchain confirmation queue
```

### 3.4 Infrastructure & DevOps

```
Cloud Provider:
  - AWS or Google Cloud Platform

Services:
  - EC2/Compute Engine (application servers)
  - RDS/Cloud SQL (managed PostgreSQL)
  - ElastiCache/Memorystore (managed Redis)
  - S3/Cloud Storage (file storage)
  - ALB/Cloud Load Balancing
  - CloudWatch/Cloud Monitoring

Containerization:
  - Docker
  - Docker Compose (local development)
  - Amazon ECS or Google Kubernetes Engine (production)

CI/CD:
  - GitHub Actions or GitLab CI
  - Automated testing
  - Automated deployments

Monitoring:
  - Datadog or New Relic (APM)
  - Sentry (error tracking)
  - CloudWatch/Stackdriver (infrastructure)
  - Grafana + Prometheus (metrics)
```

---

## 4. Database Design

### 4.1 Entity Relationship Diagram

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│      USERS       │         │   USER_PROFILES  │         │    USER_ROLES    │
├──────────────────┤         ├──────────────────┤         ├──────────────────┤
│ id (PK)          │────────►│ id (PK)          │         │ id (PK)          │
│ email            │         │ user_id (FK)     │         │ name             │
│ username         │         │ first_name       │         │ permissions      │
│ password_hash    │         │ last_name        │         │ created_at       │
│ phone            │         │ date_of_birth    │         └──────────────────┘
│ role_id (FK)     │────┐    │ address          │                 ▲
│ is_verified      │    │    │ city             │                 │
│ is_active        │    │    │ country          │                 │
│ created_at       │    │    │ profile_image    │                 │
│ updated_at       │    │    │ created_at       │                 │
└──────────────────┘    │    └──────────────────┘                 │
         │              │                                          │
         │              └──────────────────────────────────────────┘
         │
         ├──────────────────────────────────────────┐
         │                                          │
         ▼                                          ▼
┌──────────────────┐                      ┌──────────────────┐
│   LINKED_CARDS   │                      │     WALLETS      │
├──────────────────┤                      ├──────────────────┤
│ id (PK)          │                      │ id (PK)          │
│ user_id (FK)     │                      │ user_id (FK)     │
│ card_number_enc  │                      │ wallet_address   │
│ card_type        │                      │ blockchain_type  │
│ bank_name        │                      │ balance_crypto   │
│ expiry_date_enc  │                      │ balance_fiat     │
│ cvv_enc          │                      │ currency         │
│ is_primary       │                      │ is_active        │
│ added_at         │                      │ created_at       │
└──────────────────┘                      └──────────────────┘
         │                                          │
         │                                          │
         └─────────────────┬────────────────────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │   TRANSACTIONS   │
                 ├──────────────────┤
                 │ id (PK)          │
                 │ tx_hash          │
                 │ sender_id (FK)   │
                 │ receiver_id (FK) │
                 │ amount_crypto    │
                 │ amount_fiat      │
                 │ currency         │
                 │ tx_type          │
                 │ status           │
                 │ source_type      │
                 │ source_id        │
                 │ fee              │
                 │ exchange_rate    │
                 │ created_at       │
                 │ completed_at     │
                 └──────────────────┘
                           │
                           │
                           ▼
                 ┌──────────────────┐
                 │TRANSACTION_LOGS  │
                 ├──────────────────┤
                 │ id (PK)          │
                 │ transaction_id   │
                 │ status           │
                 │ message          │
                 │ metadata         │
                 │ timestamp        │
                 └──────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   KYC_DOCUMENTS  │         │   NOTIFICATIONS  │         │     DISPUTES     │
├──────────────────┤         ├──────────────────┤         ├──────────────────┤
│ id (PK)          │         │ id (PK)          │         │ id (PK)          │
│ user_id (FK)     │         │ user_id (FK)     │         │ transaction_id   │
│ document_type    │         │ type             │         │ raised_by        │
│ document_url     │         │ title            │         │ reason           │
│ status           │         │ message          │         │ status           │
│ verified_by      │         │ is_read          │         │ resolution       │
│ verified_at      │         │ created_at       │         │ resolved_by      │
│ uploaded_at      │         └──────────────────┘         │ resolved_at      │
│ notes            │                                       │ created_at       │
└──────────────────┘                                       └──────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   TWO_FA_CODES   │         │  EXCHANGE_RATES  │
├──────────────────┤         ├──────────────────┤
│ id (PK)          │         │ id (PK)          │
│ user_id (FK)     │         │ base_currency    │
│ secret_enc       │         │ target_currency  │
│ is_enabled       │         │ rate             │
│ backup_codes     │         │ source           │
│ created_at       │         │ timestamp        │
└──────────────────┘         └──────────────────┘
```

### 4.2 Database Schema (PostgreSQL)

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role_id INTEGER REFERENCES user_roles(id),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_phone ON users(phone);

-- User Roles Table
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'user', 'merchant', 'admin'
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles Table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    profile_image VARCHAR(500),
    kyc_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Linked Cards Table
CREATE TABLE linked_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    card_number_encrypted TEXT NOT NULL,
    card_last_four VARCHAR(4) NOT NULL,
    card_type VARCHAR(50), -- visa, mastercard, etc.
    bank_name VARCHAR(255),
    expiry_date_encrypted TEXT NOT NULL,
    cvv_encrypted TEXT NOT NULL,
    cardholder_name VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, card_last_four)
);

CREATE INDEX idx_cards_user ON linked_cards(user_id);

-- Wallets Table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    private_key_encrypted TEXT NOT NULL,
    blockchain_type VARCHAR(50) NOT NULL, -- 'tron', 'polygon'
    balance_crypto DECIMAL(36, 18) DEFAULT 0,
    balance_fiat DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD', -- NGN, USD, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_wallets_address ON wallets(wallet_address);

-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_hash VARCHAR(255) UNIQUE,
    sender_id UUID REFERENCES users(id),
    receiver_id UUID REFERENCES users(id),
    amount_crypto DECIMAL(36, 18) NOT NULL,
    amount_fiat DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    tx_type VARCHAR(50) NOT NULL, -- 'transfer', 'deposit', 'withdrawal'
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    source_type VARCHAR(50), -- 'wallet', 'card'
    source_id UUID,
    fee DECIMAL(15, 2) DEFAULT 0,
    exchange_rate DECIMAL(15, 6),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT
);

CREATE INDEX idx_transactions_sender ON transactions(sender_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_hash ON transactions(tx_hash);

-- Transaction Logs Table
CREATE TABLE transaction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    message TEXT,
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_txlogs_transaction ON transaction_logs(transaction_id);

-- KYC Documents Table
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'id_card', 'passport', 'drivers_license', 'proof_of_address'
    document_url VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE INDEX idx_kyc_user ON kyc_documents(user_id);
CREATE INDEX idx_kyc_status ON kyc_documents(status);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'transaction', 'security', 'kyc', 'system'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Disputes Table
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    raised_by UUID REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- open, investigating, resolved, rejected
    resolution TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disputes_transaction ON disputes(transaction_id);
CREATE INDEX idx_disputes_status ON disputes(status);

-- Two Factor Authentication Table
CREATE TABLE two_fa_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    secret_encrypted TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    backup_codes TEXT[], -- encrypted backup codes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exchange Rates Table (cache for fiat conversions)
CREATE TABLE exchange_rates (
    id SERIAL PRIMARY KEY,
    base_currency VARCHAR(10) NOT NULL,
    target_currency VARCHAR(10) NOT NULL,
    rate DECIMAL(15, 6) NOT NULL,
    source VARCHAR(100), -- API source
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(base_currency, target_currency)
);

CREATE INDEX idx_rates_pair ON exchange_rates(base_currency, target_currency);

-- Audit Logs Table (for compliance)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    changes JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- Session Management Table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token TEXT UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

### 4.3 Database Indexes Strategy

```sql
-- Performance Optimization Indexes

-- Composite indexes for common queries
CREATE INDEX idx_transactions_user_status ON transactions(sender_id, status);
CREATE INDEX idx_transactions_user_date ON transactions(sender_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- Full-text search indexes
CREATE INDEX idx_users_search ON users USING gin(to_tsvector('english', username || ' ' || email));

-- Partial indexes for specific queries
CREATE INDEX idx_active_cards ON linked_cards(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_pending_kyc ON kyc_documents(user_id) WHERE status = 'pending';
CREATE INDEX idx_active_wallets ON wallets(user_id) WHERE is_active = TRUE;
```

---

## 5. API Architecture

### 5.1 RESTful API Structure

```
BASE_URL: https://api.malpay.com/v1

Authentication: Bearer Token (JWT)
Content-Type: application/json
```

### 5.2 API Endpoints Specification

#### **Authentication & User Management**

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh-token
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/verify-email
POST   /auth/resend-verification

POST   /auth/2fa/enable
POST   /auth/2fa/verify
POST   /auth/2fa/disable

GET    /users/profile
PUT    /users/profile
PATCH  /users/password
GET    /users/search?query={email|username}
DELETE /users/account
```

#### **Card Management**

```
POST   /cards/link
GET    /cards
GET    /cards/:id
DELETE /cards/:id
PATCH  /cards/:id/set-primary
GET    /cards/:id/balance
```

#### **Wallet Management**

```
POST   /wallets/create
GET    /wallets
GET    /wallets/:id
GET    /wallets/:id/balance
GET    /wallets/:id/transactions
```

#### **Payment & Transactions**

```
POST   /payments/transfer
POST   /payments/withdraw
POST   /payments/deposit

GET    /transactions
GET    /transactions/:id
GET    /transactions/:id/receipt
GET    /transactions/export?format={csv|pdf}
POST   /transactions/:id/dispute
```

#### **KYC & Verification**

```
POST   /kyc/upload
GET    /kyc/status
GET    /kyc/documents
DELETE /kyc/documents/:id
```

#### **Notifications**

```
GET    /notifications
GET    /notifications/:id
PATCH  /notifications/:id/read
PATCH  /notifications/read-all
DELETE /notifications/:id
```

#### **Admin Endpoints**

```
GET    /admin/users
GET    /admin/users/:id
PATCH  /admin/users/:id/status
GET    /admin/users/:id/activity

GET    /admin/transactions
GET    /admin/transactions/:id
PATCH  /admin/transactions/:id/review

GET    /admin/kyc/pending
PATCH  /admin/kyc/:id/approve
PATCH  /admin/kyc/:id/reject

GET    /admin/disputes
PATCH  /admin/disputes/:id/resolve

GET    /admin/analytics/overview
GET    /admin/analytics/transactions
GET    /admin/analytics/users
GET    /admin/reports/generate
```

### 5.3 API Request/Response Examples

#### **Example: User Registration**

```http
POST /auth/register
Content-Type: application/json

{
  "email": "chinedu@example.com",
  "username": "chinedu29",
  "password": "SecureP@ss123",
  "phone": "+2348012345678",
  "firstName": "Chinedu",
  "lastName": "Okonkwo"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully. Please verify your email.",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "chinedu@example.com",
    "username": "chinedu29",
    "verificationRequired": true
  }
}
```

#### **Example: Payment Transfer**

```http
POST /payments/transfer
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "recipient": "amina@example.com",
  "amount": 5000,
  "currency": "NGN",
  "description": "Payment for goods",
  "pin": "1234"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transfer initiated successfully",
  "data": {
    "transactionId": "660e8400-e29b-41d4-a716-446655440001",
    "status": "processing",
    "amount": 5000,
    "currency": "NGN",
    "recipient": {
      "username": "amina34",
      "email": "amina@example.com"
    },
    "fee": 25,
    "estimatedCompletion": "2025-10-22T14:35:00Z"
  }
}
```

#### **Example: Transaction History**

```http
GET /transactions?page=1&limit=20&status=completed&startDate=2025-10-01
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "type": "transfer",
        "amount": 5000,
        "currency": "NGN",
        "status": "completed",
        "description": "Payment for goods",
        "recipient": {
          "username": "amina34",
          "email": "amina@example.com"
        },
        "createdAt": "2025-10-22T14:30:00Z",
        "completedAt": "2025-10-22T14:31:23Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    }
  }
}
```

### 5.4 API Error Handling

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Your wallet balance is insufficient for this transaction",
    "statusCode": 400,
    "timestamp": "2025-10-22T14:30:00Z"
  }
}
```

**Standard Error Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## 6. Frontend Architecture

### 6.1 React Native Mobile App Structure

```
malpay-mobile/
├── src/
│   ├── api/
│   │   ├── client.ts              # Axios instance config
│   │   ├── endpoints/
│   │   │   ├── auth.ts
│   │   │   ├── payments.ts
│   │   │   ├── transactions.ts
│   │   │   ├── cards.ts
│   │   │   └── wallets.ts
│   │   └── interceptors.ts        # Request/response interceptors
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── TwoFactorModal.tsx
│   │   ├── payments/
│   │   │   ├── PaymentForm.tsx
│   │   │   ├── RecipientSelector.tsx
│   │   │   └── AmountInput.tsx
│   │   └── transactions/
│   │       ├── TransactionCard.tsx
│   │       ├── TransactionList.tsx
│   │       └── TransactionDetail.tsx
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   └── VerifyEmailScreen.tsx
│   │   ├── main/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── WalletScreen.tsx
│   │   │   ├── TransactionsScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── payments/
│   │   │   ├── SendMoneyScreen.tsx
│   │   │   ├── RequestMoneyScreen.tsx
│   │   │   └── PaymentConfirmScreen.tsx
│   │   └── settings/
│   │       ├── SettingsScreen.tsx
│   │       ├── SecurityScreen.tsx
│   │       ├── LinkedCardsScreen.tsx
│   │       └── KYCScreen.tsx
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── linking.ts
│   │
│   ├── store/
│   │   ├── index.ts               # Redux store configuration
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── userSlice.ts
│   │   │   ├── walletSlice.ts
│   │   │   ├── transactionSlice.ts
│   │   │   └── notificationSlice.ts
│   │   └── api/
│   │       └── api.ts             # RTK Query API
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useWallet.ts
│   │   ├── useTransactions.ts
│   │   └── useNotifications.ts
│   │
│   ├── utils/
│   │   ├── encryption.ts
│   │   ├── validation.ts
│   │   ├── formatters.ts
│   │   ├── storage.ts
│   │   └── constants.ts
│   │
│   ├── services/
│   │   ├── biometricService.ts
│   │   ├── notificationService.ts
│   │   ├── secureStorageService.ts
│   │   └── cameraService.ts
│   │
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── transaction.types.ts
│   │   ├── payment.types.ts
│   │   └── api.types.ts
│   │
│   └── App.tsx
│
├── android/
├── ios/
├── __tests__/
├── package.json
└── tsconfig.json
```

### 6.2 React Web App Structure

```
malpay-web/
├── src/
│   ├── api/                       # Same structure as mobile
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── common/               # Reusable UI components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── RecentTransactions.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── ActivityChart.tsx
│   │   ├── admin/
│   │   │   ├── UserManagement.tsx
│   │   │   ├── TransactionMonitor.tsx
│   │   │   ├── KYCReviewPanel.tsx
│   │   │   └── AnalyticsDashboard.tsx
│   │   └── merchant/
│   │       ├── SalesOverview.tsx
│   │       ├── PaymentLinks.tsx
│   │       └── ExportReports.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   ├── dashboard/
│   │   │   ├── HomePage.tsx
│   │   │   ├── WalletPage.tsx
│   │   │   ├── TransactionsPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   ├── TransactionsPage.tsx
│   │   │   └── ReportsPage.tsx
│   │   └── merchant/
│   │       ├── MerchantDashboard.tsx
│   │       └── SalesPage.tsx
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   ├── PrivateRoute.tsx
│   │   └── AdminRoute.tsx
│   │
│   ├── store/                     # Same structure as mobile
│   ├── hooks/
│   ├── utils/
│   ├── services/
│   ├── types/
│   │
│   ├── styles/
│   │   ├── theme.ts
│   │   └── global.css
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 6.3 State Management Architecture

```typescript
// Redux Store Structure

interface RootState {
  auth: {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    twoFactorRequired: boolean;
  };

  wallet: {
    wallets: Wallet[];
    activeWallet: Wallet | null;
    balance: {
      crypto: number;
      fiat: number;
      currency: string;
    };
    isLoading: boolean;
  };

  transactions: {
    list: Transaction[];
    currentTransaction: Transaction | null;
    filters: TransactionFilters;
    pagination: Pagination;
    isLoading: boolean;
  };

  cards: {
    linkedCards: Card[];
    primaryCard: Card | null;
    isLoading: boolean;
  };

  notifications: {
    list: Notification[];
    unreadCount: number;
    isLoading: boolean;
  };

  ui: {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    modals: {
      payment: boolean;
      cardLink: boolean;
      twoFactor: boolean;
    };
  };
}
```

### 6.4 Component Architecture Patterns

```typescript
// Example: Compound Component Pattern for Payment Form

// PaymentForm/index.tsx
export const PaymentForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({});

  return (
    <PaymentFormProvider value={{ formData, setFormData }}>
      {children}
    </PaymentFormProvider>
  );
};

// PaymentForm/RecipientInput.tsx
PaymentForm.RecipientInput = () => {
  const { formData, setFormData } = usePaymentForm();
  // Component logic
};

// PaymentForm/AmountInput.tsx
PaymentForm.AmountInput = () => {
  const { formData, setFormData } = usePaymentForm();
  // Component logic
};

// Usage
<PaymentForm onSubmit={handlePayment}>
  <PaymentForm.RecipientInput />
  <PaymentForm.AmountInput />
  <PaymentForm.ConfirmButton />
</PaymentForm>
```

---

## 7. Blockchain Integration

### 7.1 Blockchain Service Architecture

```typescript
// blockchain/BlockchainService.ts

interface BlockchainConfig {
  network: 'tron' | 'polygon';
  rpcUrl: string;
  usdtContractAddress: string;
  gasLimit: number;
}

class BlockchainService {
  private provider: ethers.Provider | TronWeb;
  private usdtContract: ethers.Contract;

  constructor(config: BlockchainConfig) {
    this.initializeProvider(config);
  }

  // Wallet operations
  async createWallet(): Promise<Wallet>;
  async getBalance(address: string): Promise<BigNumber>;
  async importWallet(privateKey: string): Promise<Wallet>;

  // Transaction operations
  async transfer(from: string, to: string, amount: BigNumber): Promise<TxHash>;
  async getTransaction(txHash: string): Promise<Transaction>;
  async waitForConfirmation(txHash: string): Promise<Receipt>;

  // USDT operations
  async getUSDTBalance(address: string): Promise<BigNumber>;
  async transferUSDT(from: string, to: string, amount: BigNumber): Promise<TxHash>;

  // Exchange rate operations
  async getFiatToUSDTRate(currency: string): Promise<number>;
  async convertFiatToUSDT(amount: number, currency: string): Promise<BigNumber>;
  async convertUSDTToFiat(amount: BigNumber, currency: string): Promise<number>;
}
```

### 7.2 Transaction Flow

```
1. USER INITIATES PAYMENT
   ├── Input: Recipient, Amount (NGN), Description
   └── Frontend validates and sends to API

2. API RECEIVES REQUEST
   ├── Authenticate user
   ├── Validate recipient exists
   ├── Check sender balance
   └── Create pending transaction record

3. CONVERT FIAT TO USDT
   ├── Fetch current exchange rate (NGN → USD → USDT)
   ├── Calculate USDT amount
   └── Calculate gas fees

4. EXECUTE BLOCKCHAIN TRANSACTION
   ├── Get sender's wallet private key (decrypted)
   ├── Sign transaction
   ├── Broadcast to network (Tron/Polygon)
   ├── Get transaction hash
   └── Update transaction status: PROCESSING

5. MONITOR CONFIRMATION
   ├── Poll blockchain for confirmation
   ├── Wait for required confirmations (Tron: 20, Polygon: 128)
   └── Update transaction status: CONFIRMED

6. UPDATE BALANCES
   ├── Deduct from sender wallet
   ├── Credit receiver wallet
   ├── Update fiat equivalent balances
   └── Transaction status: COMPLETED

7. NOTIFY USERS
   ├── Send push notification to sender
   ├── Send push notification to receiver
   ├── Send email receipts
   └── Update transaction history
```

### 7.3 Smart Contract Integration

```solidity
// USDT Contract Interface (ERC-20)

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

```typescript
// blockchain/contracts/USDTContract.ts

class USDTContract {
  private contract: ethers.Contract;

  constructor(provider: ethers.Provider, contractAddress: string) {
    const abi = [...]; // ERC-20 ABI
    this.contract = new ethers.Contract(contractAddress, abi, provider);
  }

  async balanceOf(address: string): Promise<BigNumber> {
    return await this.contract.balanceOf(address);
  }

  async transfer(to: string, amount: BigNumber, signer: Signer): Promise<TxResponse> {
    const contractWithSigner = this.contract.connect(signer);
    return await contractWithSigner.transfer(to, amount);
  }

  async approve(spender: string, amount: BigNumber, signer: Signer): Promise<TxResponse> {
    const contractWithSigner = this.contract.connect(signer);
    return await contractWithSigner.approve(spender, amount);
  }
}
```

### 7.4 Wallet Management

```typescript
// blockchain/WalletManager.ts

class WalletManager {
  private encryptionKey: string;

  constructor(encryptionKey: string) {
    this.encryptionKey = encryptionKey;
  }

  // Create new wallet
  async createWallet(userId: string): Promise<WalletData> {
    const wallet = ethers.Wallet.createRandom();

    // Encrypt private key before storage
    const encryptedPrivateKey = await this.encryptPrivateKey(
      wallet.privateKey
    );

    return {
      userId,
      address: wallet.address,
      privateKeyEncrypted: encryptedPrivateKey,
      mnemonic: wallet.mnemonic.phrase, // Should be shown once and stored securely
      blockchainType: 'polygon'
    };
  }

  // Recover wallet from private key
  async recoverWallet(privateKey: string): Promise<ethers.Wallet> {
    const decryptedKey = await this.decryptPrivateKey(privateKey);
    return new ethers.Wallet(decryptedKey);
  }

  // Encryption/Decryption
  private async encryptPrivateKey(privateKey: string): Promise<string> {
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(this.encryptionKey),
      crypto.randomBytes(16)
    );

    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  }

  private async decryptPrivateKey(encryptedKey: string): Promise<string> {
    // Decryption logic
  }
}
```

### 7.5 Gas Fee Management

```typescript
// blockchain/GasFeeManager.ts

class GasFeeManager {
  private provider: ethers.Provider;

  async estimateTransferGas(to: string, amount: BigNumber): Promise<BigNumber> {
    const gasEstimate = await this.provider.estimateGas({
      to,
      value: amount
    });

    return gasEstimate;
  }

  async getCurrentGasPrice(): Promise<BigNumber> {
    return await this.provider.getGasPrice();
  }

  async calculateTransactionFee(gasLimit: BigNumber): Promise<BigNumber> {
    const gasPrice = await this.getCurrentGasPrice();
    return gasLimit.mul(gasPrice);
  }

  // Get optimal gas price with different speeds
  async getGasPriceOptions(): Promise<GasPriceOptions> {
    const currentPrice = await this.getCurrentGasPrice();

    return {
      slow: currentPrice.mul(80).div(100),    // 80% of current
      standard: currentPrice,                  // Current price
      fast: currentPrice.mul(120).div(100)     // 120% of current
    };
  }
}
```

---

## 8. Security Architecture

### 8.1 Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                  APPLICATION SECURITY                    │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Network Security                              │
│    - WAF (Web Application Firewall)                     │
│    - DDoS Protection                                    │
│    - SSL/TLS 1.3                                        │
│    - VPC (Virtual Private Cloud)                        │
├─────────────────────────────────────────────────────────┤
│  Layer 2: API Security                                  │
│    - JWT Authentication                                 │
│    - Rate Limiting (100 req/min per user)              │
│    - Input Validation & Sanitization                    │
│    - CORS Configuration                                 │
│    - API Key Management                                 │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Application Security                          │
│    - 2FA/MFA (TOTP)                                     │
│    - Session Management                                 │
│    - Role-Based Access Control (RBAC)                   │
│    - SQL Injection Prevention (Parameterized Queries)   │
│    - XSS Protection                                     │
│    - CSRF Protection                                    │
├─────────────────────────────────────────────────────────┤
│  Layer 4: Data Security                                 │
│    - AES-256 Encryption (at rest)                       │
│    - TLS Encryption (in transit)                        │
│    - Bcrypt Password Hashing (10 rounds)                │
│    - Encrypted Database Fields                          │
│    - Secure Key Management (AWS KMS / GCP KMS)          │
├─────────────────────────────────────────────────────────┤
│  Layer 5: Transaction Security                          │
│    - Transaction PIN                                    │
│    - Biometric Authentication                           │
│    - Transaction Limits                                 │
│    - Fraud Detection System                             │
│    - Blockchain Transaction Signing                     │
├─────────────────────────────────────────────────────────┤
│  Layer 6: Compliance & Monitoring                       │
│    - KYC/AML Verification                               │
│    - Audit Logging                                      │
│    - Real-time Monitoring                               │
│    - Intrusion Detection                                │
│    - Compliance Reporting                               │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Authentication Flow

```typescript
// auth/AuthService.ts

class AuthService {
  // Registration
  async register(userData: RegisterDTO): Promise<AuthResponse> {
    // 1. Validate input
    this.validateRegistrationData(userData);

    // 2. Check for existing user
    const existingUser = await this.userRepo.findByEmail(userData.email);
    if (existingUser) throw new ConflictError('User already exists');

    // 3. Hash password
    const passwordHash = await bcrypt.hash(userData.password, 10);

    // 4. Create user
    const user = await this.userRepo.create({
      ...userData,
      passwordHash,
      isVerified: false
    });

    // 5. Generate verification token
    const verificationToken = this.generateVerificationToken(user.id);

    // 6. Send verification email
    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    return { userId: user.id, message: 'Registration successful' };
  }

  // Login
  async login(credentials: LoginDTO): Promise<AuthResponse> {
    // 1. Find user
    const user = await this.userRepo.findByEmail(credentials.email);
    if (!user) throw new UnauthorizedError('Invalid credentials');

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.passwordHash
    );
    if (!isPasswordValid) throw new UnauthorizedError('Invalid credentials');

    // 3. Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        tempToken: this.generateTempToken(user.id)
      };
    }

    // 4. Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // 5. Store refresh token
    await this.sessionRepo.create({
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // 6. Log activity
    await this.auditLog.log({
      userId: user.id,
      action: 'LOGIN',
      ipAddress: credentials.ipAddress
    });

    return { accessToken, refreshToken, user };
  }

  // Two-Factor Authentication
  async verifyTwoFactor(tempToken: string, code: string): Promise<AuthResponse> {
    // 1. Verify temp token
    const payload = this.verifyTempToken(tempToken);
    const user = await this.userRepo.findById(payload.userId);

    // 2. Get 2FA secret
    const twoFa = await this.twoFaRepo.findByUserId(user.id);
    const secret = await this.decrypt(twoFa.secretEncrypted);

    // 3. Verify TOTP code
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!isValid) throw new UnauthorizedError('Invalid 2FA code');

    // 4. Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken, user };
  }

  // JWT Generation
  private generateAccessToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
  }

  private generateRefreshToken(user: User): string {
    return jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' }
    );
  }
}
```

### 8.3 Encryption Implementation

```typescript
// security/EncryptionService.ts

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;

  // Encrypt sensitive data
  async encrypt(plaintext: string): Promise<EncryptedData> {
    const key = await this.getEncryptionKey();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      ciphertext: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  // Decrypt sensitive data
  async decrypt(encryptedData: EncryptedData): Promise<string> {
    const key = await this.getEncryptionKey();
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Get encryption key from KMS
  private async getEncryptionKey(): Promise<Buffer> {
    // In production, fetch from AWS KMS or GCP KMS
    const key = process.env.ENCRYPTION_KEY!;
    return Buffer.from(key, 'hex');
  }

  // Hash sensitive data (one-way)
  async hash(data: string): Promise<string> {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }
}
```

### 8.4 Rate Limiting Strategy

```typescript
// middleware/rateLimiter.ts

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// General API rate limiter
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP'
});

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 min
  skipSuccessfulRequests: true
});

// Payment transaction limiter
export const paymentLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:payment:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 transactions per minute
  keyGenerator: (req) => req.user.id // Per user, not IP
});
```

### 8.5 Fraud Detection System

```typescript
// security/FraudDetectionService.ts

class FraudDetectionService {
  async analyzeTransaction(transaction: Transaction): Promise<FraudAnalysis> {
    const riskScore = await this.calculateRiskScore(transaction);

    return {
      riskLevel: this.getRiskLevel(riskScore),
      riskScore,
      flags: await this.detectAnomalies(transaction),
      recommendation: this.getRecommendation(riskScore)
    };
  }

  private async calculateRiskScore(tx: Transaction): Promise<number> {
    let score = 0;

    // Factor 1: Transaction amount (high amount = higher risk)
    if (tx.amount > 100000) score += 30;
    else if (tx.amount > 50000) score += 15;

    // Factor 2: User account age
    const accountAge = await this.getUserAccountAge(tx.senderId);
    if (accountAge < 7) score += 25; // Less than 7 days

    // Factor 3: Transaction velocity (multiple tx in short time)
    const recentTxCount = await this.getRecentTransactionCount(tx.senderId);
    if (recentTxCount > 10) score += 20;

    // Factor 4: KYC verification status
    const isKYCVerified = await this.isUserKYCVerified(tx.senderId);
    if (!isKYCVerified) score += 35;

    // Factor 5: New recipient
    const isNewRecipient = await this.isNewRecipient(tx.senderId, tx.receiverId);
    if (isNewRecipient) score += 10;

    // Factor 6: Unusual location
    const isUnusualLocation = await this.checkLocation(tx.senderId, tx.ipAddress);
    if (isUnusualLocation) score += 15;

    return Math.min(score, 100);
  }

  private getRiskLevel(score: number): RiskLevel {
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  }

  private getRecommendation(score: number): string {
    if (score >= 70) return 'BLOCK_TRANSACTION';
    if (score >= 40) return 'REQUIRE_ADDITIONAL_VERIFICATION';
    return 'ALLOW';
  }
}
```

---

## 9. Infrastructure & Deployment

### 9.1 AWS Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLOUDFRONT CDN                           │
│                    (Static Assets & Web App)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LOAD BALANCER                     │
│                       (SSL Termination)                          │
└───────────────────┬─────────────────────┬───────────────────────┘
                    │                     │
        ┌───────────▼──────────┐  ┌──────▼───────────┐
        │   ECS Cluster (AZ-1) │  │ ECS Cluster (AZ-2)│
        │  ┌─────────────────┐ │  │ ┌─────────────────┐
        │  │ Auth Service    │ │  │ │ Auth Service    │
        │  ├─────────────────┤ │  │ ├─────────────────┤
        │  │ Payment Service │ │  │ │ Payment Service │
        │  ├─────────────────┤ │  │ ├─────────────────┤
        │  │ User Service    │ │  │ │ User Service    │
        │  └─────────────────┘ │  │ └─────────────────┘
        └─────────────────────┘  └─────────────────────┘
                    │                     │
                    └─────────┬───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  RDS (Multi- │    │ ElastiCache  │    │     S3       │
│     AZ)      │    │   (Redis)    │    │  (Documents) │
│  PostgreSQL  │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
        │
        ▼
┌──────────────┐
│  RDS Read    │
│   Replica    │
└──────────────┘
```

### 9.2 Docker Configuration

```dockerfile
# Backend Dockerfile

FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml (Development)

version: '3.8'

services:
  # Backend API
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/malpay
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=malpay
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Web Frontend
  web:
    build: ./frontend-web
    ports:
      - "3001:3001"
    environment:
      - VITE_API_URL=http://localhost:3000
    volumes:
      - ./frontend-web:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
```

### 9.3 Kubernetes Deployment

```yaml
# k8s/deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: malpay-api
  labels:
    app: malpay-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: malpay-api
  template:
    metadata:
      labels:
        app: malpay-api
    spec:
      containers:
      - name: api
        image: malpay/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: malpay-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: malpay-config
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: malpay-api-service
spec:
  selector:
    app: malpay-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: malpay-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: malpay-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 9.4 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml

name: Deploy MalPay

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Run type check
        run: npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: malpay-api
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster malpay-cluster \
            --service malpay-api-service \
            --force-new-deployment
```

### 9.5 Environment Configuration

```bash
# .env.production

# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@prod-db.amazonaws.com:5432/malpay
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://prod-redis.amazonaws.com:6379
REDIS_TTL=3600

# Security
JWT_SECRET=<strong-secret-key>
REFRESH_TOKEN_SECRET=<strong-refresh-secret>
ENCRYPTION_KEY=<32-byte-hex-key>

# Blockchain
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/<project-id>
TRON_RPC_URL=https://api.trongrid.io
USDT_CONTRACT_ADDRESS_POLYGON=0xc2132D05D31c914a87C6611C10748AEb04B58e8F
USDT_CONTRACT_ADDRESS_TRON=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t

# External Services
KYC_PROVIDER_API_KEY=<kyc-api-key>
EXCHANGE_RATE_API_KEY=<exchange-rate-api-key>
SENDGRID_API_KEY=<sendgrid-key>
TWILIO_ACCOUNT_SID=<twilio-sid>
TWILIO_AUTH_TOKEN=<twilio-token>

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=malpay-documents
AWS_KMS_KEY_ID=<kms-key-id>

# Monitoring
SENTRY_DSN=<sentry-dsn>
DATADOG_API_KEY=<datadog-key>
```

---

## 10. Development Workflow

### 10.1 Project Setup

```bash
# Clone repository
git clone https://github.com/malpay/malpay-platform.git
cd malpay-platform

# Install dependencies
npm run install:all

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start Docker services
docker-compose up -d

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Start development servers
npm run dev
```

### 10.2 Development Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\" \"npm run dev:mobile\"",
    "dev:api": "cd backend && npm run dev",
    "dev:web": "cd frontend-web && npm run dev",
    "dev:mobile": "cd frontend-mobile && npm start",

    "build": "npm run build:api && npm run build:web",
    "build:api": "cd backend && npm run build",
    "build:web": "cd frontend-web && npm run build",

    "test": "npm run test:api && npm run test:web",
    "test:api": "cd backend && npm test",
    "test:web": "cd frontend-web && npm test",
    "test:e2e": "cypress run",

    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",

    "type-check": "tsc --noEmit",

    "db:migrate": "cd backend && npm run migrate",
    "db:seed": "cd backend && npm run seed",
    "db:reset": "npm run db:migrate:undo && npm run db:migrate && npm run db:seed",

    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f"
  }
}
```

### 10.3 Git Workflow

```
Main Branches:
  - main: Production-ready code
  - staging: Pre-production testing
  - develop: Integration branch for features

Feature Branches:
  - feature/<feature-name>
  - bugfix/<bug-name>
  - hotfix/<hotfix-name>

Workflow:
  1. Create feature branch from develop
  2. Develop and commit changes
  3. Push and create Pull Request to develop
  4. Code review and approval
  5. Merge to develop
  6. Deploy to staging for testing
  7. Create PR from develop to main
  8. Deploy to production
```

### 10.4 Code Review Checklist

```markdown
## Code Review Checklist

### Functionality
- [ ] Code meets requirements
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] Validation logic correct

### Security
- [ ] No hardcoded secrets
- [ ] Input sanitized
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Authentication checks

### Performance
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Caching implemented where needed
- [ ] Large data sets paginated

### Code Quality
- [ ] Code follows style guide
- [ ] No code duplication
- [ ] Functions are small and focused
- [ ] Meaningful variable names
- [ ] Comments where necessary

### Testing
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Tests pass
- [ ] Code coverage acceptable

### Documentation
- [ ] API documentation updated
- [ ] README updated if needed
- [ ] Comments explain complex logic
```

### 10.5 Testing Strategy

```typescript
// Example: Unit Test (Jest)

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockWalletRepo: jest.Mocked<WalletRepository>;
  let mockBlockchainService: jest.Mocked<BlockchainService>;

  beforeEach(() => {
    mockWalletRepo = {
      findByUserId: jest.fn(),
      updateBalance: jest.fn()
    } as any;

    mockBlockchainService = {
      transfer: jest.fn(),
      getBalance: jest.fn()
    } as any;

    paymentService = new PaymentService(
      mockWalletRepo,
      mockBlockchainService
    );
  });

  describe('transfer', () => {
    it('should successfully transfer funds between users', async () => {
      // Arrange
      const sender = { id: '123', balance: 10000 };
      const receiver = { id: '456', balance: 5000 };

      mockWalletRepo.findByUserId
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(receiver);

      mockBlockchainService.transfer.mockResolvedValue('0xabc123');

      // Act
      const result = await paymentService.transfer({
        senderId: '123',
        receiverId: '456',
        amount: 1000
      });

      // Assert
      expect(result.status).toBe('completed');
      expect(mockBlockchainService.transfer).toHaveBeenCalledWith(
        sender.walletAddress,
        receiver.walletAddress,
        1000
      );
    });

    it('should throw error if insufficient balance', async () => {
      const sender = { id: '123', balance: 500 };
      mockWalletRepo.findByUserId.mockResolvedValue(sender);

      await expect(
        paymentService.transfer({
          senderId: '123',
          receiverId: '456',
          amount: 1000
        })
      ).rejects.toThrow('Insufficient balance');
    });
  });
});
```

```typescript
// Example: Integration Test (Supertest)

describe('POST /payments/transfer', () => {
  it('should transfer funds successfully', async () => {
    const response = await request(app)
      .post('/api/v1/payments/transfer')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        recipient: 'user@example.com',
        amount: 5000,
        currency: 'NGN',
        pin: '1234'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('processing');
  });

  it('should return 401 if not authenticated', async () => {
    const response = await request(app)
      .post('/api/v1/payments/transfer')
      .send({
        recipient: 'user@example.com',
        amount: 5000
      });

    expect(response.status).toBe(401);
  });
});
```

---

## 11. Monitoring & Logging

### 11.1 Logging Strategy

```typescript
// utils/logger.ts

import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'malpay-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Production: send to CloudWatch or Datadog
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new WinstonCloudWatch({
      logGroupName: 'malpay-api',
      logStreamName: process.env.INSTANCE_ID
    })
  );
}

export default logger;
```

### 11.2 Performance Monitoring

```typescript
// middleware/performanceMonitoring.ts

import { performance } from 'perf_hooks';

export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();

  res.on('finish', () => {
    const duration = performance.now() - start;

    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      userId: req.user?.id
    });

    // Send metrics to monitoring service
    metrics.recordRequestDuration(req.route.path, duration);
    metrics.incrementRequestCount(req.method, res.statusCode);
  });

  next();
};
```

---

## 12. Compliance & Regulatory

### 12.1 KYC/AML Requirements

```
Tier 1 (Basic Account):
  - Email verification
  - Phone verification
  - Transaction limit: $1,000/day

Tier 2 (Verified Account):
  - ID document (Passport, Driver's License, National ID)
  - Proof of address (Utility bill, Bank statement)
  - Selfie verification
  - Transaction limit: $10,000/day

Tier 3 (Business Account):
  - Business registration documents
  - Tax identification number
  - Business address verification
  - UBO (Ultimate Beneficial Owner) disclosure
  - Transaction limit: $100,000/day
```

### 12.2 Data Retention Policy

```
User Data: 7 years after account closure
Transaction Records: 7 years
Audit Logs: 5 years
KYC Documents: 7 years after last transaction
Session Logs: 90 days
```

---

## Summary

This comprehensive architecture document covers:

1. **System Architecture**: Microservices-based design with clear separation of concerns
2. **Database Design**: Normalized PostgreSQL schema with proper indexing and relationships
3. **API Architecture**: RESTful API with comprehensive endpoint specifications
4. **Frontend Architecture**: Structured React Native and React web applications
5. **Blockchain Integration**: USDT-based payment processing on Tron/Polygon
6. **Security**: Multi-layered security with encryption, authentication, and fraud detection
7. **Infrastructure**: Scalable AWS/GCP deployment with Docker and Kubernetes
8. **Development Workflow**: CI/CD pipeline, testing strategy, and code review process

**Next Steps:**
1. Review and approve this architecture
2. Set up development environment
3. Begin Sprint 1 implementation (User Authentication & Onboarding)
4. Set up CI/CD pipeline
5. Configure cloud infrastructure

This architecture is designed to be scalable, secure, and maintainable while supporting the core requirements of the MalPay platform.
