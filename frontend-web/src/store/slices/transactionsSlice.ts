import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { transactionsAPI } from '../services/api';

export interface Transaction {
  id: string;
  txHash?: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'card_addition_fee';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  description?: string;
  recipientEmail?: string;
  recipientName?: string;
  senderEmail?: string;
  senderName?: string;
  cryptoProcessorFee: number;
  malpayCharge: number;
  totalFees: number;
  exchangeRate?: number;
  processor?: 'tron' | 'polygon' | 'ethereum';
  gatewayTransactionId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    type?: string;
    status?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

const initialState: TransactionsState = {
  transactions: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {},
};

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await transactionsAPI.getTransactions(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch transactions');
    }
  }
);

export const getTransactionById = createAsyncThunk(
  'transactions/getTransactionById',
  async (transactionId: string, { rejectWithValue }) => {
    try {
      const response = await transactionsAPI.getTransactionById(transactionId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch transaction');
    }
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPagination: (state, action: PayloadAction<Partial<typeof initialState.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Transaction By ID
      .addCase(getTransactionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionById.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.transactions.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        } else {
          state.transactions.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(getTransactionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  setPagination, 
  addTransaction, 
  updateTransaction 
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
