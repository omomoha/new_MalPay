import uiReducer, {
  toggleTheme,
  openSidebar,
  closeSidebar,
  openModal,
  closeModal,
  showSnackbar,
  hideSnackbar,
} from '../uiSlice';

describe('UI Slice', () => {
const initialState = {
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

  test('should return initial state', () => {
    expect(uiReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('should handle toggleTheme', () => {
    const newState = uiReducer(initialState, toggleTheme());
    expect(newState.theme).toBe('dark');

    const newState2 = uiReducer(newState, toggleTheme());
    expect(newState2.theme).toBe('light');
  });

  test('should handle openSidebar', () => {
    const newState = uiReducer(initialState, openSidebar());
    expect(newState.sidebarOpen).toBe(true);
  });

  test('should handle closeSidebar', () => {
    const stateWithOpenSidebar = {
      ...initialState,
      sidebarOpen: true,
    };

    const newState = uiReducer(stateWithOpenSidebar, closeSidebar());
    expect(newState.sidebarOpen).toBe(false);
  });

  test('should handle openModal', () => {
    const newState = uiReducer(initialState, openModal('payment'));
    expect(newState.modals.payment).toBe(true);
    expect(newState.modals.cardLink).toBe(false); // Should not affect other modals
    expect(newState.modals.twoFactor).toBe(false);
  });

  test('should handle closeModal', () => {
    const stateWithOpenModal = {
      ...initialState,
      modals: {
        payment: true,
        cardLink: false,
        twoFactor: false,
      },
    };

    const newState = uiReducer(stateWithOpenModal, closeModal('payment'));
    expect(newState.modals.payment).toBe(false);
  });

  test('should handle showSnackbar with default type', () => {
    const snackbarData = {
      message: 'Test message',
    };

    const newState = uiReducer(initialState, showSnackbar(snackbarData));
    expect(newState.snackbar.visible).toBe(true);
    expect(newState.snackbar.message).toBe('Test message');
    expect(newState.snackbar.type).toBe('info'); // Default type
  });

  test('should handle showSnackbar with custom type', () => {
    const snackbarData = {
      message: 'Error message',
      type: 'error' as const,
    };

    const newState = uiReducer(initialState, showSnackbar(snackbarData));
    expect(newState.snackbar.visible).toBe(true);
    expect(newState.snackbar.message).toBe('Error message');
    expect(newState.snackbar.type).toBe('error');
  });

  test('should handle hideSnackbar', () => {
    const stateWithSnackbar = {
      ...initialState,
      snackbar: {
        visible: true,
        message: 'Test message',
        type: 'success',
      },
    };

    const newState = uiReducer(stateWithSnackbar, hideSnackbar());
    expect(newState.snackbar.visible).toBe(false);
    expect(newState.snackbar.message).toBe('');
  });

  test('should handle multiple actions', () => {
    let state = uiReducer(initialState, toggleTheme());
    expect(state.theme).toBe('dark');

    state = uiReducer(state, openSidebar());
    expect(state.sidebarOpen).toBe(true);

    state = uiReducer(state, openModal('payment'));
    expect(state.modals.payment).toBe(true);

    state = uiReducer(state, showSnackbar({ message: 'Test', type: 'success' }));
    expect(state.snackbar.visible).toBe(true);
    expect(state.snackbar.type).toBe('success');

    state = uiReducer(state, closeSidebar());
    expect(state.sidebarOpen).toBe(false);

    state = uiReducer(state, closeModal('payment'));
    expect(state.modals.payment).toBe(false);

    state = uiReducer(state, hideSnackbar());
    expect(state.snackbar.visible).toBe(false);
  });

  test('should handle openModal with different modal types', () => {
    let state = uiReducer(initialState, openModal('cardLink'));
    expect(state.modals.cardLink).toBe(true);

    state = uiReducer(state, openModal('twoFactor'));
    expect(state.modals.twoFactor).toBe(true);
    expect(state.modals.cardLink).toBe(true); // Should preserve previous state
  });

  test('should handle closeModal with different modal types', () => {
    const stateWithMultipleModals = {
      ...initialState,
      modals: {
        payment: true,
        cardLink: true,
        twoFactor: false,
      },
    };

    let state = uiReducer(stateWithMultipleModals, closeModal('payment'));
    expect(state.modals.payment).toBe(false);
    expect(state.modals.cardLink).toBe(true); // Should preserve other modals

    state = uiReducer(state, closeModal('cardLink'));
    expect(state.modals.cardLink).toBe(false);
    expect(state.modals.twoFactor).toBe(false); // Should remain unchanged
  });

  test('should handle showSnackbar with all types', () => {
    const types = ['success', 'error', 'info', 'warning'] as const;

    types.forEach(type => {
      const snackbarData = {
        message: `${type} message`,
        type,
      };

      const newState = uiReducer(initialState, showSnackbar(snackbarData));
      expect(newState.snackbar.type).toBe(type);
      expect(newState.snackbar.message).toBe(`${type} message`);
    });
  });
});
