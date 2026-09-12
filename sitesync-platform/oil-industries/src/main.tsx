import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      theme="dark"
      toastOptions={{
        style: {
          background: '#171A1D',
          border: '1px solid #2F353A',
          color: '#fff',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '12px',
        },
      }}
    />
  </React.StrictMode>
);
