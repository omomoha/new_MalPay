import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoadingState {
  global: boolean;
  auth: boolean;
  wallet: boolean;
  transactions: boolean;
}

interface ModalState {
  payment: boolean;
  cardLink: boolean;
  twoFactor: boolean;
  kyc: boolean;
  bankAccount: boolean;
}

interface SnackbarState {
  visible: boolean;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  loading: LoadingState;
  modals: ModalState;
  snackbar: SnackbarState;
}

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: false,
  loading: {
    global: false,
    auth: false,
    wallet: false,
    transactions: false,
  },
  modals: {
    payment: false,
    cardLink: false,
    twoFactor: false,
    kyc: false,
    bankAccount: false,
  },
  snackbar: {
    visible: false,
    message: '',
    type: 'info',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    openSidebar: (state) => {
      state.sidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.sidebarOpen = false;
    },
    openModal: (state, action: PayloadAction<keyof ModalState>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof ModalState>) => {
      state.modals[action.payload] = false;
    },
    showSnackbar: (state, action: PayloadAction<{ message: string; type?: SnackbarState['type'] }>) => {
      state.snackbar = {
        visible: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.visible = false;
      state.snackbar.message = '';
    },
    setLoading: (state, action: PayloadAction<{ key: keyof LoadingState; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
  },
});

export const {
  toggleTheme,
  openSidebar,
  closeSidebar,
  openModal,
  closeModal,
  showSnackbar,
  hideSnackbar,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;