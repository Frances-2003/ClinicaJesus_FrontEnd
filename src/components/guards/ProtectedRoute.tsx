import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    // Redirect to appropriate dashboard based on role
    const dashboardPaths: Record<UserRole, string> = {
      PACIENTE: '/paciente/dashboard',
      DOCTOR: '/doctor/dashboard',
      ADMIN: '/admin/dashboard',
    };
    return <Navigate to={dashboardPaths[user.rol]} replace />;
  }

  return <>{children}</>;
}
