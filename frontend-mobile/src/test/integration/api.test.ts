import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { configureStore } from '@reduxjs/toolkit';
import { walletApi } from '../../services/WalletService';
import { paymentApi } from '../../services/PaymentService';

// Mock server setup
const server = setupServer(
  rest.get('/api/v1/wallet/balance', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          balance: 1000.00,
          currency: 'NGN',
        },
      })
    );
  }),

  rest.get('/api/v1/wallet/currencies', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          currencies: [
            { currency: 'NGN', rate: 1500.00, lastUpdated: '2025-01-01T00:00:00Z' },
            { currency: 'USD', rate: 1.00, lastUpdated: '2025-01-01T00:00:00Z' },
          ],
          baseCurrency: 'USDT',
        },
      })
    );
  }),

  rest.post('/api/v1/wallet/change-currency', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: 'Currency updated successfully',
      })
    );
  }),

  rest.post('/api/v1/wallet/sync', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          balance: 1000.00,
          currency: 'NGN',
          syncedAt: '2025-01-01T00:00:00Z',
        },
      })
    );
  }),

  rest.get('/api/v1/wallet/transactions', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          transactions: [
            {
              id: '1',
              type: 'transfer',
              status: 'completed',
              amount: 100.00,
              currency: 'NGN',
              fee: 2.50,
              description: 'Transfer to John',
              createdAt: '2025-01-01T10:00:00Z',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1,
          },
        },
      })
    );
  }),

  rest.post('/api/v1/payments/transfer', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          transactionId: 'tx-123',
          status: 'completed',
          amount: 100.00,
          currency: 'NGN',
          recipient: {
            username: 'recipient',
            email: 'recipient@example.com',
          },
          fee: 2.50,
          estimatedCompletion: '2025-01-01T00:01:00Z',
        },
      })
    );
  }),

  rest.get('/api/v1/payments/transactions', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          transactions: [
            {
              id: '1',
              type: 'transfer',
              status: 'completed',
              amount: 100.00,
              currency: 'NGN',
              fee: 2.50,
              description: 'Transfer to John',
              createdAt: '2025-01-01T10:00:00Z',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1,
          },
        },
      })
    );
  }),

  rest.get('/api/v1/payments/transactions/:id', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          id: '1',
          type: 'transfer',
          status: 'completed',
          amount: 100.00,
          currency: 'NGN',
          fee: 2.50,
          description: 'Transfer to John',
          createdAt: '2025-01-01T10:00:00Z',
        },
      })
    );
  }),

  rest.post('/api/v1/payments/deposit', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          transactionId: 'deposit-123',
          amount: 500.00,
          currency: 'NGN',
          status: 'completed',
          createdAt: '2025-01-01T00:00:00Z',
        },
      })
    );
  }),

  rest.post('/api/v1/payments/withdraw', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          transactionId: 'withdraw-123',
          amount: 200.00,
          currency: 'NGN',
          status: 'completed',
          createdAt: '2025-01-01T00:00:00Z',
        },
      })
    );
  })
);

