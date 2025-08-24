import { useCallback, useEffect, useState, useRef } from 'react';

import {
  getCurrentToken,
  hasValidToken,
  refreshToken,
  setupTokenRefreshTimer,
} from '@/utils/auth';

interface TokenState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  lastRefresh: Date | null;
}

/**
 * 🎯 토큰 관리를 위한 커스텀 훅
 * 자동 로그인 상태와 토큰 갱신을 효율적으로 관리
 */
export const useTokenManager = () => {
  const [tokenState, setTokenState] = useState<TokenState>({
    isAuthenticated: false,
    isLoading: true,
    token: null,
    lastRefresh: null,
  });

  // 🎯 useRef를 사용하여 interval ID를 안전하게 관리
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🎯 토큰 상태 확인 및 업데이트
  const checkTokenStatus = useCallback(async (): Promise<void> => {
    try {
      const token = getCurrentToken();
      const isValid = token && hasValidToken();

      setTokenState((prev) => ({
        ...prev,
        isAuthenticated: Boolean(isValid), // 🎯 boolean으로 명시적 변환
        token,
        isLoading: false,
      }));

      // 유효한 토큰이 있으면 갱신 타이머 설정
      if (isValid && token) {
        setupTokenRefreshTimer(token);
      }
    } catch (error) {
      console.error('토큰 상태 확인 실패:', error);
      setTokenState((prev) => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
      }));
    }
  }, []);

  // 🎯 토큰 갱신
  const refreshTokenManually = useCallback(async (): Promise<boolean> => {
    try {
      setTokenState((prev) => ({ ...prev, isLoading: true }));

      const success = await refreshToken();

      if (success) {
        const newToken = getCurrentToken();
        setTokenState((prev) => ({
          ...prev,
          isAuthenticated: true,
          token: newToken,
          lastRefresh: new Date(),
          isLoading: false,
        }));

        // 새 토큰으로 갱신 타이머 설정
        if (newToken) {
          setupTokenRefreshTimer(newToken);
        }

        return true;
      } else {
        setTokenState((prev) => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
        }));
        return false;
      }
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      setTokenState((prev) => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
      }));
      return false;
    }
  }, []);

  // 🎯 자동 토큰 갱신 체크 (useRef로 안전하게 관리)
  const startAutoRefresh = useCallback(() => {
    // 기존 interval 정리
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    const interval = setInterval(async () => {
      try {
        const token = getCurrentToken();
        if (!token) {
          console.log('ℹ️ 토큰이 없음 - 자동 갱신 체크 건너뛰기');
          return;
        }

        if (!hasValidToken()) {
          console.log('🔄 토큰 만료 감지 - 자동 갱신 시도');
          const success = await refreshToken();
          if (success) {
            console.log('✅ 자동 토큰 갱신 성공');
            const newToken = getCurrentToken();
            setTokenState((prev) => ({
              ...prev,
              token: newToken,
              lastRefresh: new Date(),
            }));
          } else {
            console.log('❌ 자동 토큰 갱신 실패');
            setTokenState((prev) => ({
              ...prev,
              isAuthenticated: false,
            }));
          }
        }
      } catch (error) {
        console.error('자동 토큰 갱신 체크 실패:', error);
      }
    }, 30_000); // 30초마다 체크

    refreshIntervalRef.current = interval;
  }, []); // 의존성 배열 비움 - interval ID는 ref로 관리

  // 🎯 자동 갱신 중지
  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []); // 의존성 배열 비움

  // 🎯 초기화
  useEffect(() => {
    checkTokenStatus();
  }, [checkTokenStatus]);

  // 🎯 자동 갱신 시작/중지 (의존성 최소화)
  useEffect(() => {
    if (tokenState.isAuthenticated) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    // cleanup 함수
    return () => {
      stopAutoRefresh();
    };
  }, [tokenState.isAuthenticated, startAutoRefresh, stopAutoRefresh]);

  // 🎯 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, [stopAutoRefresh]);

  return {
    ...tokenState,
    checkTokenStatus,
    refreshTokenManually,
    startAutoRefresh,
    stopAutoRefresh,
  };
};

/**
 * 🎯 자동 로그인 상태를 위한 간단한 훅
 */
export const useAutoLogin = () => {
  const [isAutoLoginEnabled, setIsAutoLoginEnabled] = useState(false);
  const [isAutoLoginInProgress, setIsAutoLoginInProgress] = useState(false);

  useEffect(() => {
    const autoLogin = localStorage.getItem('autoLogin') === 'true';
    const persistentLogin = localStorage.getItem('persistentLogin') === 'true';

    setIsAutoLoginEnabled(autoLogin || persistentLogin);
  }, []);

  useEffect(() => {
    const checkAutoLoginProgress = () => {
      const inProgress = localStorage.getItem('autoLoginInProgress') === 'true';
      setIsAutoLoginInProgress(inProgress);
    };

    // 초기 체크
    checkAutoLoginProgress();

    // 스토리지 변경 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'autoLoginInProgress') {
        checkAutoLoginProgress();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    isAutoLoginEnabled,
    isAutoLoginInProgress,
  };
};
