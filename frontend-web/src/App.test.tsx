import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test component to verify testing setup works
const TestComponent: React.FC = () => {
  return <div>Test Component</div>;
};

test('renders test component', () => {
  render(<TestComponent />);
  const element = screen.getByText(/test component/i);
  expect(element).toBeInTheDocument();
});
