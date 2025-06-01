import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './index.css'; // Esta linha deve existir

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Remova a linha que importa reportWebVitals se não estiver usando