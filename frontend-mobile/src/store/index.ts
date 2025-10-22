import { configureStore } from '@reduxjs/toolkit';
import { api } from './api/api';
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import walletSlice from './slices/walletSlice';
import transactionSlice from './slices/transactionSlice';
import cardSlice from './slices/cardSlice';
import notificationSlice from './slices/notificationSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authSlice,
    user: userSlice,
    wallet: walletSlice,
    transactions: transactionSlice,
    cards: cardSlice,
    notifications: notificationSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [api.util.resetApiState.type],
      },
    }).concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
