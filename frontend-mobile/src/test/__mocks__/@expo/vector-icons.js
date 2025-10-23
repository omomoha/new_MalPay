// Mock for @expo/vector-icons
const React = require('react');

const mockComponent = (name) => {
  const Component = (props) => {
    return React.createElement(name, props, props.children);
  };
  Component.displayName = name;
  return Component;
};

module.exports = {
  Ionicons: mockComponent('Ionicons'),
  MaterialIcons: mockComponent('MaterialIcons'),
  MaterialCommunityIcons: mockComponent('MaterialCommunityIcons'),
  FontAwesome: mockComponent('FontAwesome'),
  FontAwesome5: mockComponent('FontAwesome5'),
  AntDesign: mockComponent('AntDesign'),
  Entypo: mockComponent('Entypo'),
  Feather: mockComponent('Feather'),
  SimpleLineIcons: mockComponent('SimpleLineIcons'),
  Octicons: mockComponent('Octicons'),
  Zocial: mockComponent('Zocial'),
};
