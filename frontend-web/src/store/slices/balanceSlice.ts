import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { balanceAPI } from '../../services/api';

export interface CardBalance {
  cardId: string;
  cardType: string;
  maskedCardNumber: string;
  balance: number;
  currency: string;
  lastUpdated: string;
  isMastercard: boolean;
}

export interface BalanceState {
  balances: CardBalance[];
  totalBalance: number;
  currency: string;
  notification: {
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    showAlways: boolean;
  } | null;
  loading: boolean;
  error: string | null;
  hasMastercardBalances: boolean;
  refreshing: boolean;
}

const initialState: BalanceState = {
  balances: [],
  totalBalance: 0,
  currency: 'NGN',
  notification: null,
  loading: false,
  error: null,
  hasMastercardBalances: false,
  refreshing: false,
};

// Async thunks
export const fetchAllCardBalances = createAsyncThunk(
  'balance/fetchAllCardBalances',
  async (_, { rejectWithValue }) => {
    try {
      const response = await balanceAPI.getAllCardBalances();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch card balances');
    }
  }
);

export const fetchCardBalance = createAsyncThunk(
  'balance/fetchCardBalance',
  async (cardId: string, { rejectWithValue }) => {
    try {
      const response = await balanceAPI.getCardBalance(cardId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch card balance');
    }
  }
);

export const refreshCardBalance = createAsyncThunk(
  'balance/refreshCardBalance',
  async ({ cardId, cardData }: { cardId: string; cardData: any }, { rejectWithValue }) => {
    try {
      const response = await balanceAPI.refreshCardBalance(cardId, cardData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to refresh card balance');
    }
  }
);

export const checkMastercardStatus = createAsyncThunk(
  'balance/checkMastercardStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await balanceAPI.getMastercardStatus();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to check Mastercard status');
    }
  }
);

export const deactivateCardBalance = createAsyncThunk(
  'balance/deactivateCardBalance',
  async (cardId: string, { rejectWithValue }) => {
    try {
      await balanceAPI.deactivateCardBalance(cardId);
      return cardId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to deactivate card balance');
    }
  }
);

const balanceSlice = createSlice({
  name: 'balance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all card balances
    builder
      .addCase(fetchAllCardBalances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCardBalances.fulfilled, (state, action) => {
        state.loading = false;
        state.balances = action.payload.balances || [];
        state.totalBalance = action.payload.totalBalance || 0;
        state.currency = action.payload.currency || 'NGN';
        state.notification = action.payload.notification || null;
        state.hasMastercardBalances = action.payload.balances?.length > 0 || false;
      })
      .addCase(fetchAllCardBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single card balance
    builder
      .addCase(fetchCardBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCardBalance.fulfilled, (state, action) => {
        state.loading = false;
        const balance = action.payload.balance;
        const existingIndex = state.balances.findIndex(b => b.cardId === balance.cardId);
        
        if (existingIndex >= 0) {
          state.balances[existingIndex] = balance;
        } else {
          state.balances.push(balance);
        }
        
        // Recalculate total balance
        state.totalBalance = state.balances.reduce((sum, b) => sum + b.balance, 0);
      })
      .addCase(fetchCardBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Refresh card balance
    builder
      .addCase(refreshCardBalance.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(refreshCardBalance.fulfilled, (state, action) => {
        state.refreshing = false;
        const balance = action.payload.balance;
        const existingIndex = state.balances.findIndex(b => b.cardId === balance.cardId);
        
        if (existingIndex >= 0) {
          state.balances[existingIndex] = balance;
        } else {
          state.balances.push(balance);
        }
        
        // Recalculate total balance
        state.totalBalance = state.balances.reduce((sum, b) => sum + b.balance, 0);
        state.currency = balance.currency;
      })
      .addCase(refreshCardBalance.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload as string;
      });

    // Check Mastercard status
    builder
      .addCase(checkMastercardStatus.fulfilled, (state, action) => {
        state.hasMastercardBalances = action.payload.hasMastercardBalances;
      });

    // Deactivate card balance
    builder
      .addCase(deactivateCardBalance.fulfilled, (state, action) => {
        const cardId = action.payload;
        state.balances = state.balances.filter(b => b.cardId !== cardId);
        state.totalBalance = state.balances.reduce((sum, b) => sum + b.balance, 0);
        state.hasMastercardBalances = state.balances.length > 0;
      });
  },
});

export const { clearError, clearNotification, setRefreshing } = balanceSlice.actions;
export default balanceSlice.reducer;
