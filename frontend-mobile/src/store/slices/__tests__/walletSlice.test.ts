import walletReducer, {
  setWallets,
  setActiveWallet,
  setWalletBalance,
  setLoading,
  setError,
} from '../walletSlice';
import { Wallet, WalletBalance } from '@types/wallet.types';

describe('Wallet Slice', () => {
  const initialState = {
    wallets: [],
    activeWallet: null,
    balance: null,
    isLoading: false,
    error: null,
  };

  const mockWallet: Wallet = {
    id: 'test-wallet-id',
    userId: 'test-user-id',
    walletAddress: 'test-wallet-address',
    blockchainType: 'tron',
    balance: 1000.00,
    currency: 'NGN',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockBalance: WalletBalance = {
    balance: 1000.00,
    currency: 'NGN',
  };

  test('should return initial state', () => {
    expect(walletReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('should handle setWallets', () => {
    const wallets = [mockWallet];
    const newState = walletReducer(initialState, setWallets(wallets));
    expect(newState.wallets).toEqual(wallets);
    expect(newState.activeWallet).toEqual(mockWallet); // Should set first wallet as active
  });

  test('should handle setWallets with multiple wallets', () => {
    const wallet2: Wallet = {
      ...mockWallet,
      id: 'test-wallet-id-2',
      walletAddress: 'test-wallet-address-2',
    };
    const wallets = [mockWallet, wallet2];
    const newState = walletReducer(initialState, setWallets(wallets));
    expect(newState.wallets).toEqual(wallets);
    expect(newState.activeWallet).toEqual(mockWallet); // Should set first wallet as active
  });

  test('should handle setActiveWallet', () => {
    const stateWithWallets = {
      ...initialState,
      wallets: [mockWallet],
      activeWallet: mockWallet,
    };

    const wallet2: Wallet = {
      ...mockWallet,
      id: 'test-wallet-id-2',
      walletAddress: 'test-wallet-address-2',
    };

    const newState = walletReducer(stateWithWallets, setActiveWallet(wallet2));
    expect(newState.activeWallet).toEqual(wallet2);
  });

  test('should handle setWalletBalance', () => {
    const newState = walletReducer(initialState, setWalletBalance(mockBalance));
    expect(newState.balance).toEqual(mockBalance);
  });

  test('should handle setLoading', () => {
    const newState = walletReducer(initialState, setLoading(true));
    expect(newState.isLoading).toBe(true);

    const newState2 = walletReducer(newState, setLoading(false));
    expect(newState2.isLoading).toBe(false);
  });

  test('should handle setError', () => {
    const errorMessage = 'Wallet error';
    const newState = walletReducer(initialState, setError(errorMessage));
    expect(newState.error).toBe(errorMessage);

    const newState2 = walletReducer(newState, setError(null));
    expect(newState2.error).toBe(null);
  });

  test('should handle multiple actions', () => {
    let state = walletReducer(initialState, setLoading(true));
    expect(state.isLoading).toBe(true);

    state = walletReducer(state, setWallets([mockWallet]));
    expect(state.wallets).toEqual([mockWallet]);
    expect(state.activeWallet).toEqual(mockWallet);

    state = walletReducer(state, setWalletBalance(mockBalance));
    expect(state.balance).toEqual(mockBalance);

    state = walletReducer(state, setLoading(false));
    expect(state.isLoading).toBe(false);
  });
});
