import { getCurrentToken, hasValidToken, refreshToken } from './tokenManager';

/**
 * 🎯 네트워크 상태 변경 이벤트 리스너 설정
 */
export const setupNetworkMonitoring = (): void => {
  if (typeof window === 'undefined') return;

  const handleOnline = () => {
    console.log('🌐 네트워크 연결 복구됨');

    // 🎯 네트워크 복구 시 토큰 상태 재확인
    setTimeout(async () => {
      try {
        const currentToken = getCurrentToken();
        if (currentToken && !hasValidToken()) {
          console.log('🔄 네트워크 복구 후 토큰 갱신 시도');
          const success = await refreshToken();
          if (success) {
            console.log('✅ 네트워크 복구 후 토큰 갱신 성공');
          }
        }
      } catch (error) {
        console.error('네트워크 복구 후 토큰 갱신 실패:', error);
      }
    }, 2000); // 2초 후 시도
  };

  const handleOffline = () => {
    console.log('🌐 네트워크 연결 끊어짐');

    // 🎯 오프라인 상태에서는 토큰 갱신 시도 중지
    if (typeof window !== 'undefined' && window.tokenRefreshTimer) {
      clearTimeout(window.tokenRefreshTimer);
      window.tokenRefreshTimer = undefined;
      console.log('⏸️ 오프라인 상태로 인한 토큰 갱신 타이머 중지');
    }
  };

  // 🎯 🚨 핵심 수정: 멀티 탭 동기화를 위한 storage 이벤트 리스너 추가
  const handleStorageChange = async (e: StorageEvent) => {
    if (e.key === 'accessToken' && e.newValue) {
      console.log('🔄 다른 탭에서 accessToken 변경 감지 - 타이머 재설정');
      // 🎯 다른 탭에서 토큰이 변경된 경우 타이머 재설정
      const { setupTokenRefreshTimer } = await import('./tokenManager');
      setupTokenRefreshTimer(e.newValue);
    }

    if (
      (e.key === 'accessToken' || e.key === 'refreshToken') &&
      e.newValue === null
    ) {
      console.log('🔄 다른 탭에서 토큰 제거 감지 - 타이머 정리');
      // 🎯 다른 탭에서 로그아웃한 경우 타이머 정리
      if (typeof window !== 'undefined' && window.tokenRefreshTimer) {
        clearTimeout(window.tokenRefreshTimer);
        window.tokenRefreshTimer = undefined;
      }
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  window.addEventListener('storage', handleStorageChange);

  // 🎯 초기 네트워크 상태 로깅
  console.log(
    '🌐 초기 네트워크 상태:',
    navigator.onLine ? '온라인' : '오프라인'
  );
};

/**
 * 🎯 iOS 환경 토큰 변경 감지 설정
 */
export const setupIOSTokenChangeDetection = (): void => {
  try {
    const isIOSEnvironment =
      typeof window !== 'undefined' &&
      /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (!isIOSEnvironment) {
      console.log('🍎 iOS 환경이 아님 - 토큰 변경 감지 설정 건너뜀');
      return;
    }

    console.log('🍎 iOS 환경 토큰 변경 감지 설정 시작');

    // 🎯 iOS 환경에서 토큰 변경 감지
    const checkTokenChanges = () => {
      try {
        const currentToken = getCurrentToken();
        const hasValid = currentToken && hasValidToken();

        if (!hasValid && currentToken) {
          console.log('🍎 iOS: 토큰 만료 감지 - 갱신 시도');
          refreshToken();
        }
      } catch (error) {
        console.error('🍎 iOS: 토큰 변경 감지 중 오류:', error);
      }
    };

    // 🎯 주기적으로 토큰 상태 확인 (iOS 최적화)
    const tokenCheckInterval = setInterval(checkTokenChanges, 30000); // 30초마다

    // 🎯 페이지 가시성 변경 시 토큰 확인
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkTokenChanges();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 🎯 정리 함수 등록
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        clearInterval(tokenCheckInterval);
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange
        );
      });
    }

    console.log('✅ iOS 환경 토큰 변경 감지 설정 완료');
  } catch (error) {
    console.error('🍎 iOS 환경 토큰 변경 감지 설정 중 오류:', error);
  }
};
