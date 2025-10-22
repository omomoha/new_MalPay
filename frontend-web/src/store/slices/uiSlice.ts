import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: {
    global: boolean;
    page: boolean;
  };
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
  modals: {
    addCard: boolean;
    addBankAccount: boolean;
    sendMoney: boolean;
    withdraw: boolean;
    qrCode: boolean;
  };
  mobileMenuOpen: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  loading: {
    global: false,
    page: false,
  },
  notifications: [],
  modals: {
    addCard: false,
    addBankAccount: false,
    sendMoney: false,
    withdraw: false,
    qrCode: false,
  },
  mobileMenuOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.page = action.payload;
    },
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      duration?: number;
    }>) => {
      const notification = {
        id: Date.now().toString(),
        ...action.payload,
        duration: action.payload.duration || 5000,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleTheme,
  setTheme,
  setGlobalLoading,
  setPageLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  toggleMobileMenu,
  setMobileMenuOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
