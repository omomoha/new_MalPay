# Mastercard Account Balance Feature

This document describes the implementation of the Mastercard account balance checking feature for MalPay, which allows users to view their account balances for Mastercard cards.

## Overview

The feature enables Mastercard holders to:
- View their current account balance for each Mastercard
- Refresh balance information by providing card details
- See real-time balance updates
- Access this feature on both web and mobile platforms

**Important**: Only Mastercard holders can access this feature. Other card types (Visa, American Express, etc.) are not supported.

## Architecture

### Backend Components

#### 1. Database Model (`CardBalance.ts`)
- Stores encrypted balance data for each card
- Links to user and card records
- Includes card type, encrypted balance, currency, and timestamps
- Uses AES-256-CBC encryption for sensitive data

#### 2. Mastercard API Service (`MastercardBalanceService.ts`)
- Integrates with Mastercard Account Balance Verification API
- Handles OAuth 1.0 authentication
- Validates Mastercard card numbers using Luhn algorithm
- Provides mock data for development/testing
- Encrypts/decrypts account numbers for API transmission

#### 3. Card Balance Service (`CardBalanceService.ts`)
- Manages balance data operations
- Handles encryption/decryption of balance information
- Provides CRUD operations for card balances
- Implements card masking for display

#### 4. API Routes (`balanceRoutes.ts`)
- RESTful endpoints for balance operations
- Admin access restrictions
- Input validation and error handling
- Authentication middleware

### Frontend Components

#### Web Application
- **BalanceCard**: Individual card balance display component
- **BalanceList**: Main balance listing with notifications
- **RefreshBalanceDialog**: Modal for refreshing card balance
- **BalancePage**: Main balance page

#### Mobile Application
- **BalanceScreen**: Main balance screen with card list
- **RefreshBalanceModal**: Modal for refreshing card balance
- **Balance API Integration**: RTK Query hooks for API calls

## API Endpoints

### GET `/api/v1/balance/cards`
Get all card balances for the authenticated user.

**Response:**
```json
{
  "success": true,
  "balances": [
    {
      "cardId": "uuid",
      "cardType": "mastercard",
      "maskedCardNumber": "5555 **** **** 4444",
      "balance": 15000.50,
      "currency": "NGN",
      "lastUpdated": "2024-01-01T12:00:00Z",
      "isMastercard": true
    }
  ],
  "totalBalance": 15000.50,
  "currency": "NGN",
  "notification": {
    "message": "Only Mastercard holders can view their account balance",
    "type": "info",
    "showAlways": true
  }
}
```

### GET `/api/v1/balance/cards/:cardId`
Get balance for a specific card.

### POST `/api/v1/balance/cards/:cardId/refresh`
Refresh balance for a specific Mastercard.

**Request:**
```json
{
  "cardNumber": "5555555555554444",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cvv": "123",
  "cardholderName": "John Doe"
}
```

### GET `/api/v1/balance/mastercard-status`
Check if user has any Mastercard balances.

### DELETE `/api/v1/balance/cards/:cardId`
Deactivate card balance (when card is removed).

## Security Features

### 1. Data Encryption
- All balance data is encrypted using AES-256-CBC
- Account numbers are encrypted for API transmission
- Encryption keys are stored in environment variables

### 2. Admin Access Restrictions
- Admins cannot access user balance information
- Role-based access control implemented
- Separate admin endpoints for system monitoring

### 3. Input Validation
- Card number validation using Luhn algorithm
- Mastercard-specific validation (5[1-5] or 2[2-7] patterns)
- Expiry date validation
- CVV format validation
- Cardholder name validation

### 4. API Security
- JWT token authentication required
- Rate limiting (configurable)
- Input sanitization
- CORS protection

## Environment Variables

