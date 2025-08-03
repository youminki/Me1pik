import { useCallback } from 'react';

import { useAuth } from './useAuth';

import { hasValidToken } from '@/utils/auth';

interface UseRequireAuthReturn {
  requireAuth: (callback: () => void, message?: string) => void;
  isAuthenticated: boolean;
}

export const useRequireAuth = (): UseRequireAuthReturn => {
  const { showLoginModal } = useAuth();
  const isAuthenticated = hasValidToken();

  const requireAuth = useCallback(
    (callback: () => void, message?: string) => {
      if (isAuthenticated) {
        // 인증된 사용자라면 콜백 실행
        callback();
      } else {
        // 인증되지 않은 사용자라면 로그인 모달 표시
        showLoginModal(message);
      }
    },
    [isAuthenticated, showLoginModal]
  );

  return {
    requireAuth,
    isAuthenticated,
  };
};
