import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { API_BASE_URL } from '@config/api.config';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
  UserProfile,
  UpdateUserRequest,
  WalletBalance,
  TransactionFilters,
  Transaction,
  TransferRequest,
  TransferResponse,
  Card,
  AddCardRequest,
  BankAccount,
  AddBankAccountRequest,
  VerifyBankAccountRequest,
  WithdrawalRequest,
  WithdrawalResponse,
  KYCStatus,
  KYCDocumentRequest,
  KYCResponse,
  Notification,
  NotificationFilters,
  AdminStats,
  AdminTransactionFilters,
} from '@types/api.types';

// Enhanced base query with error handling
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('content-type', 'application/json');
    headers.set('accept', 'application/json');
    return headers;
  },
});

// Enhanced base query with retry logic and error handling
const baseQueryWithRetry = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 errors (unauthorized)
  if (result.error && result.error.status === 401) {
    // Try to refresh token
    const refreshResult = await baseQuery('/auth/refresh', api, extraOptions);
    if (refreshResult.data) {
      // Retry the original query with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, redirect to login
      api.dispatch({ type: 'auth/logout' });
    }
  }
  
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  tagTypes: [
    'User',
    'Wallet',
    'Transaction',
    'Card',
    'BankAccount',
    'Notification',
    'KYC',
    'Admin',
  ],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    refreshToken: builder.mutation<RefreshResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),
    
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Wallet', 'Transaction', 'Card'],
    }),
    
    // User endpoints
    getUserProfile: builder.query<UserProfile, void>({
      query: () => '/user/profile',
      providesTags: ['User'],
    }),
    
    updateUserProfile: builder.mutation<UserProfile, UpdateUserRequest>({
      query: (userData) => ({
        url: '/user/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Wallet endpoints
    getWalletBalance: builder.query<WalletBalance, void>({
      query: () => '/wallet/balance',
      providesTags: ['Wallet'],
    }),
    
    getWalletTransactions: builder.query<Transaction[], TransactionFilters>({
      query: (filters) => ({
        url: '/wallet/transactions',
        params: filters,
      }),
      providesTags: ['Transaction'],
    }),
    
    // Payment endpoints
    transfer: builder.mutation<TransferResponse, TransferRequest>({
      query: (transferData) => ({
        url: '/payments/transfer',
        method: 'POST',
        body: transferData,
      }),
      invalidatesTags: ['Wallet', 'Transaction'],
    }),
    
    getTransactions: builder.query<Transaction[], TransactionFilters>({
      query: (filters) => ({
        url: '/payments/transactions',
        params: filters,
      }),
      providesTags: ['Transaction'],
    }),
    
    getTransaction: builder.query<Transaction, string>({
      query: (id) => `/payments/transactions/${id}`,
      providesTags: ['Transaction'],
    }),
    
    // Card endpoints
    getCards: builder.query<Card[], void>({
      query: () => '/cards',
      providesTags: ['Card'],
    }),
    
    addCard: builder.mutation<Card, AddCardRequest>({
      query: (cardData) => ({
        url: '/cards',
        method: 'POST',
        body: cardData,
      }),
      invalidatesTags: ['Card'],
    }),
    
    removeCard: builder.mutation<void, string>({
      query: (cardId) => ({
        url: `/cards/${cardId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Card'],
    }),
    
    // Bank account endpoints
    getBankAccounts: builder.query<BankAccount[], void>({
      query: () => '/bank-accounts',
      providesTags: ['BankAccount'],
    }),
    
    addBankAccount: builder.mutation<BankAccount, AddBankAccountRequest>({
      query: (bankData) => ({
        url: '/bank-accounts',
        method: 'POST',
        body: bankData,
      }),
      invalidatesTags: ['BankAccount'],
    }),
    
    verifyBankAccount: builder.mutation<BankAccount, VerifyBankAccountRequest>({
      query: ({ accountId, ...verificationData }) => ({
        url: `/bank-accounts/${accountId}/verify`,
        method: 'POST',
        body: verificationData,
      }),
      invalidatesTags: ['BankAccount'],
    }),
    
    // Withdrawal endpoints
    withdraw: builder.mutation<WithdrawalResponse, WithdrawalRequest>({
      query: (withdrawalData) => ({
        url: '/payments/withdraw',
        method: 'POST',
        body: withdrawalData,
      }),
      invalidatesTags: ['Wallet', 'Transaction'],
    }),
    
    // KYC endpoints
    getKYCStatus: builder.query<KYCStatus, void>({
      query: () => '/kyc/status',
      providesTags: ['KYC'],
    }),
    
    submitKYCDocument: builder.mutation<KYCResponse, KYCDocumentRequest>({
      query: (documentData) => ({
        url: '/kyc/documents',
        method: 'POST',
        body: documentData,
      }),
      invalidatesTags: ['KYC'],
    }),
    
    // Notification endpoints
    getNotifications: builder.query<Notification[], NotificationFilters>({
      query: (filters) => ({
        url: '/notifications',
        params: filters,
      }),
      providesTags: ['Notification'],
    }),
    
    markNotificationRead: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    
    // Admin endpoints (for admin users)
    getAdminStats: builder.query<AdminStats, void>({
      query: () => '/admin/stats',
      providesTags: ['Admin'],
    }),
    
    getAdminTransactions: builder.query<Transaction[], AdminTransactionFilters>({
      query: (filters) => ({
        url: '/admin/transactions',
        params: filters,
      }),
      providesTags: ['Admin', 'Transaction'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Authentication hooks
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  
  // User hooks
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  
  // Wallet hooks
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  
  // Payment hooks
  useTransferMutation,
  useGetTransactionsQuery,
  useGetTransactionQuery,
  
  // Card hooks
  useGetCardsQuery,
  useAddCardMutation,
  useRemoveCardMutation,
  
  // Bank account hooks
  useGetBankAccountsQuery,
  useAddBankAccountMutation,
  useVerifyBankAccountMutation,
  
  // Withdrawal hooks
  useWithdrawMutation,
  
  // KYC hooks
  useGetKYCStatusQuery,
  useSubmitKYCDocumentMutation,
  
  // Notification hooks
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  
  // Admin hooks
  useGetAdminStatsQuery,
  useGetAdminTransactionsQuery,
  
  // Utility hooks
  usePrefetch,
} = api;
