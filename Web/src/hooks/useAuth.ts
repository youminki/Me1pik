import { useCallback, useState } from 'react';

import { hasValidToken } from '@/utils/auth';

interface UseAuthReturn {
  isAuthenticated: boolean;
  showLoginModal: (message?: string) => void;
  hideLoginModal: () => void;
  isLoginModalOpen: boolean;
  loginModalMessage: string;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState('로그인이 필요한 서비스입니다.');

  const isAuthenticated = hasValidToken();

  const showLoginModal = useCallback((message?: string) => {
    if (message) {
      setLoginModalMessage(message);
    }
    setIsLoginModalOpen(true);
  }, []);

  const hideLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  return {
    isAuthenticated,
    showLoginModal,
    hideLoginModal,
    isLoginModalOpen,
    loginModalMessage,
  };
}; 