// Loading State Management Service for MalPay Mobile

import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export interface LoadingStates {
  [key: string]: LoadingState;
}

export const useLoadingStates = (initialStates: string[] = []) => {
  const [loadingStates, setLoadingStates] = useState<LoadingStates>(() => {
    const states: LoadingStates = {};
    initialStates.forEach(key => {
      states[key] = {
        isLoading: false,
        error: null,
        success: false,
      };
    });
    return states;
  });

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading,
        error: isLoading ? null : prev[key]?.error,
        success: isLoading ? false : prev[key]?.success,
      },
    }));
  }, []);

  const setError = useCallback((key: string, error: string | null) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: false,
        error,
        success: false,
      },
    }));
  }, []);

  const setSuccess = useCallback((key: string, success: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: false,
        error: null,
        success,
      },
    }));
  }, []);

  const resetState = useCallback((key: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        isLoading: false,
        error: null,
        success: false,
      },
    }));
  }, []);

  const resetAllStates = useCallback(() => {
    setLoadingStates(prev => {
      const newStates: LoadingStates = {};
      Object.keys(prev).forEach(key => {
        newStates[key] = {
          isLoading: false,
          error: null,
          success: false,
        };
      });
      return newStates;
    });
  }, []);

  const getLoadingState = useCallback((key: string): LoadingState => {
    return loadingStates[key] || {
      isLoading: false,
      error: null,
      success: false,
    };
  }, [loadingStates]);

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(loadingStates).some(state => state.isLoading);
  }, [loadingStates]);

  const hasAnyError = useCallback((): boolean => {
    return Object.values(loadingStates).some(state => state.error !== null);
  }, [loadingStates]);

  const hasAnySuccess = useCallback((): boolean => {
    return Object.values(loadingStates).some(state => state.success);
  }, [loadingStates]);

  return {
    loadingStates,
    setLoading,
    setError,
    setSuccess,
    resetState,
    resetAllStates,
    getLoadingState,
    isAnyLoading,
    hasAnyError,
    hasAnySuccess,
  };
};

// Hook for single loading state
export const useLoadingState = (initialState: LoadingState = {
  isLoading: false,
  error: null,
  success: false,
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>(initialState);

  const setLoading = useCallback((isLoading: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading,
      error: isLoading ? null : prev.error,
      success: isLoading ? false : prev.success,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      error,
      success: false,
    }));
  }, []);

  const setSuccess = useCallback((success: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      error: null,
      success,
    }));
  }, []);

  const reset = useCallback(() => {
    setLoadingState({
      isLoading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    loadingState,
    setLoading,
    setError,
    setSuccess,
    reset,
  };
};

// Loading state constants
export const LOADING_STATES = {
  AUTH: 'auth',
  LOGIN: 'login',
  REGISTER: 'register',
  LOGOUT: 'logout',
  USER_PROFILE: 'userProfile',
  UPDATE_PROFILE: 'updateProfile',
  WALLET_BALANCE: 'walletBalance',
  WALLET_TRANSACTIONS: 'walletTransactions',
  TRANSFER: 'transfer',
  TRANSACTIONS: 'transactions',
  CARDS: 'cards',
  ADD_CARD: 'addCard',
  REMOVE_CARD: 'removeCard',
  BANK_ACCOUNTS: 'bankAccounts',
  ADD_BANK_ACCOUNT: 'addBankAccount',
  VERIFY_BANK_ACCOUNT: 'verifyBankAccount',
  WITHDRAW: 'withdraw',
  KYC_STATUS: 'kycStatus',
  SUBMIT_KYC: 'submitKyc',
  NOTIFICATIONS: 'notifications',
  MARK_NOTIFICATION_READ: 'markNotificationRead',
  ADMIN_STATS: 'adminStats',
  ADMIN_TRANSACTIONS: 'adminTransactions',
} as const;

// Utility functions for common loading patterns
export const createAsyncAction = async <T>(
  asyncFn: () => Promise<T>,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setSuccess: (success: boolean) => void
): Promise<T | null> => {
  try {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    const result = await asyncFn();
    setSuccess(true);
    return result;
  } catch (error: any) {
    setError(error?.message || 'An error occurred');
    return null;
  } finally {
    setLoading(false);
  }
};

// Loading state manager for complex operations
export class LoadingStateManager {
  private states: LoadingStates = {};
  private listeners: Array<(states: LoadingStates) => void> = [];

  setLoading(key: string, isLoading: boolean): void {
    this.states[key] = {
      ...this.states[key],
      isLoading,
      error: isLoading ? null : this.states[key]?.error,
      success: isLoading ? false : this.states[key]?.success,
    };
    this.notifyListeners();
  }

  setError(key: string, error: string | null): void {
    this.states[key] = {
      ...this.states[key],
      isLoading: false,
      error,
      success: false,
    };
    this.notifyListeners();
  }

  setSuccess(key: string, success: boolean): void {
    this.states[key] = {
      ...this.states[key],
      isLoading: false,
      error: null,
      success,
    };
    this.notifyListeners();
  }

  resetState(key: string): void {
    this.states[key] = {
      isLoading: false,
      error: null,
      success: false,
    };
    this.notifyListeners();
  }

  getState(key: string): LoadingState {
    return this.states[key] || {
      isLoading: false,
      error: null,
      success: false,
    };
  }

  getAllStates(): LoadingStates {
    return { ...this.states };
  }

  isAnyLoading(): boolean {
    return Object.values(this.states).some(state => state.isLoading);
  }

  hasAnyError(): boolean {
    return Object.values(this.states).some(state => state.error !== null);
  }

  hasAnySuccess(): boolean {
    return Object.values(this.states).some(state => state.success);
  }

  subscribe(listener: (states: LoadingStates) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getAllStates()));
  }
}

// Global loading state manager instance
export const globalLoadingManager = new LoadingStateManager();
