// Mock for expo-linear-gradient
const React = require('react');

const mockComponent = (name) => {
  const Component = (props) => {
    return React.createElement(name, props, props.children);
  };
  Component.displayName = name;
  return Component;
};

module.exports = {
  LinearGradient: mockComponent('LinearGradient'),
};
