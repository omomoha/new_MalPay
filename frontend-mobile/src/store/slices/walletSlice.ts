import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Wallet, WalletBalance } from '@types/wallet.types';

interface WalletState {
  wallets: Wallet[];
  activeWallet: Wallet | null;
  balance: WalletBalance | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  wallets: [],
  activeWallet: null,
  balance: null,
  isLoading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWallets: (state, action: PayloadAction<Wallet[]>) => {
      state.wallets = action.payload;
      if (!state.activeWallet && action.payload.length > 0) {
        state.activeWallet = action.payload[0];
      }
    },
    setActiveWallet: (state, action: PayloadAction<Wallet>) => {
      state.activeWallet = action.payload;
    },
    setWalletBalance: (state, action: PayloadAction<WalletBalance>) => {
      state.balance = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setWallets,
  setActiveWallet,
  setWalletBalance,
  setLoading,
  setError,
} = walletSlice.actions;

export default walletSlice.reducer;