import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { API_BASE_URL } from '@config/api.config';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    'User',
    'Wallet',
    'Transaction',
    'Card',
    'BankAccount',
    'Notification',
    'KYC',
  ],
  endpoints: () => ({}),
});

// Export hooks for usage in functional components
export const {
  usePrefetch,
} = api;
