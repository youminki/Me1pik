// 🔧 개선: 순수 배럴 파일로 정리 - 중복/순환 의존성 제거
// 모든 구현은 각 모듈에만 존재하고, 여기서는 re-export만 담당

// ----- 배럴 re-export: 구현은 각 모듈에만 존재 -----

// 토큰/타이머/리프레시
export {
  decodeJwtPayload,
  getCurrentToken,
  getRefreshToken,
  hasValidToken,
  hasValidTokenOrRefreshable,
  saveTokens,
  clearTokens,
  clearAllTokensAndIntervals,
  setupTokenRefreshTimer,
  setupOptimizedTokenRefreshTimer,
  refreshToken,
} from './tokenManager';

// 환경 감지
export {
  isIOS,
  isNativeApp,
  isIOSApp,
  isAndroidApp,
  isOnline,
  isPublicRoute,
  isProtectedRoute,
} from './environmentDetection';

// 자동 로그인
export {
  saveTokenForIOS,
  saveTokensForPersistentLogin,
  restorePersistentLogin,
  checkAndSetupAutoLogin,
  clearPersistentLoginSettings,
} from './autoLogin';

// 네트워크 모니터링
export {
  setupNetworkMonitoring,
  setupIOSTokenChangeDetection,
} from './networkMonitoring';

// ----- 얇은 헬퍼 (구현 최소화) -----

// 필요한 함수들을 import
import { isPublicRoute as _isPublicRoute } from './environmentDetection';
import {
  saveTokens as _saveTokens,
  clearAllTokensAndIntervals as _clearAllTokensAndIntervals,
  hasValidToken as _hasValidToken,
  getRefreshToken as _getRefreshToken,
  decodeJwtPayload as _decode,
  clearTokens as _clearTokens,
  getCurrentToken as _getCurrentToken,
} from './tokenManager';

// 네이티브/웹뷰 동기화 (SSR 가드 포함)
export function syncTokenWithApp(accessToken?: string, refreshToken?: string) {
  if (typeof window === 'undefined') return;

  if (accessToken) {
    const webkit = (
      window as {
        webkit?: {
          messageHandlers?: {
            loginHandler?: { postMessage: (message: unknown) => void };
          };
        };
      }
    ).webkit;
    const loginHandler = webkit?.messageHandlers?.loginHandler;
    if (loginHandler?.postMessage) {
      loginHandler.postMessage({
        type: 'login',
        token: accessToken,
        refreshToken,
      });
    }
    window.dispatchEvent(
      new CustomEvent('webLoginSuccess', {
        detail: { token: accessToken, refreshToken },
      })
    );
  } else {
    const handlers = (
      window as {
        webkit?: {
          messageHandlers?: {
            logoutHandler?: { postMessage: (msg: unknown) => void };
          };
        };
      }
    ).webkit?.messageHandlers;
    if (handlers?.logoutHandler?.postMessage) {
      handlers.logoutHandler.postMessage({ type: 'logout' });
    }
    window.dispatchEvent(new CustomEvent('webLogout'));
  }
}

// 로그인/로그아웃 UX 래퍼
export function handleAppLogin(params: {
  accessToken: string;
  refreshToken?: string;
  keepLogin?: boolean;
}) {
  const { accessToken, refreshToken, keepLogin = true } = params;
  _saveTokens(accessToken, refreshToken, keepLogin);
  syncTokenWithApp(accessToken, refreshToken);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('loginSuccess', {
        detail: { message: '로그인 성공', timestamp: new Date().toISOString() },
      })
    );
  }
}

export async function logout() {
  _clearAllTokensAndIntervals();
  syncTokenWithApp(); // 로그아웃 신호

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('logoutSuccess', {
        detail: {
          message: '로그아웃 성공',
          timestamp: new Date().toISOString(),
        },
      })
    );
  }
}

export function redirectToLoginIfNoToken(): boolean {
  if (!_hasValidToken()) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return true;
  }
  return false;
}

