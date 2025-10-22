import authReducer, {
  setAuthTokens,
  setUser,
  clearAuth,
  setLoading,
  setError,
  setTwoFactorRequired,
} from '../authSlice';
import { User } from '@types/user.types';

describe('Auth Slice', () => {
  const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    twoFactorRequired: false,
    tempToken: null,
  };

  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
    phone: '+2348012345678',
    role: 'user',
    isVerified: true,
    isActive: true,
    twoFactorEnabled: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  test('should return initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('should handle setAuthTokens', () => {
    const tokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    const newState = authReducer(initialState, setAuthTokens(tokens));
    expect(newState.accessToken).toBe('access-token');
    expect(newState.refreshToken).toBe('refresh-token');
    expect(newState.isAuthenticated).toBe(true);
  });

  test('should handle setUser', () => {
    const newState = authReducer(initialState, setUser(mockUser));
    expect(newState.user).toEqual(mockUser);
  });

  test('should handle clearAuth', () => {
    const stateWithAuth = {
      ...initialState,
      user: mockUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      isAuthenticated: true,
      twoFactorRequired: true,
      tempToken: 'temp-token',
    };

    const newState = authReducer(stateWithAuth, clearAuth());
    expect(newState).toEqual(initialState);
  });

  test('should handle setLoading', () => {
    const newState = authReducer(initialState, setLoading(true));
    expect(newState.isLoading).toBe(true);

    const newState2 = authReducer(newState, setLoading(false));
    expect(newState2.isLoading).toBe(false);
  });

  test('should handle setError', () => {
    const errorMessage = 'Authentication failed';
    const newState = authReducer(initialState, setError(errorMessage));
    expect(newState.error).toBe(errorMessage);

    const newState2 = authReducer(newState, setError(null));
    expect(newState2.error).toBe(null);
  });

  test('should handle setTwoFactorRequired', () => {
    const twoFactorData = {
      required: true,
      tempToken: 'temp-token',
    };

    const newState = authReducer(initialState, setTwoFactorRequired(twoFactorData));
    expect(newState.twoFactorRequired).toBe(true);
    expect(newState.tempToken).toBe('temp-token');

    const newState2 = authReducer(newState, setTwoFactorRequired({ required: false, tempToken: null }));
    expect(newState2.twoFactorRequired).toBe(false);
    expect(newState2.tempToken).toBe(null);
  });

  test('should handle multiple actions', () => {
    let state = authReducer(initialState, setLoading(true));
    expect(state.isLoading).toBe(true);

    state = authReducer(state, setUser(mockUser));
    expect(state.user).toEqual(mockUser);

    state = authReducer(state, setAuthTokens({ accessToken: 'token', refreshToken: 'refresh' }));
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('token');

    state = authReducer(state, setLoading(false));
    expect(state.isLoading).toBe(false);
  });
});
