import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasValidToken } from '@/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = hasValidToken();

  if (!isAuthenticated) {
    // 로그인 페이지로 리다이렉트하면서 현재 경로를 state로 전달
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
