import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Absolute minimal React mounting
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error: Root element not found</h1></div>';
} else {
  console.log('Root element found, mounting React app...');
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
  console.log('React app rendered successfully');
}
