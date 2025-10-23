// Mock for React Native
const React = require('react');

const mockComponent = (name) => {
  const Component = (props) => {
    return React.createElement(name, props, props.children);
  };
  Component.displayName = name;
  return Component;
};

module.exports = {
  // Core components
  View: mockComponent('View'),
  Text: mockComponent('Text'),
  ScrollView: mockComponent('ScrollView'),
  TouchableOpacity: mockComponent('TouchableOpacity'),
  TouchableHighlight: mockComponent('TouchableHighlight'),
  TextInput: mockComponent('TextInput'),
  Image: mockComponent('Image'),
  FlatList: mockComponent('FlatList'),
  SectionList: mockComponent('SectionList'),
  Modal: mockComponent('Modal'),
  ActivityIndicator: mockComponent('ActivityIndicator'),
  Switch: mockComponent('Switch'),
  Slider: mockComponent('Slider'),
  Picker: mockComponent('Picker'),
  SafeAreaView: mockComponent('SafeAreaView'),
  KeyboardAvoidingView: mockComponent('KeyboardAvoidingView'),
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
  StatusBar: mockComponent('StatusBar'),
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
  },
  Animated: {
    View: mockComponent('Animated.View'),
    Text: mockComponent('Animated.Text'),
    ScrollView: mockComponent('Animated.ScrollView'),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      interpolate: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(),
    })),
    sequence: jest.fn(),
    parallel: jest.fn(),
    stagger: jest.fn(),
    loop: jest.fn(),
    event: jest.fn(),
    createAnimatedComponent: jest.fn((component) => component),
  },
  PanResponder: {
    create: jest.fn(() => ({
      panHandlers: {},
    })),
  },
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
    quad: jest.fn(),
    cubic: jest.fn(),
    poly: jest.fn(),
    sin: jest.fn(),
    circle: jest.fn(),
    exp: jest.fn(),
    elastic: jest.fn(),
    back: jest.fn(),
    bounce: jest.fn(),
    bezier: jest.fn(),
    in: jest.fn(),
    out: jest.fn(),
    inOut: jest.fn(),
  },
  I18nManager: {
    isRTL: false,
    allowRTL: jest.fn(),
    forceRTL: jest.fn(),
    swapLeftAndRightInRTL: jest.fn(),
  },
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
    roundToNearestPixel: jest.fn((size) => Math.round(size)),
  },
  DeviceInfo: {
    getModel: jest.fn(() => 'iPhone'),
    getVersion: jest.fn(() => '1.0.0'),
    getBuildNumber: jest.fn(() => '1'),
    getBundleId: jest.fn(() => 'com.malpay.app'),
  },
  // Add more mocks as needed
};
