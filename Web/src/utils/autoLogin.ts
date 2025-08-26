import Cookies from 'js-cookie';

// 🔧 전역 타입 정의 (한 번만)
declare global {
  interface Window {
    tokenRefreshTimer?: number;
    tokenRefreshTime?: Date;
    gc?: () => void;
    iOSAutoLogin?: {
      saveToken: (
        token: string,
        refreshToken?: string,
        keepLogin?: boolean
      ) => void;
      getToken: () => string | null;
      checkStatus: () =>
        | { hasToken: boolean; isLoggedIn: boolean }
        | Promise<{ hasToken: boolean; isLoggedIn: boolean }>;
      restore: () => Promise<boolean>;
      optimizeMemory: () => void;
      monitorPerformance: () => void;
      setupOptimizedTimer: (token: string) => void;
    };
    iOSBiometricAuth?: {
      requestAuth: (
        reason?: string
      ) => Promise<{ success: boolean; error: string | null }>;
      checkStatus: () => Promise<{
        isAvailable: boolean;
        biometricType: string;
        isEnabled: boolean;
        requireForAutoLogin: boolean;
      }>;
      enable: () => Promise<boolean>;
      setAutoLogin: (require: boolean) => Promise<boolean>;
      performAutoLogin: () => Promise<boolean>;
      showUI: (reason?: string) => void;
      getStatus: () => {
        isAvailable: boolean;
        biometricType: string;
        isEnabled: boolean;
        requireForAutoLogin: boolean;
      };
    };
    webkit?: {
      messageHandlers?: {
        loginHandler?: {
          postMessage: (message: Record<string, unknown>) => void;
        };
        statusBarHandler?: {
          postMessage: (message: Record<string, unknown>) => void;
        };
      };
    };
  }
  interface WindowEventMap {
    loginSuccess: CustomEvent<{ message: string; timestamp: string }>;
    logoutSuccess: CustomEvent<{ message: string; timestamp: string }>;
    tokenError: CustomEvent<{
      context: string;
      error: string;
      timestamp: string;
    }>;
    tokenRefreshSuccess: CustomEvent<{ message: string; timestamp: string }>;
    autoLoginFailed: CustomEvent<{
      reason: string;
      message: string;
      timestamp: string;
    }>;
    webLoginSuccess: CustomEvent<{ token: string; refreshToken?: string }>;
    webLogout: CustomEvent<undefined>;
  }
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}
export {};

// --------------------
// 얇은 헬퍼만 유지
// --------------------

// ⬇️⬇️⬇️ 함수 선언문으로 변경하여 호이스팅 적용
export function clearPersistentLoginSettings(): void {
  try {
    localStorage.removeItem('persistentLogin');
    localStorage.removeItem('autoLogin');
    localStorage.removeItem('loginTimestamp');
    localStorage.removeItem('tokenExpiresAt');

    // 🎯 🚨 핵심 수정: 쿠키 제거 시 path 옵션 명시
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
  } catch (error) {
    console.error('지속 로그인 설정 정리 중 오류:', error);
  }
}

// 🎯 배럴 re-export (구현은 각 모듈에만 존재)
export {
  // environmentDetection
  isIOS,
  isNativeApp,
  isIOSApp,
  isAndroidApp,
  isOnline,
  isPublicRoute,
  isProtectedRoute,
} from './environmentDetection';

export {
  // tokenManager
  decodeJwtPayload,
  getCurrentToken,
  hasValidToken,
  hasValidTokenOrRefreshable,
  saveTokens,
  clearAllTokensAndIntervals,
  getRefreshToken,
  setupTokenRefreshTimer,
  refreshToken,
  clearTokens,
  setupOptimizedTokenRefreshTimer, // 🎯 레거시 대신 최적화된 타이머 사용
} from './tokenManager';

