import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  is2FAEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check for stored tokens
  error: null,
  tokens: {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  },
};

// Async thunks
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      console.log('initializeAuth: Checking for access token...');
      const accessToken = localStorage.getItem('accessToken');
      console.log('initializeAuth: Access token found:', !!accessToken);
      
      if (!accessToken || accessToken === 'null' || accessToken === 'undefined') {
        console.log('initializeAuth: No valid access token, user not authenticated');
        return { isAuthenticated: false };
      }
      
      // Check if token is a valid format (not just "mock-access-token")
      if (accessToken === 'mock-access-token') {
        console.log('initializeAuth: Mock token found, treating as not authenticated');
        return { isAuthenticated: false };
      }
      
      // In a real app, you would validate the token with the server
      // For now, we'll just check if it exists and is valid
      console.log('initializeAuth: Valid access token exists, user authenticated');
      return { isAuthenticated: true };
    } catch (error: any) {
      console.error('initializeAuth: Error during initialization:', error);
      return rejectWithValue('Failed to initialize auth');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  }, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Registration failed');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyEmail(token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Email verification failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Logout failed');
    }
  }
);

export const checkProfileCompletion = createAsyncThunk(
  'auth/checkProfileCompletion',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.checkProfileCompletion();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Profile check failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.tokens = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.tokens = { accessToken: null, refreshToken: null };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        console.log('initializeAuth.pending: Setting isLoading to true');
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        console.log('initializeAuth.fulfilled: Setting isLoading to false, isAuthenticated to:', action.payload.isAuthenticated);
        state.isLoading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        if (!action.payload.isAuthenticated) {
          state.tokens = { accessToken: null, refreshToken: null };
          // Clear any existing tokens from localStorage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        console.log('initializeAuth.rejected: Setting isLoading to false, isAuthenticated to false');
        state.isLoading = false;
        state.isAuthenticated = false;
        state.tokens = { accessToken: null, refreshToken: null };
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.isEmailVerified = true;
        }
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.tokens = { accessToken: null, refreshToken: null };
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Check Profile Completion
      .addCase(checkProfileCompletion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkProfileCompletion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(checkProfileCompletion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setTokens, clearAuth } = authSlice.actions;
export default authSlice.reducer;
