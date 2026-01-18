import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  requireStaff?: boolean;
  children?: React.ReactNode;
}

export const ProtectedRoute = ({ 
  requireAdmin = false, 
  requireStaff = false,
  children 
}: ProtectedRouteProps) => {
  const { user, loading, isAdmin, isStaff } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireStaff && !isStaff) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