// iOS 최적화 저장(웹/앱 공용)
export const saveTokenForIOS = async (
  token: string,
  refreshToken?: string,
  keepLogin: boolean = true
): Promise<void> => {
  try {
    const { isIOS } = await import('./environmentDetection');
    const isIOSEnvironment = isIOS();

    if (isIOSEnvironment) {
      const cookieOptions = {
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'strict' as const,
        ...(keepLogin ? { expires: 30 } : {}), // keepLogin=false면 세션 쿠키
      };
      Cookies.set('accessToken', token, cookieOptions);
      if (refreshToken)
        Cookies.set('refreshToken', refreshToken, cookieOptions);

      sessionStorage.setItem('accessToken', token);
      if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);

      if (keepLogin) {
        localStorage.setItem('accessToken', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('keepLoginSetting', 'true');
        localStorage.setItem('autoLogin', 'true');
        localStorage.setItem('persistentLogin', 'true');
        localStorage.setItem('loginTimestamp', Date.now().toString());

        // 🎯 토큰 만료 시간 저장 추가
        try {
          const { decodeJwtPayload } = await import('./tokenManager');
          const payload = decodeJwtPayload(token);
          if (payload?.exp) {
            const expiryTime = new Date(payload.exp * 1000);
            localStorage.setItem('tokenExpiresAt', expiryTime.toISOString());
          }
        } catch {
          console.error('토큰 만료 시간 저장 실패');
        }
      } else {
        sessionStorage.setItem('accessToken', token);
        if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('keepLoginSetting', 'false');
      }
    } else {
      if (keepLogin) {
        localStorage.setItem('accessToken', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('keepLoginSetting', 'true');
        localStorage.setItem('autoLogin', 'true');
        localStorage.setItem('persistentLogin', 'true');
        localStorage.setItem('loginTimestamp', Date.now().toString());

        // 🎯 토큰 만료 시간 저장 추가
        try {
          const { decodeJwtPayload } = await import('./tokenManager');
          const payload = decodeJwtPayload(token);
          if (payload?.exp) {
            const expiryTime = new Date(payload.exp * 1000);
            localStorage.setItem('tokenExpiresAt', expiryTime.toISOString());
          }
        } catch {
          console.error('토큰 만료 시간 저장 실패');
        }
      } else {
        sessionStorage.setItem('accessToken', token);
        if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('keepLoginSetting', 'false');
      }

      const cookieOptions = {
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'strict' as const,
        ...(keepLogin ? { expires: 30 } : {}), // keepLogin=false면 세션 쿠키
      };
      Cookies.set('accessToken', token, cookieOptions);
      if (refreshToken)
        Cookies.set('refreshToken', refreshToken, cookieOptions);
    }
  } catch {
    console.error('iOS 토큰 저장 중 오류');
  }
};

// 지속 로그인 저장
export const saveTokensForPersistentLogin = async (
  accessToken: string,
  refreshToken?: string,
  keepLogin: boolean = true
): Promise<void> => {
  try {
    await saveTokenForIOS(accessToken, refreshToken, keepLogin);
    if (keepLogin) {
      localStorage.setItem('autoLogin', 'true');
      localStorage.setItem('persistentLogin', 'true');
    } else {
      // keepLogin=false일 때는 sessionStorage만 사용하고 타이머는 설정하지 않음
    }

    // 🎯 항상 토큰 갱신 타이머 설정 (keepLogin 여부와 관계없이)
    const { setupOptimizedTokenRefreshTimer } = await import('./tokenManager');
    setupOptimizedTokenRefreshTimer(accessToken);
  } catch {
    console.error('지속 로그인 토큰 저장 중 오류');
  }
};

// 지속 로그인 복원
export const restorePersistentLogin = async (): Promise<boolean> => {
  try {
    const persistentLogin = localStorage.getItem('persistentLogin');
    const autoLogin = localStorage.getItem('autoLogin');
    const hasPersistentSetting =
      persistentLogin === 'true' || autoLogin === 'true';
    if (!hasPersistentSetting) return false;

    const { getCurrentToken, hasValidToken } = await import('./tokenManager');
    const accessToken = getCurrentToken();
    const refreshToken =
      localStorage.getItem('refreshToken') ||
      sessionStorage.getItem('refreshToken') ||
      Cookies.get('refreshToken');

    if (!accessToken && !refreshToken) {
      clearPersistentLoginSettings(); // ✅ 직접 호출로 변경
      return false;
    }

    if (accessToken && hasValidToken()) {
      const { setupOptimizedTokenRefreshTimer } = await import(
        './tokenManager'
      );
      setupOptimizedTokenRefreshTimer(accessToken);
      return true;
    }

    if (refreshToken) {
      const { isIOS: isIOSEnv } = await import('./environmentDetection');
      const maxRetries = isIOSEnv() ? 3 : 2;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          const { refreshToken: refreshTokenFn, getCurrentToken: getNewToken } =
            await import('./tokenManager');
          const success = await refreshTokenFn(retryCount);
          if (success) {
            const newAccessToken = getNewToken();
            if (newAccessToken) {
              const { setupOptimizedTokenRefreshTimer } = await import(
                './tokenManager'
              );
              setupOptimizedTokenRefreshTimer(newAccessToken);
            }
            return true;
          }
          retryCount++;
          if (retryCount < maxRetries) {
            const delaySec = isIOSEnv() ? retryCount * 2 : retryCount;
            await new Promise((r) => setTimeout(r, delaySec * 1000));
          }
        } catch {
          retryCount++;
          const { isIOS: isIOSRetry } = await import('./environmentDetection');
          if (retryCount < maxRetries) {
            const delaySec = isIOSRetry() ? retryCount * 2 : retryCount;
            await new Promise((r) => setTimeout(r, delaySec * 1000));
          }
        }
      }

      // 모든 재시도 실패
      const { isIOS: isIOSFinal } = await import('./environmentDetection');
      if (
        isIOSFinal() &&
        (window as { webkit?: { messageHandlers?: unknown } }).webkit
          ?.messageHandlers
      ) {
        window.dispatchEvent(
          new CustomEvent('autoLoginFailed', {
            detail: {
              reason: '토큰 갱신 실패 (iOS 앱)',
              message: '자동 로그인이 만료되었습니다. 다시 로그인해주세요.',
              timestamp: new Date().toLocaleString(),
            },
          })
        );
        return false;
      }

      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('autoLoginFailed', {
              detail: {
                reason: '토큰 갱신 실패',
                message: '자동 로그인에 실패했습니다. 다시 로그인해주세요.',
                timestamp: new Date().toLocaleString(),
              },
            })
          );
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 3000);
        }
      } catch {
        console.error('이벤트 발생 실패');
      }

      clearPersistentLoginSettings(); // ✅ 직접 호출로 변경
      return false;
    }

    clearPersistentLoginSettings(); // ✅ 직접 호출로 변경
    return false;
  } catch {
    console.error('자동 로그인 복원 중 오류');
    clearPersistentLoginSettings(); // ✅ 직접 호출로 변경
    return false;
  }
};

// 자동 로그인 설정 확인 및 타이머 설정
export const checkAndSetupAutoLogin = async (): Promise<void> => {
  try {
    const autoLogin = localStorage.getItem('autoLogin') === 'true';
    const persistentLogin = localStorage.getItem('persistentLogin') === 'true';
    if (!autoLogin && !persistentLogin) return;

    const { getCurrentToken, setupOptimizedTokenRefreshTimer } = await import(
      './tokenManager'
    );
    const token = getCurrentToken();
    if (!token) return;

    // 🎯 이 한 줄로 충분 - 현재 토큰으로 타이머만 재설치
    setupOptimizedTokenRefreshTimer(token);
  } catch {
    console.error('자동 로그인 설정 확인 중 오류');
    clearPersistentLoginSettings();
  }
};
