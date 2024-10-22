import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename="/WSADOCS/"> {/* Define o basename conforme o base em vite.config.js */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
