import transactionReducer, {
  setTransactions,
  addTransaction,
  setCurrentTransaction,
  setFilters,
  setPagination,
  setLoading,
  setError,
} from '../transactionSlice';
import { Transaction, TransactionFilters, Pagination } from '@types/transaction.types';

describe('Transaction Slice', () => {
const initialState = {
  transactions: [],
  currentTransaction: null,
  filters: {
    page: 1,
    limit: 20,
    status: 'all',
    type: 'all',
    search: '',
    startDate: null,
    endDate: null,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
  isLoading: false,
  error: null,
};

  const mockTransaction: Transaction = {
    id: 'test-transaction-id',
    txHash: 'test-tx-hash',
    type: 'transfer',
    status: 'completed',
    amount: 100.00,
    currency: 'NGN',
    fee: 2.50,
    description: 'Test transaction',
    recipient: {
      username: 'recipient',
      email: 'recipient@example.com',
    },
    createdAt: '2025-01-01T00:00:00Z',
    completedAt: '2025-01-01T00:01:00Z',
  };

  const mockPagination: Pagination = {
    page: 1,
    limit: 20,
    total: 100,
    pages: 5,
    hasNext: true,
    hasPrev: false,
  };

  test('should return initial state', () => {
    expect(transactionReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('should handle setTransactions', () => {
    const transactions = [mockTransaction];
    const newState = transactionReducer(initialState, setTransactions(transactions));
    expect(newState.transactions).toEqual(transactions);
  });

  test('should handle addTransaction', () => {
    const newTransaction: Transaction = {
      ...mockTransaction,
      id: 'new-transaction-id',
    };

    const stateWithTransactions = {
      ...initialState,
      transactions: [mockTransaction],
    };

    const newState = transactionReducer(stateWithTransactions, addTransaction(newTransaction));
    expect(newState.transactions).toHaveLength(2);
    expect(newState.transactions[0]).toEqual(newTransaction); // Should be added to the top
  });

  test('should handle setCurrentTransaction', () => {
    const newState = transactionReducer(initialState, setCurrentTransaction(mockTransaction));
    expect(newState.currentTransaction).toEqual(mockTransaction);

    const newState2 = transactionReducer(newState, setCurrentTransaction(null));
    expect(newState2.currentTransaction).toBe(null);
  });

  test('should handle setFilters', () => {
    const newFilters: Partial<TransactionFilters> = {
      status: 'completed',
      type: 'transfer',
    };

    const newState = transactionReducer(initialState, setFilters(newFilters));
    expect(newState.filters.status).toBe('completed');
    expect(newState.filters.type).toBe('transfer');
    expect(newState.filters.page).toBe(1); // Should preserve existing values
    expect(newState.filters.limit).toBe(20);
  });

  test('should handle setPagination', () => {
    const newState = transactionReducer(initialState, setPagination(mockPagination));
    expect(newState.pagination).toEqual(mockPagination);
  });

  test('should handle setLoading', () => {
    const newState = transactionReducer(initialState, setLoading(true));
    expect(newState.isLoading).toBe(true);

    const newState2 = transactionReducer(newState, setLoading(false));
    expect(newState2.isLoading).toBe(false);
  });

  test('should handle setError', () => {
    const errorMessage = 'Transaction error';
    const newState = transactionReducer(initialState, setError(errorMessage));
    expect(newState.error).toBe(errorMessage);

    const newState2 = transactionReducer(newState, setError(null));
    expect(newState2.error).toBe(null);
  });

  test('should handle multiple actions', () => {
    let state = transactionReducer(initialState, setLoading(true));
    expect(state.isLoading).toBe(true);

    state = transactionReducer(state, setTransactions([mockTransaction]));
    expect(state.transactions).toEqual([mockTransaction]);

    state = transactionReducer(state, setCurrentTransaction(mockTransaction));
    expect(state.currentTransaction).toEqual(mockTransaction);

    state = transactionReducer(state, setPagination(mockPagination));
    expect(state.pagination).toEqual(mockPagination);

    state = transactionReducer(state, setLoading(false));
    expect(state.isLoading).toBe(false);
  });

  test('should handle addTransaction with empty list', () => {
    const newState = transactionReducer(initialState, addTransaction(mockTransaction));
    expect(newState.transactions).toHaveLength(1);
    expect(newState.transactions[0]).toEqual(mockTransaction);
  });

  test('should handle setFilters with partial update', () => {
    const stateWithFilters = {
      ...initialState,
      filters: {
        page: 2,
        limit: 10,
        status: 'pending',
        type: 'deposit',
      },
    };

    const newFilters: Partial<TransactionFilters> = {
      status: 'completed',
    };

    const newState = transactionReducer(stateWithFilters, setFilters(newFilters));
    expect(newState.filters.status).toBe('completed');
    expect(newState.filters.type).toBe('deposit'); // Should preserve
    expect(newState.filters.page).toBe(2); // Should preserve
    expect(newState.filters.limit).toBe(10); // Should preserve
  });
});
