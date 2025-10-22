import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cardsReducer from './slices/cardsSlice';
import transactionsReducer from './slices/transactionsSlice';
import bankAccountsReducer from './slices/bankAccountsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cards: cardsReducer,
    transactions: transactionsReducer,
    bankAccounts: bankAccountsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
