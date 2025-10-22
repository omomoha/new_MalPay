import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@store';

// Typed hooks for Redux
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector(selector);

// Custom hooks for common functionality
export const useAuth = () => {
  const auth = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  
  return {
    ...auth,
    dispatch,
  };
};

export const useWallet = () => {
  const wallet = useAppSelector(state => state.wallet);
  const dispatch = useAppDispatch();
  
  return {
    ...wallet,
    dispatch,
  };
};

export const useTransactions = () => {
  const transactions = useAppSelector(state => state.transactions);
  const dispatch = useAppDispatch();
  
  return {
    ...transactions,
    dispatch,
  };
};

export const useNotifications = () => {
  const notifications = useAppSelector(state => state.notifications);
  const dispatch = useAppDispatch();
  
  return {
    ...notifications,
    dispatch,
  };
};

export const useUI = () => {
  const ui = useAppSelector(state => state.ui);
  const dispatch = useAppDispatch();
  
  return {
    ...ui,
    dispatch,
  };
};
