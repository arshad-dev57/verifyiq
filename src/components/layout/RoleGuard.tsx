import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If candidate tries to visit instructor page, send to /candidate
    if (user.role === 'candidate') {
      return <Navigate to="/candidate" replace />;
    }
    // If instructor tries to visit candidate-only exam, send to /ask
    return <Navigate to="/ask" replace />;
  }

  return <>{children}</>;
};