### Backend
```env
# Mastercard API Configuration
MASTERCARD_API_BASE_URL=https://sandbox.api.mastercard.com
MASTERCARD_API_KEY=your_api_key
MASTERCARD_MERCHANT_ID=your_merchant_id
MASTERCARD_ENCRYPTION_KEY=your_encryption_key

# General Encryption
ENCRYPTION_KEY=your_32_byte_hex_key
CARD_ENCRYPTION_KEY=your_card_encryption_key
```

### Frontend
```env
# Web
REACT_APP_API_URL=http://localhost:3000/api/v1

# Mobile
API_BASE_URL=http://localhost:3000/api/v1
```

## Database Schema

### CardBalance Table
```sql
CREATE TABLE card_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  card_id UUID NOT NULL REFERENCES cards(id),
  card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('mastercard', 'visa', 'amex', 'discover', 'verve')),
  encrypted_balance TEXT NOT NULL,
  encrypted_currency TEXT NOT NULL,
  encrypted_account_number TEXT NOT NULL,
  last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_card_balances_user_id ON card_balances(user_id);
CREATE INDEX idx_card_balances_card_id ON card_balances(card_id);
CREATE INDEX idx_card_balances_card_type ON card_balances(card_type);
CREATE INDEX idx_card_balances_is_active ON card_balances(is_active);
```

## Usage Examples

### Web Application
```typescript
import { useGetAllCardBalancesQuery } from '../store/slices/balanceSlice';

function BalancePage() {
  const { data, isLoading, error } = useGetAllCardBalancesQuery();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading balances</div>;
  
  return (
    <div>
      {data.balances.map(balance => (
        <BalanceCard key={balance.cardId} balance={balance} />
      ))}
    </div>
  );
}
```

### Mobile Application
```typescript
import { useGetAllCardBalancesQuery } from '@store/api/api';

function BalanceScreen() {
  const { data, isLoading, error } = useGetAllCardBalancesQuery();
  
  return (
    <ScrollView>
      {data?.balances.map(balance => (
        <BalanceCard key={balance.cardId} balance={balance} />
      ))}
    </ScrollView>
  );
}
```

## Testing

### Backend Tests
```bash
cd backend
npm test -- balance.test.ts
```

### Frontend Tests
```bash
# Web
cd frontend-web
npm test -- Balance

# Mobile
cd frontend-mobile
npm test -- Balance
```

## Deployment Considerations

### 1. Mastercard API Setup
- Register with Mastercard Developer Portal
- Obtain production API credentials
- Configure OAuth 1.0 authentication
- Set up webhook endpoints (if needed)

### 2. Database Migration
- Run migration scripts to create CardBalance table
- Set up proper indexes for performance
- Configure backup and recovery

### 3. Security Configuration
- Generate strong encryption keys
- Configure HTTPS for all endpoints
- Set up proper CORS policies
- Implement rate limiting

### 4. Monitoring
- Set up logging for balance operations
- Monitor API response times
- Track error rates and failures
- Implement alerting for critical issues

## Error Handling

### Common Error Scenarios
1. **Invalid Card Number**: Card number doesn't match Mastercard pattern
2. **Expired Card**: Card expiry date is in the past
3. **API Unavailable**: Mastercard API is down or unreachable
4. **Invalid Credentials**: Card details don't match
5. **Encryption Errors**: Failed to encrypt/decrypt data

### Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Human readable error message",
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live balance updates
2. **Balance History**: Track balance changes over time
3. **Notifications**: Push notifications for balance changes
4. **Multi-currency Support**: Support for different currencies
5. **Batch Operations**: Refresh multiple cards at once
6. **Analytics**: Balance usage analytics and insights

## Support

For technical support or questions about this feature:
- Check the API documentation
- Review error logs
- Contact the development team
- Refer to Mastercard API documentation

## Changelog

### v1.0.0 (2024-01-01)
- Initial implementation of Mastercard balance checking
- Web and mobile UI components
- Backend API endpoints
- Encryption and security features
- Admin access restrictions
