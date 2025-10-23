import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bankAccountsAPI } from '../../services/api';

export interface BankAccount {
  id: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
  accountType?: string;
  isVerified: boolean;
  isPrimary: boolean;
  verificationReference?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccountsState {
  bankAccounts: BankAccount[];
  isLoading: boolean;
  error: string | null;
  addingAccount: boolean;
}

const initialState: BankAccountsState = {
  bankAccounts: [],
  isLoading: false,
  error: null,
  addingAccount: false,
};

// Async thunks
export const fetchBankAccounts = createAsyncThunk(
  'bankAccounts/fetchBankAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bankAccountsAPI.getBankAccounts();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch bank accounts');
    }
  }
);

export const addBankAccount = createAsyncThunk(
  'bankAccounts/addBankAccount',
  async (accountData: {
    accountNumber: string;
    bankCode: string;
  }, { rejectWithValue }) => {
    try {
      const response = await bankAccountsAPI.addBankAccount(accountData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to add bank account');
    }
  }
);

export const deleteBankAccount = createAsyncThunk(
  'bankAccounts/deleteBankAccount',
  async (accountId: string, { rejectWithValue }) => {
    try {
      await bankAccountsAPI.deleteBankAccount(accountId);
      return { accountId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete bank account');
    }
  }
);

const bankAccountsSlice = createSlice({
  name: 'bankAccounts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAddingAccount: (state, action: PayloadAction<boolean>) => {
      state.addingAccount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bank Accounts
      .addCase(fetchBankAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBankAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bankAccounts = action.payload.bankAccounts;
        state.error = null;
      })
      .addCase(fetchBankAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add Bank Account
      .addCase(addBankAccount.pending, (state) => {
        state.addingAccount = true;
        state.error = null;
      })
      .addCase(addBankAccount.fulfilled, (state, action) => {
        state.addingAccount = false;
        state.bankAccounts.push(action.payload.bankAccount);
        state.error = null;
      })
      .addCase(addBankAccount.rejected, (state, action) => {
        state.addingAccount = false;
        state.error = action.payload as string;
      })
      // Delete Bank Account
      .addCase(deleteBankAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBankAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bankAccounts = state.bankAccounts.filter(account => account.id !== action.payload.accountId);
        state.error = null;
      })
      .addCase(deleteBankAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setAddingAccount } = bankAccountsSlice.actions;
export default bankAccountsSlice.reducer;
