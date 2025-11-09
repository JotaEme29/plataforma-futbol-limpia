// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 1. Importa el AuthProvider que creamos
import { AuthProvider } from './context/AuthContext.jsx'; 
import { ThemeProvider } from './context/ThemeContext.jsx'; // Importa el ThemeProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envuelve toda la aplicación <App /> con el AuthProvider */}
    <AuthProvider>
      {/* 3. Envuelve la App con el ThemeProvider DENTRO del AuthProvider */}
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
);
