// src/components/ProtectedRoute.jsx - VERSIÓN 2.0 CON SOPORTE PARA VERSIONES

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Si no hay usuario, redirige a la página de inicio, que gestiona el login.
    return <Navigate to="/" replace />;
  }

  // Solo comprobamos autenticación; la autorización por rol se gestiona dentro de las páginas si es necesario
  return children;
}

export default ProtectedRoute;
