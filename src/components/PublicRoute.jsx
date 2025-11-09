// src/components/PublicRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function PublicRoute({ children }) {
  const { currentUser } = useAuth();

  if (currentUser) {
    // Si el usuario ya está autenticado, no tiene sentido que vea las páginas
    // de login o registro. Lo redirigimos a su dashboard.
    return <Navigate to="/dashboard-club" replace />;
  }

  return children;
}

export default PublicRoute;