// Setup and teardown
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Integration Tests', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        [walletApi.reducerPath]: walletApi.reducer,
        [paymentApi.reducerPath]: paymentApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
          walletApi.middleware,
          paymentApi.middleware
        ),
    });
  });

  describe('Wallet API', () => {
    test('should fetch wallet balance', async () => {
      const result = await store.dispatch(walletApi.endpoints.getWalletBalance.initiate());
      
      expect(result.data).toEqual({
        success: true,
        data: {
          balance: 1000.00,
          currency: 'NGN',
        },
      });
    });

    test('should fetch currencies', async () => {
      const result = await store.dispatch(walletApi.endpoints.getCurrencies.initiate());
      
      expect(result.data).toEqual({
        success: true,
        data: {
          currencies: [
            { currency: 'NGN', rate: 1500.00, lastUpdated: '2025-01-01T00:00:00Z' },
            { currency: 'USD', rate: 1.00, lastUpdated: '2025-01-01T00:00:00Z' },
          ],
          baseCurrency: 'USDT',
        },
      });
    });

    test('should change currency', async () => {
      const result = await store.dispatch(
        walletApi.endpoints.changeCurrency.initiate({ currency: 'USD' })
      );
      
      expect(result.data).toEqual({
        success: true,
        message: 'Currency updated successfully',
      });
    });

    test('should sync balance', async () => {
      const result = await store.dispatch(walletApi.endpoints.syncBalance.initiate());
      
      expect(result.data).toEqual({
        success: true,
        data: {
          balance: 1000.00,
          currency: 'NGN',
          syncedAt: '2025-01-01T00:00:00Z',
        },
      });
    });

    test('should fetch wallet transactions', async () => {
      const result = await store.dispatch(
        walletApi.endpoints.getWalletTransactions.initiate({
          page: 1,
          limit: 20,
        })
      );
      
      expect(result.data).toEqual({
        success: true,
        data: {
          transactions: [
            {
              id: '1',
              type: 'transfer',
              status: 'completed',
              amount: 100.00,
              currency: 'NGN',
              fee: 2.50,
              description: 'Transfer to John',
              createdAt: '2025-01-01T10:00:00Z',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1,
          },
        },
      });
    });
  });

  describe('Payment API', () => {
    test('should transfer money', async () => {
      const transferData = {
        recipientEmail: 'recipient@example.com',
        amount: 100,
        currency: 'NGN',
        description: 'Test transfer',
        pin: '1234',
      };

      const result = await store.dispatch(
        paymentApi.endpoints.transfer.initiate(transferData)
      );
      
      expect(result.data).toEqual({
        success: true,
        data: {
          transactionId: 'tx-123',
          status: 'completed',
          amount: 100.00,
          currency: 'NGN',
          recipient: {
            username: 'recipient',
            email: 'recipient@example.com',
          },
          fee: 2.50,
          estimatedCompletion: '2025-01-01T00:01:00Z',
        },
      });
    });

    test('should fetch transactions', async () => {
      const filters = {
        page: 1,
        limit: 20,
        type: 'transfer',
        status: 'completed',
      };

      const result = await store.dispatch(
        paymentApi.endpoints.getTransactions.initiate(filters)
      );
      
      expect(result.data).toEqual({
        success: true,
        data: {
          transactions: [
            {
              id: '1',
              type: 'transfer',
              status: 'completed',
              amount: 100.00,
              currency: 'NGN',
              fee: 2.50,
              description: 'Transfer to John',
              createdAt: '2025-01-01T10:00:00Z',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1,
          },
        },
      });
    });

    test('should fetch specific transaction', async () => {
      const result = await store.dispatch(
        paymentApi.endpoints.getTransaction.initiate('1')
      );
      
      expect(result.data).toEqual({
        success: true,
        data: {
          id: '1',
          type: 'transfer',
          status: 'completed',
          amount: 100.00,
          currency: 'NGN',
          fee: 2.50,
          description: 'Transfer to John',
          createdAt: '2025-01-01T10:00:00Z',
        },
      });
    });

    test('should process deposit', async () => {
      const depositData = {
        amount: 500,
        currency: 'NGN',
        sourceType: 'card',
        sourceId: 'card-123',
      };

      const result = await store.dispatch(
        paymentApi.endpoints.deposit.initiate(depositData)
      );
      
      expect(result.data).toEqual({
        success: true,
        data: {
          transactionId: 'deposit-123',
          amount: 500.00,
          currency: 'NGN',
          status: 'completed',
          createdAt: '2025-01-01T00:00:00Z',
        },
      });
    });

    test('should process withdrawal', async () => {
      const withdrawalData = {
        amount: 200,
        currency: 'NGN',
        destinationType: 'bank_account',
        destinationId: 'bank-123',
        pin: '1234',
      };

      const result = await store.dispatch(
        paymentApi.endpoints.withdraw.initiate(withdrawalData)
      );
      
      expect(result.data).toEqual({
        success: true,
        data: {
          transactionId: 'withdraw-123',
          amount: 200.00,
          currency: 'NGN',
          status: 'completed',
          createdAt: '2025-01-01T00:00:00Z',
        },
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors', async () => {
      server.use(
        rest.get('/api/v1/wallet/balance', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              success: false,
              error: 'Internal server error',
            })
          );
        })
      );

      const result = await store.dispatch(walletApi.endpoints.getWalletBalance.initiate());
      
      expect(result.error).toBeDefined();
      expect(result.error.data).toEqual({
        success: false,
        error: 'Internal server error',
      });
    });

    test('should handle network errors', async () => {
      server.use(
        rest.get('/api/v1/wallet/balance', (req, res, ctx) => {
          return res.networkError('Network error');
        })
      );

      const result = await store.dispatch(walletApi.endpoints.getWalletBalance.initiate());
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Network error');
    });

    test('should handle validation errors', async () => {
      server.use(
        rest.post('/api/v1/payments/transfer', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              success: false,
              error: 'Invalid email format',
            })
          );
        })
      );

      const transferData = {
        recipientEmail: 'invalid-email',
        amount: 100,
        currency: 'NGN',
        pin: '1234',
      };

      const result = await store.dispatch(
        paymentApi.endpoints.transfer.initiate(transferData)
      );
      
      expect(result.error).toBeDefined();
      expect(result.error.data).toEqual({
        success: false,
        error: 'Invalid email format',
      });
    });
  });

  describe('Caching', () => {
    test('should cache API responses', async () => {
      // First call
      const result1 = await store.dispatch(walletApi.endpoints.getWalletBalance.initiate());
      expect(result1.data).toBeDefined();

      // Second call should use cache
      const result2 = await store.dispatch(walletApi.endpoints.getWalletBalance.initiate());
      expect(result2.data).toBeDefined();
      expect(result1.data).toEqual(result2.data);
    });

    test('should invalidate cache on mutation', async () => {
      // Fetch balance
      await store.dispatch(walletApi.endpoints.getWalletBalance.initiate());
      
      // Change currency (should invalidate balance cache)
      await store.dispatch(
        walletApi.endpoints.changeCurrency.initiate({ currency: 'USD' })
      );
      
      // Next balance fetch should be fresh
      const result = await store.dispatch(walletApi.endpoints.getWalletBalance.initiate());
      expect(result.data).toBeDefined();
    });
  });
});
