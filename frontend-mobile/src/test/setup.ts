import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';
import './customMatchers';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  getInternetCredentials: jest.fn(),
  setInternetCredentials: jest.fn(),
  resetInternetCredentials: jest.fn(),
}));

// Mock react-native-biometrics
jest.mock('react-native-biometrics', () => ({
  isSensorAvailable: jest.fn(() => Promise.resolve({ available: true, biometryType: 'TouchID' })),
  createSignature: jest.fn(() => Promise.resolve({ success: true })),
  simplePrompt: jest.fn(() => Promise.resolve({ success: true })),
}));

// Mock react-native-encrypted-storage
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-push-notification
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  localNotification: jest.fn(),
  requestPermissions: jest.fn(() => Promise.resolve({ alert: true, badge: true, sound: true })),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock axios
jest.mock('axios');
const mockedAxios = require('axios');
mockedAxios.create = jest.fn(() => mockedAxios);
mockedAxios.get = jest.fn(() => Promise.resolve({ data: {} }));
mockedAxios.post = jest.fn(() => Promise.resolve({ data: {} }));
mockedAxios.put = jest.fn(() => Promise.resolve({ data: {} }));
mockedAxios.delete = jest.fn(() => Promise.resolve({ data: {} }));

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  return {
    ...actual,
    Portal: ({ children }: any) => children,
  };
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  FontAwesome: 'FontAwesome',
  FontAwesome5: 'FontAwesome5',
  AntDesign: 'AntDesign',
  Entypo: 'Entypo',
  Feather: 'Feather',
  SimpleLineIcons: 'SimpleLineIcons',
  Octicons: 'Octicons',
  Zocial: 'Zocial',
}));

// Mock react-navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      replace: jest.fn(),
      push: jest.fn(),
      pop: jest.fn(),
      popToTop: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: jest.fn(),
  };
});

// Mock react-redux
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => jest.fn()),
}));

// Mock react-native-chart-kit
jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
  BarChart: 'BarChart',
  PieChart: 'PieChart',
}));

// Mock react-native-camera
jest.mock('react-native-camera', () => ({
  RNCamera: {
    Constants: {
      FlashMode: {
        off: 'off',
        on: 'on',
        auto: 'auto',
      },
    },
  },
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock React Native
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    StatusBar: {
      setBarStyle: jest.fn(),
      setBackgroundColor: jest.fn(),
    },
  };
});

// These are now handled in the main React Native mock above

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock Permissions
jest.mock('react-native-permissions', () => ({
  request: jest.fn(() => Promise.resolve('granted')),
  check: jest.fn(() => Promise.resolve('granted')),
  PERMISSIONS: {
    CAMERA: 'camera',
    WRITE_EXTERNAL_STORAGE: 'write_external_storage',
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
}));

// Setup global test environment
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })
);

// Mock timers
jest.useFakeTimers();

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
    role: 'user',
    isVerified: true,
    isActive: true,
    twoFactorEnabled: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  }),
  
  createMockWallet: () => ({
    id: 'test-wallet-id',
    userId: 'test-user-id',
    walletAddress: 'test-wallet-address',
    blockchainType: 'tron',
    balance: 1000.00,
    currency: 'NGN',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  }),
  
  createMockTransaction: () => ({
    id: 'test-transaction-id',
    type: 'transfer',
    status: 'completed',
    amount: 100.00,
    currency: 'NGN',
    fee: 2.50,
    description: 'Test transaction',
    createdAt: '2025-01-01T00:00:00Z',
    completedAt: '2025-01-01T00:01:00Z',
  }),
};