/**
 * SPA 라우팅 유지를 위한 사용 패턴:
 *
 * ❌ 직접 사용 (전체 페이지 리로드):
 *   redirectToLoginIfNoToken(); // window.location.href로 강제 이동
 *
 * ✅ 라우터 가드에서 사용 (SPA 유지):
 *   // PrivateRoute.tsx 예시
 *   function PrivateRoute() {
 *     const isAuthenticated = hasValidToken();
 *     if (!isAuthenticated) {
 *       return <Navigate to="/login" replace />;
 *     }
 *     return <Outlet />;
 *   }
 *
 * ✅ 조건부 리다이렉트 (결과만 활용):
 *   const shouldRedirect = redirectToLoginIfNoToken();
 *   if (shouldRedirect) {
 *     // React Router의 Navigate 사용
 *     return <Navigate to="/login" replace />;
 *   }
 */
export function checkTokenAndRedirect(pathname: string): boolean {
  if (_isPublicRoute(pathname)) return false;
  return redirectToLoginIfNoToken();
}

// 에러 처리 유틸
export function handleTokenError(error: unknown, context: string): boolean {
  console.error(`토큰 에러 (${context}):`, error);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('tokenError', {
        detail: {
          context,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        },
      })
    );
  }

  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  if (status === 401) {
    void logout();
    return true;
  }
  return false;
}

// 레거시 호환(필요 시)
export function forceSaveAppToken(accessToken: string, refreshToken?: string) {
  _saveTokens(accessToken, refreshToken, true);
  syncTokenWithApp(accessToken, refreshToken);
}

export function setToken(accessToken: string, refreshToken?: string) {
  _saveTokens(accessToken, refreshToken, true);
  syncTokenWithApp(accessToken, refreshToken);
}

export function removeToken() {
  _clearTokens();
}

// Axios 에러 메시지 타입가드 (더 안전한 버전)
export function getErrorMessage(error: unknown): string {
  // Axios 에러 우선 처리
  const ax = error as
    | { response?: { data?: { message?: string } } }
    | undefined;
  const msg = ax?.response?.data?.message;
  if (typeof msg === 'string') return msg;

  // 일반 Error 객체 처리
  if (error instanceof Error) return error.message;

  // 문자열 처리
  if (typeof error === 'string') return error;

  return '알 수 없는 오류';
}

export function debugTokenStatus(): void {
  if (typeof window === 'undefined') return;

  const accessToken = _getCurrentToken(); // ✅ iOS/웹 일관 (getCurrentToken 사용)
  const refreshToken = _getRefreshToken();
  const autoLogin = localStorage.getItem('autoLogin');

  console.log('🔍 토큰 상태 디버깅:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    autoLogin,
    accessTokenLength: accessToken?.length || 0,
    refreshTokenLength: refreshToken?.length || 0,
    timestamp: new Date().toLocaleString(),
  });

  if (accessToken) {
    try {
      const payload = _decode(accessToken);
      if (payload?.exp) {
        const expiresAt = new Date(payload.exp * 1000);
        const ms = expiresAt.getTime() - Date.now();
        console.log('📅 토큰 만료 정보:', {
          expiresAt: expiresAt.toLocaleString(),
          timeUntilExpiry: Math.floor(ms / 1000 / 60) + '분',
          isExpired: ms < 0,
        });
      }
    } catch (e) {
      console.error('토큰 디코딩 실패:', e);
    }
  }
}

// 레거시 호환 함수들
export const saveTokensLegacy = (
  accessToken: string,
  refreshToken?: string
): void => {
  if (typeof window === 'undefined') return;

  const autoLogin = localStorage.getItem('autoLogin') === 'true';
  _saveTokens(accessToken, refreshToken, autoLogin);
};

// 동기 래핑으로 통일 (권장: 호출부를 단순화)
// Promise 반환이 필요하면 async 버전으로 바꾸기
export const handleAppLogout = (): void => {
  void logout();
};
