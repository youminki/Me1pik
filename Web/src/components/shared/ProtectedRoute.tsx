import React from 'react';

import LoginModal from './LoginModal';

import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  message?: string;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  message = '로그인이 필요한 서비스입니다.',
  fallback = null,
}) => {
  const {
    isAuthenticated,
    showLoginModal,
    hideLoginModal,
    isLoginModalOpen,
    loginModalMessage,
  } = useAuth();

  // 인증되지 않은 사용자라면 로그인 모달 표시
  React.useEffect(() => {
    if (!isAuthenticated) {
      showLoginModal(message);
    }
  }, [isAuthenticated, showLoginModal, message]);

  // 인증된 사용자라면 자식 컴포넌트 렌더링
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // 인증되지 않은 사용자라면 fallback과 모달 표시
  return (
    <>
      {fallback}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={hideLoginModal}
        message={loginModalMessage}
      />
    </>
  );
};

export default ProtectedRoute;
