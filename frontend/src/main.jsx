import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Start MSW in test mode
if (import.meta.env.MODE === 'test') {
  import('./mocks/browser').then(({ worker }) => worker.start());
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
