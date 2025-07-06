import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { FiLoader } from 'react-icons/fi';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  requireAdmin = false,
  redirectTo = '/login'
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang kiểm tra...</p>
        </div>
      </div>
    );
  }

  // Check if authentication is required but user is not logged in
  if (requireAuth && !user) {
    // Store the current URL to redirect back after login
    if (typeof window !== 'undefined') {
      localStorage.setItem('redirectAfterLogin', router.asPath);
    }
    router.push(redirectTo);
    return null;
  }

  // Check if admin role is required but user is not admin
  if (requireAdmin && (!user || user.role !== 'admin')) {
    router.push('/');
    return null;
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute; 