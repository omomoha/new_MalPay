import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@types/user.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  twoFactorRequired: boolean;
  tempToken: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  twoFactorRequired: false,
  tempToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.twoFactorRequired = false;
      state.tempToken = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTwoFactorRequired: (state, action: PayloadAction<{ required: boolean; tempToken?: string | null }>) => {
      state.twoFactorRequired = action.payload.required;
      state.tempToken = action.payload.tempToken || null;
    },
  },
});

export const {
  setAuthTokens,
  setUser,
  clearAuth,
  setLoading,
  setError,
  setTwoFactorRequired,
} = authSlice.actions;

export default authSlice.reducer;