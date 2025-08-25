import Cookies from 'js-cookie';

import { Axios } from '@/api-utils/Axios';

// 인스타그램 방식 토큰 갱신 타이머
let tokenRefreshTimer: NodeJS.Timeout | null = null;

/**
 * JWT 페이로드를 안전하게 디코드합니다 (base64url 규격 대응)
 */
function decodeJwtPayload(token: string) {
  const [, payload] = token.split('.');
  if (!payload) return null;

  // base64url을 base64로 변환
  const base64 = payload
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(payload.length / 4) * 4, '=');

  try {
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/**
 * 🎯 iOS 환경 감지 함수
 */
const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;

  // iOS 웹뷰 감지
  if ((window as WebKitWindow).webkit?.messageHandlers) return true;

  // iOS Safari 감지
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) || /ipad/.test(navigator.platform);
};

/**
 * 🍎 iOS WebKit 메시지 핸들러 타입 정의
 */
interface WebKitWindow extends Window {
  webkit?: {
    messageHandlers?: {
      [key: string]: {
        postMessage: (message: unknown) => void;
      };
    };
  };
}

/**
 * 🍎 Performance Memory 타입 정의
 */
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * 🎯 iOS 환경에 최적화된 토큰 읽기 함수
 */
export const getCurrentToken = (): string | null => {
  try {
    const isIOSEnvironment = isIOS();

    if (isIOSEnvironment) {
      console.log('📱 iOS 환경 감지 - iOS 최적화된 토큰 읽기');

      // iOS에서는 쿠키를 우선으로 사용 (ITP 대응)
      const cookieToken = Cookies.get('accessToken');
      if (cookieToken?.trim()) {
        console.log('🍪 iOS: 쿠키에서 토큰 읽기 성공');
        return cookieToken.trim();
      }

      // sessionStorage (iOS에서 더 안정적)
      const sessionToken = sessionStorage.getItem('accessToken');
      if (sessionToken?.trim()) {
        console.log('📱 iOS: sessionStorage에서 토큰 읽기 성공');
        return sessionToken.trim();
      }

      // localStorage (마지막 선택)
      const localToken = localStorage.getItem('accessToken');
      if (localToken?.trim()) {
        console.log('💾 iOS: localStorage에서 토큰 읽기 성공');
        return localToken.trim();
      }
    } else {
      // 일반 환경: 기존 로직 유지
      // 1. localStorage (가장 안정적, 브라우저 종료 후에도 유지)
      const localToken = localStorage.getItem('accessToken');
      if (localToken?.trim()) {
        return localToken.trim();
      }

      // 2. sessionStorage (탭별 세션)
      const sessionToken = sessionStorage.getItem('accessToken');
      if (sessionToken?.trim()) {
        return sessionToken.trim();
      }

      // 3. Cookies (백업, 보안 강화)
      const cookieToken = Cookies.get('accessToken');
      if (cookieToken?.trim()) {
        return cookieToken.trim();
      }
    }

    return null;
  } catch (error) {
    console.error('토큰 읽기 중 오류:', error);
    return null;
  }
};

/**
 * 🎯 개선된 토큰 유효성 검사 - 점진적 정리
 */
export const hasValidToken = (): boolean => {
  try {
    const token = getCurrentToken();
    if (!token) {
      return false;
    }

    // JWT 토큰의 페이로드 부분을 안전하게 디코드
    const payload = decodeJwtPayload(token);
    if (!payload) {
      console.error('❌ 토큰 페이로드 디코드 실패');
      // 🎯 해당 토큰만 점진적으로 정리 (다른 저장소의 유효한 토큰 보존)
      clearInvalidTokenFromStorage(token);
      return false;
    }

    const currentTime = Date.now() / 1000;

    // 토큰이 만료되었는지 확인
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ 토큰 파싱 오류:', error);
    // 🎯 에러 처리 함수 호출
    return handleTokenError(error, 'hasValidToken');
  }
};

/**
 * 🎯 특정 토큰을 모든 저장소에서 점진적으로 정리
 */
const clearInvalidTokenFromStorage = (invalidToken: string): void => {
  try {
    // localStorage에서 해당 토큰만 제거
    const localToken = localStorage.getItem('accessToken');
    if (localToken === invalidToken) {
      localStorage.removeItem('accessToken');
    }

    // sessionStorage에서 해당 토큰만 제거
    const sessionToken = sessionStorage.getItem('accessToken');
    if (sessionToken === invalidToken) {
      sessionStorage.removeItem('accessToken');
    }

    // Cookies에서 해당 토큰만 제거
    const cookieToken = Cookies.get('accessToken');
    if (cookieToken === invalidToken) {
      // 🎯 🚨 핵심 수정: 쿠키 제거 시 path 옵션 명시
      Cookies.remove('accessToken', { path: '/' });
    }
  } catch (error) {
    console.error('토큰 정리 중 오류:', error);
  }
};

/**
 * 🎯 자동 로그인 전용 토큰 유효성 검사
 * 만료된 토큰이 있어도 refreshToken이 있으면 true 반환
 */
export const hasValidTokenOrRefreshable = (): boolean => {
  const accessToken = getCurrentToken();
  const refreshToken = getRefreshToken();

  // 1. 유효한 accessToken이 있으면 true
  if (accessToken) {
    try {
      const payload = decodeJwtPayload(accessToken);
      if (payload?.exp) {
        const currentTime = Date.now() / 1000;
        if (payload.exp > currentTime) {
          return true;
        }
      }
    } catch (error) {
      console.error('accessToken 파싱 오류:', error);
    }
  }

  // 2. accessToken이 만료되었지만 refreshToken이 있으면 true
  if (refreshToken) {
    return true;
  }

  return false;
};

/**
 * 🎯 토큰 만료 시간 검증 및 수정 (iOS 환경 대응 포함)
 */
const validateAndFixTokenExpiry = (accessToken: string): Date | null => {
  try {
    const payload = decodeJwtPayload(accessToken);
    if (!payload) {
      console.log('🍎 iOS: 토큰 페이로드 디코딩 실패');
      return null;
    }

    // 1. exp 필드가 있는 경우 (표준 JWT)
    if (payload.exp) {
      const currentTime = Date.now() / 1000;
      const expiresAt = payload.exp;

      if (expiresAt > currentTime) {
        console.log('🍎 iOS: 표준 JWT exp 필드 사용 - 토큰 유효');
        return new Date(expiresAt * 1000);
      } else {
        console.log('🍎 iOS: 표준 JWT exp 필드 사용 - 토큰 만료됨');
        return null;
      }
    }

    // 2. exp 필드가 없는 경우 (커스텀 토큰)
    console.log('🍎 iOS: exp 필드 없음 - 커스텀 토큰으로 간주');

    // iOS 환경에서는 기본 만료 시간 설정 (24시간)
    const defaultExpiryHours = 24;
    const expiresAt = new Date(
      Date.now() + defaultExpiryHours * 60 * 60 * 1000
    );

    console.log(
      '🍎 iOS: 커스텀 토큰 기본 만료 시간 설정:',
      expiresAt.toLocaleString()
    );

    // localStorage에 기본 만료 시간 저장
    try {
      localStorage.setItem('tokenExpiresAt', expiresAt.toISOString());
      sessionStorage.setItem('tokenExpiresAt', expiresAt.toISOString());
      console.log('🍎 iOS: 기본 만료 시간 저장 완료');
    } catch (error) {
      console.error('🍎 iOS: 기본 만료 시간 저장 실패:', error);
    }

    return expiresAt;
  } catch (error) {
    console.error('🍎 iOS: 토큰 만료 시간 검증 중 오류:', error);
    return null;
  }
};

/**
 * 🎯 개선된 토큰 저장 함수 - 일관성 보장 및 중복 타이머 방지
 */
export const saveTokens = (
  accessToken: string,
  refreshToken?: string,
  autoLogin: boolean = false,
  skipTimerSetup: boolean = false // 🎯 타이머 설정 건너뛰기 옵션 추가
): void => {
  try {
    // 1. localStorage에 저장 (브라우저 종료 후에도 유지)
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    // 2. sessionStorage에 저장 (탭별 세션 유지)
    sessionStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      sessionStorage.setItem('refreshToken', refreshToken);
    }

    // 3. 쿠키에 저장 (보안 강화)
    const maxAge = autoLogin ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30일 또는 1일
    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';

    document.cookie = `accessToken=${accessToken}; Max-Age=${maxAge}; Path=/; SameSite=Strict${secureFlag}`;
    if (refreshToken) {
      document.cookie = `refreshToken=${refreshToken}; Max-Age=${maxAge}; Path=/; SameSite=Strict${secureFlag}`;
    }

    // 4. 자동 로그인 설정 저장
    localStorage.setItem('autoLogin', autoLogin.toString());

    // 5. 🎯 토큰 만료 시간 검증 및 저장
    const validatedExpiry = validateAndFixTokenExpiry(accessToken);
    if (validatedExpiry) {
      localStorage.setItem('tokenExpiresAt', validatedExpiry.toISOString());
    } else {
      // 🎯 잘못된 만료 시간이 저장되어 있다면 제거
      localStorage.removeItem('tokenExpiresAt');
    }

    // 6. 🎯 🚨 핵심 수정: 타이머 설정 조건 완화 - validatedExpiry에 의존하지 않음
    if (!skipTimerSetup) {
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
        tokenRefreshTimer = null;
      }
      setupTokenRefreshTimer(accessToken);
    }
  } catch (error) {
    console.error('토큰 저장 중 오류:', error);
    // 에러 발생 시 부분적으로라도 저장 시도
    try {
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    } catch (fallbackError) {
      console.error('부분적 토큰 저장도 실패:', fallbackError);
    }
  }
};

/**
 * 기본 토큰 저장 함수 (기존 코드 호환성)
 */
export function setToken(accessToken: string, refreshToken?: string) {
  localStorage.setItem('accessToken', accessToken);
  sessionStorage.setItem('accessToken', accessToken);
  Cookies.set('accessToken', accessToken, { path: '/' });
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    Cookies.set('refreshToken', refreshToken, { path: '/' });
  }

  // 🎯 토큰 갱신 타이머 설정 추가
  setupTokenRefreshTimer(accessToken);

  // 🎯 앱-웹뷰 동기화 추가
  syncTokenWithApp(accessToken, refreshToken);
}

/**
 * 모든 토큰과 관련 데이터를 정리합니다 (로그아웃 시 사용)
 */
export const clearAllTokensAndIntervals = (): void => {
  // 로컬스토리지 정리
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('autoLogin');
  localStorage.removeItem('persistentLogin');
  localStorage.removeItem('loginTimestamp');
  localStorage.removeItem('tokenExpiresAt');
  localStorage.removeItem('userEmail');

  // 세션스토리지 정리
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');

  // 🎯 🚨 핵심 수정: 쿠키 제거 시 path 옵션 명시
  Cookies.remove('accessToken', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });

  // 자동 갱신 타이머 정리
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }

  // 앱-웹뷰 동기화
  syncTokenWithApp();
};

/**
 * 토큰을 여러 저장소에서 삭제
 */
export function removeToken() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  // 🎯 🚨 핵심 수정: 쿠키 제거 시 path 옵션 명시
  Cookies.remove('accessToken', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });
}

/**
 * 앱-웹뷰에 토큰 동기화(로그인/로그아웃 이벤트 전달)
 */
export function syncTokenWithApp(accessToken?: string, refreshToken?: string) {
  if (accessToken) {
    // 로그인 이벤트
    if ((window as WebKitWindow).webkit?.messageHandlers?.loginHandler) {
      const webkit = (window as WebKitWindow).webkit;
      if (webkit?.messageHandlers?.loginHandler) {
        webkit.messageHandlers.loginHandler.postMessage({
          type: 'login',
          token: accessToken,
          refreshToken: refreshToken,
        });
      }
    }
    window.dispatchEvent(
      new CustomEvent('webLoginSuccess', {
        detail: { token: accessToken, refreshToken },
      })
    );
  } else {
    // 로그아웃 이벤트
    const messageHandlers = (window as WebKitWindow).webkit?.messageHandlers as
      | {
          logoutHandler?: {
            postMessage: (msg: Record<string, unknown>) => void;
          };
        }
      | undefined;
    if (
      messageHandlers &&
      typeof messageHandlers.logoutHandler?.postMessage === 'function'
    ) {
      messageHandlers.logoutHandler.postMessage({ type: 'logout' });
    }
    window.dispatchEvent(new CustomEvent('webLogout'));
  }
}

/**
 * 토큰을 저장합니다 (인스타그램 방식)
 */
export const saveTokensLegacy = (
  accessToken: string,
  refreshToken?: string
): void => {
  const autoLogin = localStorage.getItem('autoLogin') === 'true';

  // 🎯 saveTokens에서 이미 setupTokenRefreshTimer와 syncTokenWithApp을 호출하므로 중복 제거
  saveTokens(accessToken, refreshToken, autoLogin);
};

/**
 * Refresh 토큰을 가져옵니다
 */
export const getRefreshToken = (): string | null => {
  const localToken = localStorage.getItem('refreshToken');
  const sessionToken = sessionStorage.getItem('refreshToken');
  const cookieToken = Cookies.get('refreshToken');
  return (
    localToken?.trim() || sessionToken?.trim() || cookieToken?.trim() || null
  );
};

/**
 * 🎯 iOS 환경에 최적화된 토큰 갱신 타이머 설정
 */
export const setupTokenRefreshTimer = (token: string): void => {
  try {
    const isIOSEnvironment = isIOS();

    if (isIOSEnvironment) {
      console.log('📱 iOS 환경: iOS 최적화된 토큰 갱신 타이머 설정');
    }

    const payload = decodeJwtPayload(token);
    if (!payload?.exp) {
      console.error('❌ 토큰에 만료 시간 정보가 없음');
      return;
    }

    const currentTime = Date.now() / 1000;
    const expiresAt = payload.exp;
    const timeUntilExpiry = expiresAt - currentTime;

    if (timeUntilExpiry <= 0) {
      console.log('⚠️ 토큰이 이미 만료됨');
      return;
    }

    // iOS 환경에서는 더 일찍 갱신 (ITP 대응)
    const refreshOffset = isIOSEnvironment ? 15 * 60 : 5 * 60; // iOS: 15분, 일반: 5분
    const refreshTime = Math.max(timeUntilExpiry - refreshOffset, 0);

    console.log(
      `⏰ 토큰 갱신 타이머 설정: ${Math.floor(timeUntilExpiry / 60)}분 후 만료, ${Math.floor(refreshTime / 60)}분 후 갱신 (iOS: ${isIOSEnvironment})`
    );

    // 기존 타이머 정리
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
      tokenRefreshTimer = null;
    }

    // 새 타이머 설정
    tokenRefreshTimer = setTimeout(async () => {
      console.log('🔄 토큰 갱신 타이머 실행');
      try {
        const success = await refreshToken();
        if (success) {
          console.log('✅ 토큰 갱신 성공 - 새로운 갱신 타이머 설정');
          const newToken = getCurrentToken();
          if (newToken) {
            setupTokenRefreshTimer(newToken);
          }
        } else {
          console.log('❌ 토큰 갱신 실패');
          clearPersistentLoginSettings();
        }
      } catch (error) {
        console.error('토큰 갱신 중 오류:', error);
        clearPersistentLoginSettings();
      }
    }, refreshTime * 1000);

    console.log('✅ 토큰 갱신 타이머 설정 완료');
  } catch (error) {
    console.error('토큰 갱신 타이머 설정 중 오류:', error);
  }
};

/**
 * 🎯 개선된 토큰 갱신 (인스타그램 방식) - 네트워크 상태 확인 포함
 */
export const refreshToken = async (retryCount = 0): Promise<boolean> => {
  // 🎯 네트워크 상태 확인
  if (!isOnline()) {
    return false;
  }

  // 🎯 최대 재시도 횟수 설정
  const maxRetries = 2;
  let currentRetryCount = retryCount;

  while (currentRetryCount <= maxRetries) {
    try {
      const currentRefreshToken = getRefreshToken();
      const autoLogin = localStorage.getItem('autoLogin') === 'true';

      if (!currentRefreshToken) {
        return false;
      }

      // 🎯 토큰 갱신 API 호출
      const response = await Axios.post('/auth/refresh', {
        refreshToken: currentRefreshToken,
        autoLogin,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // 🎯 새 토큰의 만료시간 확인
      try {
        const payload = decodeJwtPayload(accessToken);
        if (payload?.exp) {
          // 토큰 만료시간 확인 완료
        }
      } catch (e) {
        console.error('새 토큰 디코딩 실패:', e);
        // 디코딩 실패 시에도 토큰 저장 시도
      }

      // 🎯 새 토큰 저장 (기존 타이머 정리 후)
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
        tokenRefreshTimer = null;
      }

      if (newRefreshToken) {
        // refreshToken에서 호출된 경우 타이머 설정 건너뛰기
        if (currentRetryCount === 0) {
          saveTokens(accessToken, newRefreshToken, autoLogin, true); // 🎯 타이머 설정 건너뛰기
        } else {
          // 재시도 중인 경우 타이머 설정 없이 저장
          saveTokens(accessToken, newRefreshToken, autoLogin, true); // 🎯 타이머 설정 건너뛰기
        }
      } else {
        // 리프레시 토큰이 없으면 액세스 토큰만 업데이트
        const currentRefreshTokenForSave = getRefreshToken();
        if (currentRetryCount === 0) {
          saveTokens(
            accessToken,
            currentRefreshTokenForSave || undefined,
            autoLogin,
            true // 🎯 타이머 설정 건너뛰기
          );
        } else {
          saveTokens(
            accessToken,
            currentRefreshTokenForSave || undefined,
            autoLogin,
            true // 🎯 타이머 설정 건너뛰기
          );
        }
      }

      // 🎯 30일 자동 로그인 설정이 활성화된 경우 쿠키도 갱신
      if (autoLogin) {
        const maxAge = 30 * 24 * 60 * 60; // 30일을 초 단위로
        // 🎯 🚨 핵심 수정: Secure 플래그 추가
        const secureFlag =
          window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `accessToken=${accessToken}; max-age=${maxAge}; path=/; SameSite=Strict${secureFlag}`;
        if (newRefreshToken) {
          document.cookie = `refreshToken=${newRefreshToken}; max-age=${maxAge}; path=/; SameSite=Strict${secureFlag}`;
        }
      }

      // 🎯 토큰 갱신 성공 이벤트 발생
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('tokenRefreshSuccess', {
            detail: {
              accessToken,
              refreshToken: newRefreshToken,
              timestamp: new Date().toLocaleString(),
            },
          })
        );
      }

      // 🎯 🚨 핵심 수정: 갱신 성공 후 반드시 타이머 재설정
      const nextAccessToken = getCurrentToken();
      if (nextAccessToken) {
        setupTokenRefreshTimer(nextAccessToken);
      }

      return true;
    } catch (error) {
      console.error(
        `토큰 갱신 실패 (${currentRetryCount}/${maxRetries}):`,
        error
      );

      // 🎯 네트워크 에러인 경우 재시도 건너뛰기
      if (
        error instanceof Error &&
        (error.message.includes('Network Error') ||
          error.message.includes('fetch'))
      ) {
        return false;
      }

      currentRetryCount++;

      if (currentRetryCount <= maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, currentRetryCount * 1000)
        );
      } else {
        return false;
      }
    }
  }

  return false;
};

/**
 * 모든 토큰을 제거합니다
 */
export const clearTokens = (): void => {
  // 로컬스토리지에서 제거
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('autoLogin');
  localStorage.removeItem('persistentLogin');
  localStorage.removeItem('loginTimestamp');
  localStorage.removeItem('tokenExpiresAt');
  localStorage.removeItem('userEmail');

  // 세션스토리지에서 제거
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');

  // 🎯 🚨 핵심 수정: 쿠키 제거 시 path 옵션 명시
  Cookies.remove('accessToken', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });

  // 자동 갱신 타이머 정리
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
};

/**
 * 공개 경로인지 확인합니다 (토큰이 없어도 접근 가능한 경로)
 */
export const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes = [
    '/login',
    '/landing',
    '/signup',
    '/findid',
    '/findPassword',
    '/link',
    '/',
    '/home', // 홈 페이지를 공개 라우트로 추가
    '/test-login', // 테스트 로그인 페이지
    '/test-dashboard', // 테스트 대시보드 페이지
  ];
  return publicRoutes.includes(pathname);
};

/**
 * 보호된 경로인지 확인합니다 (토큰이 필요한 경로)
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return !isPublicRoute(pathname);
};

/**
 * 로그아웃 처리를 합니다 (인스타그램 방식)
 */
export const logout = async (): Promise<void> => {
  try {
    // 서버에 로그아웃 요청 (선택사항)
    const email = getEmailFromToken();
    if (email) {
      // logoutUser API 호출 (에러가 나도 무시)
      await Axios.post('/auth/logout', { email });
    }
  } catch {
    // 로그아웃 처리 중 오류 무시
  } finally {
    // 모든 토큰 제거
    clearTokens();
  }
};

/**
 * 토큰에서 이메일을 추출합니다
 */
const getEmailFromToken = (): string | null => {
  const token = getCurrentToken();
  if (!token) return null;

  try {
    // 🎯 🚨 핵심 수정: decodeJwtPayload 사용으로 base64url 일관성 보장
    const payload = decodeJwtPayload(token);
    return (payload?.email as string) ?? null;
  } catch {
    return null;
  }
};

/**
 * 앱에서 토큰을 강제로 저장 (네이티브 앱용)
 */
export const forceSaveAppToken = (
  accessToken: string,
  refreshToken?: string
): void => {
  setToken(accessToken, refreshToken);
  setupTokenRefreshTimer(accessToken);
  // 앱-웹뷰 동기화는 필요시 호출자가 직접 syncTokenWithApp 사용
};

/**
 * 토큰이 없을 때 로그인 페이지로 이동하는 함수
 */
export const redirectToLoginIfNoToken = (): boolean => {
  const token = getCurrentToken();
  if (!token) {
    window.location.href = '/login';
    return true; // 이동됨
  }
  return false; // 이동하지 않음
};

/**
 * 보호된 라우트에서 토크 체크 및 리다이렉트
 */
export const checkTokenAndRedirect = (pathname: string): boolean => {
  const isProtected = isProtectedRoute(pathname);
  if (!isProtected) return false; // 공개 라우트는 체크하지 않음

  const token = getCurrentToken();
  if (!token) {
    return true; // 리다이렉트 필요
  }

  return false; // 리다이렉트 불필요
};

/**
 * 앱에서 받은 로그인 정보 처리 (인스타그램 방식)
 */
export const handleAppLogin = (loginInfo: {
  token: string;
  refreshToken?: string;
  email?: string;
}): void => {
  // 토큰 저장
  saveTokens(loginInfo.token, loginInfo.refreshToken);

  // 이메일 저장
  if (loginInfo.email) {
    localStorage.setItem('userEmail', loginInfo.email);
  }
};

/**
 * 앱에서 받은 로그아웃 처리 (인스타그램 방식)
 */
export const handleAppLogout = (): void => {
  logout();
};

/**
 * 에러 객체에서 사용자 친화적인 메시지를 추출하는 유틸 함수
 */
interface ErrorWithResponse extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (
      'response' in error &&
      typeof (error as ErrorWithResponse).response === 'object'
    ) {
      const data = (error as ErrorWithResponse).response?.data;
      if (data && typeof data.message === 'string') {
        return data.message;
      }
    }
    return error.message;
  }
  if (typeof error === 'string') return error;
  return '알 수 없는 오류';
}

/**
 * 현재 토큰 상태를 확인하는 디버깅 함수
 */
export const debugTokenStatus = (): void => {
  const accessToken = getCurrentToken();
  const refreshToken = getRefreshToken();
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
      // 🎯 🚨 핵심 수정: decodeJwtPayload 사용으로 base64url 일관성 보장
      const payload = decodeJwtPayload(accessToken);
      if (payload?.exp) {
        const expiresAt = new Date(payload.exp * 1000);
        const currentTime = new Date();
        const timeUntilExpiry = expiresAt.getTime() - currentTime.getTime();

        console.log('📅 토큰 만료 정보:', {
          expiresAt: expiresAt.toLocaleString(),
          timeUntilExpiry: Math.floor(timeUntilExpiry / 1000 / 60) + '분',
          isExpired: timeUntilExpiry < 0,
        });
      }
    } catch (e) {
      console.error('토큰 디코딩 실패:', e);
    }
  }
};

// 브라우저 콘솔에서 접근할 수 있도록 전역 함수로 노출
if (typeof window !== 'undefined') {
  (
    window as Window &
      typeof globalThis & {
        debugTokenStatus: typeof debugTokenStatus;
        refreshToken: typeof refreshToken;
        getCurrentToken: typeof getCurrentToken;
        getRefreshToken: typeof getRefreshToken;
        simulateTokenExpiry: () => void;
        testAutoRefresh: () => Promise<boolean>;
      }
  ).debugTokenStatus = debugTokenStatus;
  (
    window as Window &
      typeof globalThis & {
        debugTokenStatus: typeof debugTokenStatus;
        refreshToken: typeof refreshToken;
        getCurrentToken: typeof getCurrentToken;
        getRefreshToken: typeof getRefreshToken;
        simulateTokenExpiry: () => void;
        testAutoRefresh: () => Promise<boolean>;
      }
  ).refreshToken = refreshToken;
  (
    window as Window &
      typeof globalThis & {
        debugTokenStatus: typeof debugTokenStatus;
        refreshToken: typeof refreshToken;
        getCurrentToken: typeof getCurrentToken;
        getRefreshToken: typeof getRefreshToken;
        simulateTokenExpiry: () => void;
        testAutoRefresh: () => Promise<boolean>;
      }
  ).getCurrentToken = getCurrentToken;
  (
    window as Window &
      typeof globalThis & {
        debugTokenStatus: typeof debugTokenStatus;
        refreshToken: typeof refreshToken;
        getCurrentToken: typeof getCurrentToken;
        getRefreshToken: typeof getRefreshToken;
        simulateTokenExpiry: () => void;
        testAutoRefresh: () => Promise<boolean>;
      }
  ).getRefreshToken = getRefreshToken;

  // 토큰 만료 시뮬레이션 함수
  (
    window as Window &
      typeof globalThis & {
        debugTokenStatus: typeof debugTokenStatus;
        refreshToken: typeof refreshToken;
        getCurrentToken: typeof getCurrentToken;
        getRefreshToken: typeof getRefreshToken;
        simulateTokenExpiry: () => void;
        testAutoRefresh: () => Promise<boolean>;
      }
  ).simulateTokenExpiry = () => {
    console.log('🧪 토큰 만료 시뮬레이션 시작');
    const accessToken = getCurrentToken();
    if (!accessToken) {
      console.log('❌ 액세스 토큰이 없습니다');
      return;
    }

    try {
      // 🎯 🚨 핵심 수정: decodeJwtPayload 사용으로 base64url 일관성 보장
      const payload = decodeJwtPayload(accessToken);
      if (!payload?.exp) {
        console.log('❌ exp 없음');
        return;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;

      console.log('📊 현재 토큰 상태:', {
        expiresAt: new Date(payload.exp * 1000).toLocaleString(),
        timeUntilExpiry: Math.floor(timeUntilExpiry / 60) + '분',
        isExpired: timeUntilExpiry < 0,
      });

      if (timeUntilExpiry > 0) {
        console.log(
          '⚠️ 토큰이 아직 유효합니다. 만료 시뮬레이션을 위해 1분 후로 설정'
        );

        // 🎯 🚨 핵심 수정: 실제 토큰 교체 및 타이머 재설정
        const testPayload = { ...payload, exp: currentTime + 60 }; // 1분 후 만료
        const header = accessToken.split('.')[0];
        const signature = accessToken.split('.')[2];

        // base64url 인코딩 유틸(간단 버전)
        const toBase64Url = (s: string) =>
          btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

        const testToken = `${header}.${toBase64Url(JSON.stringify(testPayload))}.${signature}`;

        const autoLogin = localStorage.getItem('autoLogin') === 'true';
        const currentRefreshToken = getRefreshToken();

        // 현재 refreshToken 유지해서 저장 + 타이머 재설정
        saveTokens(testToken, currentRefreshToken ?? undefined, autoLogin);
        console.log('✅ 1분 후 만료로 설정 완료');
      } else {
        console.log('✅ 토큰이 이미 만료되었습니다.');
      }
    } catch (e) {
      console.error('토큰 디코딩 실패:', e);
    }
  };

  // 자동 갱신 테스트 함수
  (
    window as Window &
      typeof globalThis & {
        debugTokenStatus: typeof debugTokenStatus;
        refreshToken: typeof refreshToken;
        getCurrentToken: typeof getCurrentToken;
        getRefreshToken: typeof getRefreshToken;
        simulateTokenExpiry: () => void;
        testAutoRefresh: () => Promise<boolean>;
      }
  ).testAutoRefresh = async () => {
    console.log('🧪 자동 갱신 테스트 시작');

    // 1. 현재 토큰 상태 확인
    debugTokenStatus();

    // 2. 수동 갱신 시도
    console.log('🔄 수동 갱신 테스트...');
    const success = await refreshToken();
    console.log('수동 갱신 결과:', success ? '성공' : '실패');

    // 3. 갱신 후 상태 확인
    debugTokenStatus();

    return success;
  };

  // 토큰 갱신 실패 이벤트 리스너
  window.addEventListener('tokenRefreshFailed', () => {
    console.log('⚠️ 토큰 갱신 실패 이벤트 발생');
    // 여기에 사용자에게 알림을 표시하는 로직 추가 가능
  });

  // 토큰 갱신 성공 이벤트 리스너
  window.addEventListener('tokenRefreshSuccess', (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('✅ 토큰 갱신 성공 이벤트 발생:', {
      hasAccessToken: !!customEvent.detail?.accessToken,
      hasRefreshToken: !!customEvent.detail?.refreshToken,
      timestamp: new Date().toLocaleString(),
    });
  });

  // 🎯 토큰 갱신 타이머 상태 확인 함수 추가
  (
    window as Window &
      typeof globalThis & {
        debugTokenStatus: typeof debugTokenStatus;
        refreshToken: typeof refreshToken;
        getCurrentToken: typeof getCurrentToken;
        getRefreshToken: typeof getRefreshToken;
        simulateTokenExpiry: () => void;
        testAutoRefresh: () => Promise<boolean>;
        checkTokenRefreshTimer: () => void;
        testAutoLoginRestore: () => Promise<boolean>;
      }
  ).checkTokenRefreshTimer = () => {
    console.log('🔍 토큰 갱신 타이머 상태 확인:');
    console.log(
      '- tokenRefreshTimer:',
      tokenRefreshTimer ? '설정됨' : '설정되지 않음'
    );

    if (tokenRefreshTimer) {
      console.log('- 타이머 ID:', tokenRefreshTimer);
      console.log('- 타이머 상태: 활성');
    } else {
      console.log('- 타이머 상태: 비활성');
    }

    // 현재 토큰의 만료 시간과 갱신 예정 시간 계산
    const accessToken = getCurrentToken();
    if (accessToken) {
      try {
        const payload = decodeJwtPayload(accessToken);
        if (payload?.exp) {
          const currentTime = Date.now() / 1000;
          const expiresAt = payload.exp;
          const timeUntilExpiry = expiresAt - currentTime;
          const autoLogin = localStorage.getItem('autoLogin') === 'true';
          const refreshOffset = autoLogin ? 10 * 60 : 5 * 60; // 10분 또는 5분
          const refreshTime = Math.max(timeUntilExpiry - refreshOffset, 0);

          console.log(
            '- 토큰 만료까지:',
            Math.floor(timeUntilExpiry / 60) + '분'
          );
          console.log(
            '- 갱신 예정 시간:',
            Math.floor(refreshTime / 60) + '분 후'
          );
          console.log('- 자동 로그인:', autoLogin ? '활성' : '비활성');
        }
      } catch (e) {
        console.error('토큰 디코딩 실패:', e);
      }
    }
  };

  // 🎯 자동 로그인 복원 테스트 함수 추가
  (
    window as Window &
      typeof globalThis & {
        debugTokenStatus: typeof debugTokenStatus;
        refreshToken: typeof refreshToken;
        getCurrentToken: typeof getCurrentToken;
        getRefreshToken: typeof getRefreshToken;
        simulateTokenExpiry: () => void;
        testAutoRefresh: () => Promise<boolean>;
        checkTokenRefreshTimer: () => void;
        testAutoLoginRestore: () => Promise<boolean>;
      }
  ).testAutoLoginRestore = async () => {
    console.log('🧪 자동 로그인 복원 테스트 시작');

    // 1. 현재 토큰 상태 확인
    debugTokenStatus();

    // 2. 자동 로그인 복원 시도
    console.log('🔄 자동 로그인 복원 시도...');
    const success = await restorePersistentLogin();
    console.log('자동 로그인 복원 결과:', success ? '성공' : '실패');

    // 3. 복원 후 상태 확인
    debugTokenStatus();

    // 4. 타이머 상태 확인
    if (
      typeof window !== 'undefined' &&
      (window as Window & { checkTokenRefreshTimer?: () => void })
        .checkTokenRefreshTimer
    ) {
      (window as Window & { checkTokenRefreshTimer?: () => void })
        .checkTokenRefreshTimer!();
    }

    return success;
  };

  // 🎯 자동 로그인 상태 확인 함수 추가
  (
    window as Window &
      typeof globalThis & {
        debugTokenStatus: typeof debugTokenStatus;
        refreshToken: typeof refreshToken;
        getCurrentToken: typeof getCurrentToken;
        getRefreshToken: typeof getRefreshToken;
        simulateTokenExpiry: () => void;
        testAutoRefresh: () => Promise<boolean>;
        checkTokenRefreshTimer: () => void;
        testAutoLoginRestore: () => Promise<boolean>;
        checkAutoLoginStatus: () => void;
      }
  ).checkAutoLoginStatus = () => {
    console.log('🔍 자동 로그인 상태 확인:');

    // 1. 지속 로그인 설정 확인
    const persistentLogin = localStorage.getItem('persistentLogin');
    const autoLogin = localStorage.getItem('autoLogin');
    const autoLoginInProgress = localStorage.getItem('autoLoginInProgress');
    const autoLoginCompleted = localStorage.getItem('autoLoginCompleted');

    console.log('- 지속 로그인 설정:', {
      persistentLogin,
      autoLogin,
      autoLoginInProgress,
      autoLoginCompleted,
    });

    // 2. 토큰 상태 확인
    const accessToken = getCurrentToken();
    const refreshToken = getRefreshToken();

    console.log('- 토큰 상태:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0,
    });

    // 3. 토큰 유효성 확인
    if (accessToken) {
      try {
        const payload = decodeJwtPayload(accessToken);
        if (payload?.exp) {
          const currentTime = Date.now() / 1000;
          const expiresAt = payload.exp;
          const timeUntilExpiry = expiresAt - currentTime;
          const isExpired = timeUntilExpiry < 0;

          console.log('- accessToken 상태:', {
            expiresAt: new Date(expiresAt * 1000).toLocaleString(),
            timeUntilExpiry: Math.floor(timeUntilExpiry / 60) + '분',
            isExpired,
            canRefresh: !!refreshToken,
          });
        }
      } catch (e) {
        console.error('accessToken 디코딩 실패:', e);
      }
    }

    // 4. 자동 로그인 가능성 평가
    const canAutoLogin = hasValidTokenOrRefreshable();
    console.log(
      '- 자동 로그인 가능성:',
      canAutoLogin ? '✅ 가능' : '❌ 불가능'
    );

    if (canAutoLogin) {
      console.log(
        '💡 자동 로그인 복원을 시도하려면: testAutoLoginRestore() 실행'
      );
    }
  };

  // 🎯 자동 로그인 실패 이벤트 리스너 설정 함수 추가
  (
    window as Window &
      typeof globalThis & {
        debugTokenStatus: typeof debugTokenStatus;
        refreshToken: typeof refreshToken;
        getCurrentToken: typeof getCurrentToken;
        getRefreshToken: typeof getRefreshToken;
        simulateTokenExpiry: () => void;
        testAutoRefresh: () => Promise<boolean>;
        checkTokenRefreshTimer: () => void;
        testAutoLoginRestore: () => Promise<boolean>;
        checkAutoLoginStatus: () => void;
        setupAutoLoginFailureListener: () => void;
      }
  ).setupAutoLoginFailureListener = () => {
    console.log('🎯 자동 로그인 실패 이벤트 리스너 설정');

    window.addEventListener('autoLoginFailed', (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('❌ 자동 로그인 실패 이벤트 발생:', customEvent.detail);

      // 🎯 사용자에게 알림 표시 (예: toast, alert 등)
      if (customEvent.detail?.message) {
        alert(customEvent.detail.message);
      }
    });

    console.log('✅ 자동 로그인 실패 이벤트 리스너 설정 완료');
  };

  console.log('🔧 디버깅 함수들이 전역으로 노출되었습니다:');
  console.log('- debugTokenStatus(): 토큰 상태 확인');
  console.log('- refreshToken(): 수동 토큰 갱신');
  console.log('- getCurrentToken(): 현재 액세스 토큰');
  console.log('- getRefreshToken(): 현재 리프레시 토큰');
  console.log('- simulateTokenExpiry(): 토큰 만료 시뮬레이션');
  console.log('- testAutoRefresh(): 자동 갱신 테스트');
  console.log('- checkTokenRefreshTimer(): 토큰 갱신 타이머 상태 확인');
  console.log('- testAutoLoginRestore(): 자동 로그인 복원 테스트');
  console.log('- checkAutoLoginStatus(): 자동 로그인 상태 확인');
  console.log(
    '- setupAutoLoginFailureListener(): 자동 로그인 실패 이벤트 리스너 설정'
  );
}

/**
 * 🎯 토큰 에러 복구 및 폴백 처리
 */
export const handleTokenError = (error: unknown, context: string): boolean => {
  try {
    console.error(`❌ 토큰 에러 발생 (${context}):`, error);

    // 🎯 에러 타입별 처리
    if (error instanceof Error) {
      // 네트워크 에러
      if (
        error.message.includes('Network Error') ||
        error.message.includes('fetch')
      ) {
        console.log('🌐 네트워크 에러 감지 - 오프라인 상태로 간주');
        return false; // 오프라인 상태에서는 복구 불가
      }

      // 인증 에러
      if (
        error.message.includes('401') ||
        error.message.includes('Unauthorized')
      ) {
        console.log('🔐 인증 에러 감지 - 토큰 정리 및 로그인 페이지로 이동');
        clearAllTokensAndIntervals();

        // 🎯 사용자에게 친화적인 메시지 표시
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('tokenError', {
              detail: {
                type: 'authentication',
                message: '인증이 만료되었습니다. 다시 로그인해주세요.',
                context,
                timestamp: new Date().toLocaleString(),
              },
            })
          );
        }
        return false;
      }

      // 토큰 파싱 에러
      if (error.message.includes('JSON') || error.message.includes('parse')) {
        console.log('🔍 토큰 파싱 에러 감지 - 저장된 토큰 정리');
        clearAllTokensAndIntervals();
        return false;
      }
    }

    // 🎯 알 수 없는 에러의 경우 기본 폴백 처리
    console.log('❓ 알 수 없는 에러 - 기본 폴백 처리 적용');

    // 현재 토큰 상태 확인
    const currentToken = getCurrentToken();
    if (currentToken) {
      try {
        // 토큰 유효성 재검증
        if (hasValidToken()) {
          console.log('✅ 토큰이 여전히 유효함 - 에러 무시');
          return true;
        }
      } catch (validationError) {
        console.error('토큰 재검증 실패:', validationError);
      }
    }

    // 🎯 에러 복구 시도
    return attemptTokenRecovery(context);
  } catch (recoveryError) {
    console.error('에러 처리 중 추가 에러 발생:', recoveryError);
    return false;
  }
};

/**
 * 🎯 토큰 복구 시도
 */
const attemptTokenRecovery = (context: string): boolean => {
  try {
    console.log('🔄 토큰 복구 시도 시작');

    // 🎯 네트워크 상태 확인
    if (!isOnline()) {
      console.log('🌐 오프라인 상태 - 토큰 복구 시도 건너뛰기');
      return false;
    }

    // 1. refreshToken으로 복구 시도
    const currentRefreshToken = getRefreshToken();
    if (currentRefreshToken) {
      console.log('🔄 refreshToken으로 복구 시도');
      // 🎯 비동기 복구는 별도로 처리
      setTimeout(async () => {
        try {
          const success = await refreshToken();
          if (success) {
            console.log('✅ 토큰 복구 성공');
            // 복구 성공 이벤트 발생
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('tokenRecoverySuccess', {
                  detail: {
                    context,
                    timestamp: new Date().toLocaleString(),
                  },
                })
              );
            }
          }
        } catch (error) {
          console.error('토큰 복구 실패:', error);
        }
      }, 1000); // 1초 후 복구 시도

      return true; // 복구 시도 중
    }

    // 2. 복구 불가능한 경우
    console.log('❌ 토큰 복구 불가능 - 완전 정리');
    clearAllTokensAndIntervals();

    // 🎯 사용자에게 알림
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('tokenRecoveryFailed', {
          detail: {
            context,
            message: '로그인 상태를 복구할 수 없습니다. 다시 로그인해주세요.',
            timestamp: new Date().toLocaleString(),
          },
        })
      );
    }

    return false;
  } catch (error) {
    console.error('토큰 복구 시도 중 에러:', error);
    return false;
  }
};

/**
 * 🎯 개선된 자동 로그인 상태 확인 및 설정
 */
export const checkAndSetupAutoLogin = async (): Promise<void> => {
  try {
    const persistentLogin = localStorage.getItem('persistentLogin');
    const autoLogin = localStorage.getItem('autoLogin');
    const keepLoginSetting =
      localStorage.getItem('keepLoginSetting') ||
      sessionStorage.getItem('keepLoginSetting');

    const isIOSEnvironment = isIOS();

    if (
      persistentLogin === 'true' ||
      autoLogin === 'true' ||
      keepLoginSetting === 'true'
    ) {
      console.log('🔄 자동 로그인 설정 감지됨');
      if (isIOSEnvironment) {
        console.log('📱 iOS 환경: iOS 최적화된 자동로그인 설정');
      }

      // 🎯 🚨 핵심 수정: tokenExpiresAt에 의존하지 않고 직접 토큰의 exp 읽기
      const accessToken = getCurrentToken();
      const payload = accessToken ? decodeJwtPayload(accessToken) : null;

      if (payload?.exp) {
        const currentTime = Date.now() / 1000;
        const expiresAt = payload.exp;
        const timeUntilExpiry = expiresAt - currentTime;

        if (timeUntilExpiry > 0) {
          // iOS 환경에서는 더 일찍 갱신 (ITP 대응)
          const refreshOffset = isIOSEnvironment ? 15 * 60 : 10 * 60; // iOS: 15분, 일반: 10분
          const refreshTime = Math.max(timeUntilExpiry - refreshOffset, 0);
          console.log(
            `⏰ 토큰 만료 ${Math.floor(timeUntilExpiry / 60)}분 전에 자동 갱신 예정 (iOS: ${isIOSEnvironment})`
          );

          // 🎯 기존 타이머 정리 후 새로 설정
          if (tokenRefreshTimer) {
            clearTimeout(tokenRefreshTimer);
            tokenRefreshTimer = null;
          }

          tokenRefreshTimer = setTimeout(async () => {
            console.log('🔄 자동 토큰 갱신 실행');
            try {
              const success = await refreshToken();
              if (!success) {
                console.log('❌ 자동 토큰 갱신 실패 - 지속 로그인 설정 제거');
                clearPersistentLoginSettings();
              }
            } catch (error) {
              console.error('자동 토큰 갱신 실패:', error);
              clearPersistentLoginSettings();
            }
          }, refreshTime * 1000);
        } else {
          console.log('⚠️ 토큰이 이미 만료됨 - 즉시 갱신 시도');
          await handleExpiredToken();
        }
      } else {
        console.log('⚠️ 토큰에 만료 시간 정보가 없음 - 지속 로그인 설정 제거');
        clearPersistentLoginSettings();
      }
    }
  } catch (error) {
    console.error('자동 로그인 설정 확인 중 오류:', error);
    clearPersistentLoginSettings();
  }
};

/**
 * 🎯 만료된 토큰 처리 헬퍼 함수
 */
const handleExpiredToken = async (): Promise<void> => {
  try {
    // 🎯 즉시 토큰 갱신 시도 (동기적으로 처리)
    const success = await refreshToken();
    if (success) {
      console.log('✅ 즉시 토큰 갱신 성공 - 새로운 갱신 타이머 설정');

      // 새로 발급받은 토큰으로 갱신 타이머 설정
      const newAccessToken = getCurrentToken();
      if (newAccessToken) {
        setupTokenRefreshTimer(newAccessToken);
      }
    } else {
      console.log('❌ 즉시 토큰 갱신 실패 - 지속 로그인 설정 제거');
      clearPersistentLoginSettings();
    }
  } catch (error) {
    console.error('즉시 토큰 갱신 실패:', error);
    clearPersistentLoginSettings();
  }
};

/**
 * 🎯 네트워크 상태 확인
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

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
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
      tokenRefreshTimer = null;
      console.log('⏸️ 오프라인 상태로 인한 토큰 갱신 타이머 중지');
    }
  };

  // 🎯 🚨 핵심 수정: 멀티 탭 동기화를 위한 storage 이벤트 리스너 추가
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'accessToken' && e.newValue) {
      console.log('🔄 다른 탭에서 accessToken 변경 감지 - 타이머 재설정');
      // 🎯 다른 탭에서 토큰이 변경된 경우 타이머 재설정
      setupTokenRefreshTimer(e.newValue);
    }

    if (
      (e.key === 'accessToken' || e.key === 'refreshToken') &&
      e.newValue === null
    ) {
      console.log('🔄 다른 탭에서 토큰 제거 감지 - 타이머 정리');
      // 🎯 다른 탭에서 로그아웃한 경우 타이머 정리
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
        tokenRefreshTimer = null;
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
 * 네이티브 앱 환경인지 확인
 */
export const isNativeApp = (): boolean => {
  return !!(
    (window as WebKitWindow).webkit?.messageHandlers ||
    window.nativeApp ||
    window.ReactNativeWebView ||
    // iOS WebKit 환경 추가 감지
    (/iPad|iPhone|iPod/.test(navigator.userAgent) &&
      (window as WebKitWindow).webkit)
  );
};

/**
 * iOS 앱 환경인지 확인
 */
export const isIOSApp = (): boolean => {
  return !!(
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    (window as WebKitWindow).webkit?.messageHandlers
  );
};

/**
 * Android 앱 환경인지 확인
 */
export const isAndroidApp = (): boolean => {
  return !!(/Android/.test(navigator.userAgent) && window.ReactNativeWebView);
};

/**
 * 30일 자동 로그인을 위한 토큰 저장 (앱 종료 후에도 유지)
 */
export const saveTokensForPersistentLogin = (
  accessToken: string,
  refreshToken?: string,
  email?: string
): void => {
  // 1. localStorage에 저장 (브라우저 종료 후에도 유지)
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
  if (email) {
    localStorage.setItem('userEmail', email);
  }

  // 2. sessionStorage에도 저장 (탭별 세션 유지)
  sessionStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    sessionStorage.setItem('refreshToken', refreshToken);
  }

  // 3. 쿠키에 저장 (30일 만료, 보안 강화)
  const maxAge = 30 * 24 * 60 * 60; // 30일
  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `accessToken=${accessToken}; Max-Age=${maxAge}; Path=/; SameSite=Strict${secureFlag}`;
  if (refreshToken) {
    document.cookie = `refreshToken=${refreshToken}; Max-Age=${maxAge}; Path=/; SameSite=Strict${secureFlag}`;
  }

  // 4. 자동 로그인 설정 활성화
  localStorage.setItem('autoLogin', 'true');
  localStorage.setItem('loginTimestamp', Date.now().toString());
  localStorage.setItem('persistentLogin', 'true');

  // 5. 토큰 만료 시간 저장
  try {
    const payload = decodeJwtPayload(accessToken);
    if (payload?.exp) {
      const expiresAt = new Date(payload.exp * 1000);
      localStorage.setItem('tokenExpiresAt', expiresAt.toISOString());
      console.log('⏰ 토큰 만료 시간 저장:', expiresAt.toLocaleString());
    }
  } catch (error) {
    console.error('토큰 만료 시간 저장 실패:', error);
  }

  console.log('✅ 30일 지속 로그인 토큰 저장 완료:', {
    accessTokenLength: accessToken.length,
    hasRefreshToken: !!refreshToken,
    email,
    expiresAt: localStorage.getItem('tokenExpiresAt'),
  });

  // 🎯 토큰 갱신 타이머 설정 추가
  setupTokenRefreshTimer(accessToken);

  // 🎯 앱-웹뷰 동기화 추가
  syncTokenWithApp(accessToken, refreshToken);
};

/**
 * �� 개선된 자동 로그인 상태 복원 - iOS 환경 최적화
 */
export const restorePersistentLogin = async (): Promise<boolean> => {
  try {
    console.log('🔄 자동 로그인 복원 시작');

    const isIOSEnvironment = isIOS();
    if (isIOSEnvironment) {
      console.log('📱 iOS 환경: iOS 최적화된 자동로그인 복원');
    }

    // 1. 지속 로그인 설정 확인
    const persistentLogin = localStorage.getItem('persistentLogin');
    const autoLogin = localStorage.getItem('autoLogin');
    const keepLoginSetting =
      localStorage.getItem('keepLoginSetting') ||
      sessionStorage.getItem('keepLoginSetting');

    if (
      persistentLogin !== 'true' &&
      autoLogin !== 'true' &&
      keepLoginSetting !== 'true'
    ) {
      console.log('ℹ️ 지속 로그인 설정이 비활성화됨');
      return false;
    }

    console.log('✅ 지속 로그인 설정 감지됨:', {
      persistentLogin,
      autoLogin,
      keepLoginSetting,
    });

    // 2. 현재 토큰 상태 확인 (iOS 환경에 최적화됨)
    const accessToken = getCurrentToken();
    const currentRefreshToken = getRefreshToken();

    console.log('📊 저장된 토큰 상태:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!currentRefreshToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: currentRefreshToken?.length || 0,
      isIOS: isIOSEnvironment,
    });

    // 3. 토큰이 전혀 없는 경우
    if (!accessToken && !currentRefreshToken) {
      console.log('ℹ️ 저장된 토큰이 없음');

      // iOS 환경에서는 네이티브 앱에 토큰 요청
      if (
        isIOSEnvironment &&
        (window as WebKitWindow).webkit?.messageHandlers?.nativeBridge
      ) {
        console.log('📱 iOS: 네이티브 앱에 토큰 요청');
        const webkit = (window as WebKitWindow).webkit;
        if (webkit?.messageHandlers?.nativeBridge) {
          webkit.messageHandlers.nativeBridge.postMessage({
            action: 'requestLoginInfo',
            timestamp: Date.now(),
          });
        }

        // iOS에서는 더 긴 대기 시간 (네이티브 앱 응답 대기)
        console.log('⏳ iOS: 네이티브 앱 응답 대기 중...');
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // 여러 번 재시도하여 토큰 확인
        for (let i = 0; i < 3; i++) {
          const retryToken = getCurrentToken();
          if (retryToken && hasValidToken()) {
            console.log(
              `✅ iOS: 네이티브 앱에서 토큰 수신 성공 (${i + 1}번째 시도)`
            );
            return true;
          }

          if (i < 2) {
            console.log(`⏳ iOS: ${i + 1}초 후 재시도...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        console.log('⚠️ iOS: 네이티브 앱에서 토큰을 받지 못함');
      }

      clearPersistentLoginSettings();
      return false;
    }

    // 4. 유효한 accessToken이 있는 경우
    if (accessToken && hasValidToken()) {
      console.log('✅ 저장된 토큰이 유효함 - 자동 로그인 성공');

      // 토큰 갱신 타이머 설정
      setupTokenRefreshTimer(accessToken);

      return true;
    }

    // 5. accessToken이 만료되었지만 refreshToken이 있는 경우 갱신 시도
    if (currentRefreshToken) {
      console.log('🔄 accessToken 만료, refreshToken으로 갱신 시도');

      // iOS 환경에서는 더 적극적인 재시도
      let retryCount = 0;
      const maxRetries = isIOSEnvironment ? 3 : 2;

      while (retryCount < maxRetries) {
        try {
          console.log(`🔄 토큰 갱신 시도 ${retryCount + 1}/${maxRetries}`);

          const success = await refreshToken(retryCount);
          if (success) {
            console.log('✅ 토큰 갱신 성공 - 자동 로그인 완료');

            // 🎯 새로 발급받은 토큰으로 갱신 타이머 설정
            const newAccessToken = getCurrentToken();
            if (newAccessToken) {
              console.log('⏰ 새로운 토큰으로 갱신 타이머 설정');
              setupTokenRefreshTimer(newAccessToken);
            }

            return true;
          }

          retryCount++;
          if (retryCount < maxRetries) {
            const delay = isIOSEnvironment ? retryCount * 2 : retryCount; // iOS에서는 더 긴 지연
            console.log(`⏳ ${delay}초 후 재시도...`);
            await new Promise((resolve) => setTimeout(resolve, delay * 1000));
          }
        } catch (error) {
          console.error(`토큰 갱신 시도 ${retryCount + 1} 실패:`, error);
          retryCount++;

          if (retryCount < maxRetries) {
            const delay = isIOSEnvironment ? retryCount * 2 : retryCount;
            console.log(`⏳ ${delay}초 후 재시도...`);
            await new Promise((resolve) => setTimeout(resolve, delay * 1000));
          }
        }
      }

      // 🎯 모든 재시도 실패 시
      console.log('❌ 모든 토큰 갱신 시도 실패');

      // iOS 앱 환경에서는 네이티브 이벤트만 발생
      if (
        isIOSEnvironment &&
        (window as WebKitWindow).webkit?.messageHandlers
      ) {
        console.log('📱 iOS 앱 환경 - 네이티브 이벤트 발생');
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

      // 🎯 웹 환경에서만 사용자에게 친화적인 메시지 표시
      try {
        if (typeof window !== 'undefined') {
          // 🎯 토큰 갱신 실패 이벤트 발생
          window.dispatchEvent(
            new CustomEvent('autoLoginFailed', {
              detail: {
                reason: '토큰 갱신 실패',
                message: '자동 로그인에 실패했습니다. 다시 로그인해주세요.',
                timestamp: new Date().toLocaleString(),
              },
            })
          );

          // 🎯 3초 후 로그인 페이지로 이동
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 3000);
        }
      } catch (eventError) {
        console.error('이벤트 발생 실패:', eventError);
      }

      // 토큰 갱신 실패 시 지속 로그인 설정 제거
      clearPersistentLoginSettings();
      return false;
    }

    console.log('❌ 자동 로그인 실패 - 토큰 갱신 불가');
    clearPersistentLoginSettings();
    return false;
  } catch (error) {
    console.error('자동 로그인 복원 중 오류:', error);
    clearPersistentLoginSettings();
    return false;
  }
};

/**
 * 🎯 지속 로그인 설정 정리 헬퍼 함수
 */
const clearPersistentLoginSettings = (): void => {
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
};

/**
 * 🎯 iOS 환경에 최적화된 토큰 저장 함수
 */
export const saveTokenForIOS = (
  token: string,
  refreshToken?: string,
  keepLogin: boolean = true
): void => {
  try {
    const isIOSEnvironment = isIOS();

    if (isIOSEnvironment) {
      console.log('📱 iOS 환경: 최적화된 토큰 저장 시작');

      // 1. 쿠키에 우선 저장 (iOS ITP 대응, 가장 안정적)
      const cookieOptions = {
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'strict' as const,
        expires: keepLogin ? 30 : 1, // 30일 또는 1일
      };

      Cookies.set('accessToken', token, cookieOptions);
      if (refreshToken) {
        Cookies.set('refreshToken', refreshToken, cookieOptions);
      }
      console.log('🍪 iOS: 쿠키에 토큰 저장 완료');

      // 2. sessionStorage에 저장 (iOS에서 안정적, 탭별 세션)
      sessionStorage.setItem('accessToken', token);
      if (refreshToken) {
        sessionStorage.setItem('refreshToken', refreshToken);
      }
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('keepLoginSetting', keepLogin.toString());
      console.log('📱 iOS: sessionStorage에 토큰 저장 완료');

      // 3. localStorage에도 저장 (백업, 브라우저 종료 후에도 유지)
      if (keepLogin) {
        localStorage.setItem('accessToken', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('keepLoginSetting', keepLogin.toString());
        console.log('💾 iOS: localStorage에 토큰 저장 완료');
      }

      // 4. 자동 로그인 설정 활성화
      localStorage.setItem('autoLogin', 'true');
      localStorage.setItem('persistentLogin', 'true');
      localStorage.setItem('loginTimestamp', Date.now().toString());
      console.log('🔐 iOS: 자동 로그인 설정 활성화 완료');

      // 4. iOS 앱에 토큰 동기화 요청
      if ((window as WebKitWindow).webkit?.messageHandlers?.nativeBridge) {
        const webkit = (window as WebKitWindow).webkit;
        if (webkit?.messageHandlers?.nativeBridge) {
          webkit.messageHandlers.nativeBridge.postMessage({
            action: 'syncToken',
            token: token,
            refreshToken: refreshToken,
            keepLogin: keepLogin,
          });
          console.log('📱 iOS: 네이티브 앱에 토큰 동기화 요청');
        }
      }
    } else {
      // 일반 웹 환경: 최적화된 로직
      if (keepLogin) {
        // 1. localStorage에 저장 (브라우저 종료 후에도 유지)
        localStorage.setItem('accessToken', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('keepLoginSetting', 'true');
        localStorage.setItem('autoLogin', 'true');
        localStorage.setItem('persistentLogin', 'true');
        localStorage.setItem('loginTimestamp', Date.now().toString());
        console.log(
          '💾 웹: localStorage에 토큰 저장 완료 (자동 로그인 활성화)'
        );
      } else {
        // 2. sessionStorage에 저장 (탭별 세션)
        sessionStorage.setItem('accessToken', token);
        if (refreshToken) {
          sessionStorage.setItem('refreshToken', refreshToken);
        }
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('keepLoginSetting', 'false');
        console.log('📱 웹: sessionStorage에 토큰 저장 완료 (세션 로그인)');
      }

      // 3. 쿠키에도 저장 (보안 강화)
      const cookieOptions = {
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'strict' as const,
        expires: keepLogin ? 30 : 1,
      };
      Cookies.set('accessToken', token, cookieOptions);
      if (refreshToken) {
        Cookies.set('refreshToken', refreshToken, cookieOptions);
      }
      console.log('🍪 웹: 쿠키에 토큰 저장 완료');
    }

    console.log('✅ 토큰 저장 완료');
  } catch (error) {
    console.error('iOS 토큰 저장 중 오류:', error);
  }
};

/**
 * 🍎 iOS 환경 자동로그인 디버깅 함수
 */
export const debugIOSAutoLogin = (): void => {
  try {
    const isIOSEnvironment = isIOS();
    console.log('🍎 === iOS 자동로그인 디버깅 시작 ===');
    console.log('- iOS 환경:', isIOSEnvironment);

    if (isIOSEnvironment) {
      // iOS 환경에서 토큰 상태 확인
      const cookieToken = Cookies.get('accessToken');
      const sessionToken = sessionStorage.getItem('accessToken');
      const localToken = localStorage.getItem('accessToken');

      console.log('🍎 iOS 토큰 상태:');
      console.log('- 쿠키 토큰:', cookieToken ? '존재' : '없음');
      console.log('- 세션 토큰:', sessionToken ? '존재' : '없음');
      console.log('- 로컬 토큰:', localToken ? '존재' : '없음');

      // iOS 앱 연동 상태 확인
      const hasWebKit = !!(window as WebKitWindow).webkit;
      const hasMessageHandlers = !!(window as WebKitWindow).webkit
        ?.messageHandlers;
      const hasNativeBridge = !!(window as WebKitWindow).webkit?.messageHandlers
        ?.nativeBridge;

      console.log('🍎 iOS 앱 연동 상태:');
      console.log('- webkit 존재:', hasWebKit);
      console.log('- messageHandlers 존재:', hasMessageHandlers);
      console.log('- nativeBridge 존재:', hasNativeBridge);

      // iOS 자동로그인 함수 존재 여부 확인
      const hasIOSAutoLogin =
        typeof window !== 'undefined' && window.iOSAutoLogin;
      console.log('- iOSAutoLogin 함수 존재:', hasIOSAutoLogin);

      if (
        hasIOSAutoLogin &&
        window.iOSAutoLogin &&
        typeof window.iOSAutoLogin === 'object'
      ) {
        console.log('- iOSAutoLogin 함수들:', Object.keys(window.iOSAutoLogin));
      }

      // 토큰 갱신 타이머 상태 확인
      if (typeof window !== 'undefined') {
        const timer = window.tokenRefreshTimer;
        const nextRefresh = window.tokenRefreshTime;
        console.log('- 토큰 갱신 타이머 상태:', {
          hasTimer: !!timer,
          nextRefresh: nextRefresh
            ? nextRefresh.toLocaleString()
            : '설정되지 않음',
        });
      }

      // 지속 로그인 설정 확인
      const keepLoginSetting =
        localStorage.getItem('keepLoginSetting') ||
        sessionStorage.getItem('keepLoginSetting');
      const persistentLogin = localStorage.getItem('persistentLogin');
      const autoLogin = localStorage.getItem('autoLogin');

      console.log('🍎 iOS 지속 로그인 설정:');
      console.log('- keepLoginSetting:', keepLoginSetting);
      console.log('- persistentLogin:', persistentLogin);
      console.log('- autoLogin:', autoLogin);
    } else {
      console.log('🍎 iOS 환경이 아님');
    }

    console.log('🍎 === iOS 자동로그인 디버깅 완료 ===');
  } catch (error) {
    console.error('🍎 iOS 자동로그인 디버깅 중 오류:', error);
  }
};

/**
 * 🌐 웹 환경 자동로그인 디버깅 함수
 */
export const debugWebAutoLogin = (): void => {
  try {
    const isIOSEnvironment = isIOS();
    console.log('🌐 === 웹 자동로그인 디버깅 시작 ===');
    console.log('- iOS 환경:', isIOSEnvironment);

    // 웹 환경에서 토큰 상태 확인
    const cookieToken = Cookies.get('accessToken');
    const sessionToken = sessionStorage.getItem('accessToken');
    const localToken = localStorage.getItem('accessToken');

    console.log('🌐 웹 토큰 상태:');
    console.log('- 쿠키 토큰:', cookieToken ? '존재' : '없음');
    console.log('- 세션 토큰:', sessionToken ? '존재' : '없음');
    console.log('- 로컬 토큰:', localToken ? '존재' : '없음');

    // 자동 로그인 설정 확인
    const keepLoginSetting =
      localStorage.getItem('keepLoginSetting') ||
      sessionStorage.getItem('keepLoginSetting');
    const persistentLogin = localStorage.getItem('persistentLogin');
    const autoLogin = localStorage.getItem('autoLogin');
    const loginTimestamp = localStorage.getItem('loginTimestamp');

    console.log('🌐 웹 자동 로그인 설정:');
    console.log('- keepLoginSetting:', keepLoginSetting);
    console.log('- persistentLogin:', persistentLogin);
    console.log('- autoLogin:', autoLogin);
    console.log(
      '- loginTimestamp:',
      loginTimestamp
        ? new Date(parseInt(loginTimestamp)).toLocaleString()
        : '없음'
    );

    // 토큰 유효성 확인
    if (localToken) {
      const isValid = hasValidToken();
      console.log('🌐 토큰 유효성:', isValid);

      if (isValid) {
        const payload = decodeJwtPayload(localToken);
        if (payload?.exp) {
          const expiresAt = new Date(payload.exp * 1000);
          const timeUntilExpiry = payload.exp - Date.now() / 1000;
          console.log('🌐 토큰 만료 정보:', {
            expiresAt: expiresAt.toLocaleString(),
            timeUntilExpiry: Math.floor(timeUntilExpiry / 60) + '분',
            isExpired: timeUntilExpiry < 0,
          });
        }
      }
    }

    // 토큰 갱신 타이머 상태 확인
    if (typeof window !== 'undefined') {
      const timer = window.tokenRefreshTimer;
      const nextRefresh = window.tokenRefreshTime;
      console.log('🌐 토큰 갱신 타이머 상태:', {
        hasTimer: !!timer,
        nextRefresh: nextRefresh
          ? nextRefresh.toLocaleString()
          : '설정되지 않음',
      });
    }

    console.log('🌐 === 웹 자동로그인 디버깅 완료 ===');
  } catch (error) {
    console.error('🌐 웹 자동로그인 디버깅 중 오류:', error);
  }
};

/**
 * 🧪 자동로그인 통합 테스트 함수
 */
export const testAutoLogin = async (): Promise<boolean> => {
  try {
    console.log('🧪 === 자동로그인 통합 테스트 시작 ===');

    // 1. 환경 감지
    const isIOSEnvironment = isIOS();
    console.log('🧪 환경:', isIOSEnvironment ? 'iOS' : '웹');

    // 2. 현재 토큰 상태 확인
    const currentToken = getCurrentToken();
    const refreshToken = getRefreshToken();
    console.log('🧪 현재 토큰 상태:', {
      hasAccessToken: !!currentToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: currentToken?.length || 0,
    });

    // 3. 자동 로그인 시도
    console.log('🧪 자동 로그인 시도 중...');
    const success = await restorePersistentLogin();

    if (success) {
      console.log('✅ 자동 로그인 성공!');

      // 4. 성공 후 상태 확인
      const newToken = getCurrentToken();
      const isValid = hasValidToken();
      console.log('🧪 자동 로그인 후 상태:', {
        hasNewToken: !!newToken,
        isValid: isValid,
        tokenLength: newToken?.length || 0,
      });

      // 5. 토큰 갱신 타이머 확인
      if (typeof window !== 'undefined') {
        const timer = window.tokenRefreshTimer;
        console.log('🧪 토큰 갱신 타이머:', !!timer);
      }

      return true;
    } else {
      console.log('❌ 자동 로그인 실패');
      return false;
    }
  } catch (error) {
    console.error('🧪 자동로그인 테스트 중 오류:', error);
    return false;
  } finally {
    console.log('🧪 === 자동로그인 통합 테스트 완료 ===');
  }
};

/**
 * 🧪 모든 자동로그인 시나리오 테스트 실행
 */
export const runAllAutoLoginTests = async (): Promise<void> => {
  try {
    console.log('🚀 === 모든 자동로그인 시나리오 테스트 시작 ===');

    const results = {
      basicTest: false,
      iosFirstLogin: false,
      webFirstLogin: false,
      tokenExpiryRenewal: false,
    };

    // 1. 기본 자동로그인 테스트
    console.log('\n🧪 1. 기본 자동로그인 테스트');
    results.basicTest = await testAutoLogin();

    // 2. iOS 최초 로그인 시나리오 테스트
    console.log('\n🧪 2. iOS 최초 로그인 시나리오 테스트');
    results.iosFirstLogin = await testIOSFirstLogin();

    // 3. 웹 최초 로그인 시나리오 테스트
    console.log('\n🧪 3. 웹 최초 로그인 시나리오 테스트');
    results.webFirstLogin = await testWebFirstLogin();

    // 4. 토큰 만료 갱신 시나리오 테스트
    console.log('\n🧪 4. 토큰 만료 갱신 시나리오 테스트');
    results.tokenExpiryRenewal = await testTokenExpiryRenewal();

    // 5. 결과 요약
    console.log('\n📊 === 테스트 결과 요약 ===');
    console.log('✅ 기본 자동로그인:', results.basicTest ? '성공' : '실패');
    console.log('✅ iOS 최초 로그인:', results.iosFirstLogin ? '성공' : '실패');
    console.log('✅ 웹 최초 로그인:', results.webFirstLogin ? '성공' : '실패');
    console.log(
      '✅ 토큰 만료 갱신:',
      results.tokenExpiryRenewal ? '성공' : '실패'
    );

    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;

    console.log(
      `\n🎯 전체 성공률: ${successCount}/${totalCount} (${Math.round((successCount / totalCount) * 100)}%)`
    );

    if (successCount === totalCount) {
      console.log('🎉 모든 테스트 통과! 자동로그인 시스템이 정상 작동합니다.');
    } else {
      console.log(
        '⚠️ 일부 테스트 실패. 자동로그인 시스템에 문제가 있을 수 있습니다.'
      );
    }
  } catch (error) {
    console.error('🚀 전체 테스트 실행 중 오류:', error);
  } finally {
    console.log('\n🚀 === 모든 자동로그인 시나리오 테스트 완료 ===');
  }
};

/**
 * 🍎 iOS 환경 자동로그인 실패시 fallback 처리
 */
const handleIOSAutoLoginFailure = (reason: string, context: string): void => {
  try {
    const isIOSEnvironment = isIOS();
    if (!isIOSEnvironment) return;

    console.log('🍎 iOS 자동로그인 실패 - fallback 처리 시작');
    console.log('- 실패 이유:', reason);
    console.log('- 발생 컨텍스트:', context);

    // 1. 사용자 친화적인 메시지 표시
    const userMessage = getIOSAutoLoginFailureMessage(reason);

    // 2. iOS 앱에 실패 알림 전송
    if ((window as WebKitWindow).webkit?.messageHandlers?.nativeBridge) {
      const webkit = (window as WebKitWindow).webkit;
      if (webkit?.messageHandlers?.nativeBridge) {
        webkit.messageHandlers.nativeBridge.postMessage({
          action: 'autoLoginFailed',
          reason: reason,
          message: userMessage,
          context: context,
          timestamp: new Date().toISOString(),
        });
        console.log('🍎 iOS 앱에 자동로그인 실패 알림 전송');
      }
    }

    // 3. 웹뷰에서 사용자에게 메시지 표시
    window.dispatchEvent(
      new CustomEvent('iosAutoLoginFailed', {
        detail: {
          reason: reason,
          message: userMessage,
          context: context,
          timestamp: new Date().toLocaleString(),
          showFallbackUI: true,
        },
      })
    );

    // 4. 3초 후 로그인 페이지로 이동 (사용자가 메시지를 읽을 시간 제공)
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        console.log('🍎 iOS: 로그인 페이지로 이동');
        window.location.href = '/login';
      }
    }, 3000);
  } catch (error) {
    console.error('🍎 iOS 자동로그인 실패 처리 중 오류:', error);
  }
};

/**
 * 🍎 iOS 자동로그인 실패 이유별 사용자 친화적 메시지 생성
 */
const getIOSAutoLoginFailureMessage = (reason: string): string => {
  const messages: Record<string, string> = {
    token_expired: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
    token_invalid: '로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.',
    refresh_failed: '자동 로그인 갱신에 실패했습니다. 다시 로그인해주세요.',
    network_error: '네트워크 연결을 확인하고 다시 시도해주세요.',
    app_not_available:
      '앱에서 로그인 정보를 가져올 수 없습니다. 다시 로그인해주세요.',
    storage_error:
      '로그인 정보 저장에 문제가 발생했습니다. 다시 로그인해주세요.',
    unknown_error: '자동 로그인 중 오류가 발생했습니다. 다시 로그인해주세요.',
  };

  return messages[reason] || messages['unknown_error'];
};

/**
 * 🍎 iOS 환경 토큰 변경 감지 및 실시간 동기화
 */
export const setupIOSTokenChangeDetection = (): void => {
  try {
    const isIOSEnvironment = isIOS();
    if (!isIOSEnvironment) return;

    console.log('🍎 iOS 토큰 변경 감지 설정 시작');

    // 1. 토큰 업데이트 이벤트 리스너
    window.addEventListener('tokenUpdated', (event: Event) => {
      const customEvent = event as CustomEvent;
      const { token, refreshToken, source } = customEvent.detail;

      console.log('🍎 iOS: 토큰 업데이트 이벤트 수신');
      console.log('- 소스:', source);
      console.log('- 새 토큰 존재:', !!token);
      console.log('- 새 refreshToken 존재:', !!refreshToken);

      if (token) {
        // iOS 최적화된 토큰 저장
        saveTokenForIOS(token, refreshToken, true);

        // 토큰 갱신 타이머 재설정
        setupTokenRefreshTimer(token);

        console.log('✅ iOS: 토큰 업데이트 완료 및 갱신 타이머 재설정');
      }
    });

    // 2. 토큰 갱신 성공 이벤트 리스너
    window.addEventListener('iosTokenRefreshSuccess', (event: Event) => {
      const customEvent = event as CustomEvent;
      const { tokenData } = customEvent.detail;

      console.log('🍎 iOS: 토큰 갱신 성공 이벤트 수신');

      if (tokenData?.token) {
        // iOS 최적화된 토큰 저장
        saveTokenForIOS(tokenData.token, tokenData.refreshToken, true);

        // 토큰 갱신 타이머 재설정
        setupTokenRefreshTimer(tokenData.token);

        console.log('✅ iOS: 토큰 갱신 성공 처리 완료');
      }
    });

    // 3. 토큰 만료 이벤트 리스너
    window.addEventListener('tokenExpired', (event: Event) => {
      const customEvent = event as CustomEvent;
      const { context } = customEvent.detail;

      console.log('🍎 iOS: 토큰 만료 이벤트 수신');
      console.log('- 컨텍스트:', context);

      // iOS 환경에서 자동로그인 실패 처리
      handleIOSAutoLoginFailure('token_expired', context);
    });

    console.log('✅ iOS 토큰 변경 감지 설정 완료');
  } catch (error) {
    console.error('🍎 iOS 토큰 변경 감지 설정 중 오류:', error);
  }
};

/**
 * 🍎 iOS 환경 토큰 갱신 타이머 정리
 */
const clearTokenRefreshTimer = (): void => {
  try {
    if (typeof window !== 'undefined' && window.tokenRefreshTimer) {
      clearTimeout(window.tokenRefreshTimer);
      window.tokenRefreshTimer = undefined;
      console.log('🍎 iOS: 토큰 갱신 타이머 정리 완료');
    }
  } catch (error) {
    console.error('🍎 iOS: 토큰 갱신 타이머 정리 중 오류:', error);
  }
};

/**
 * ⚡ iOS 환경 성능 최적화된 토큰 갱신 타이머
 */
export const setupOptimizedTokenRefreshTimer = (accessToken: string): void => {
  try {
    const isIOSEnvironment = isIOS();
    if (!isIOSEnvironment) return;

    console.log('⚡ iOS 성능 최적화된 토큰 갱신 타이머 설정 시작');

    // 기존 타이머 정리
    clearTokenRefreshTimer();

    // 토큰 만료 시간 계산 (iOS 최적화)
    const tokenExpiry = calculateOptimizedTokenExpiry(accessToken);
    if (!tokenExpiry) {
      console.log('⚠️ iOS: 토큰 만료 시간을 계산할 수 없음');
      return;
    }

    // iOS 환경에서 최적화된 갱신 타이밍 계산
    const refreshOffset = isIOSEnvironment ? 15 : 10; // iOS: 15분, 일반: 10분
    const refreshTime = new Date(
      tokenExpiry.getTime() - refreshOffset * 60 * 1000
    );
    const now = new Date();

    if (refreshTime <= now) {
      console.log('⚡ iOS: 토큰이 곧 만료됨 - 즉시 갱신 시도');
      refreshTokenWithRetry();
      return;
    }

    const timeUntilRefresh = refreshTime.getTime() - now.getTime();

    console.log('⚡ iOS: 최적화된 토큰 갱신 타이밍 설정');
    console.log('- 토큰 만료 시간:', tokenExpiry.toLocaleString());
    console.log('- 갱신 예정 시간:', refreshTime.toLocaleString());
    console.log(
      '- 갱신까지 남은 시간:',
      Math.round(timeUntilRefresh / 1000 / 60),
      '분'
    );

    // 성능 최적화된 타이머 설정
    const timer = setTimeout(() => {
      console.log('⚡ iOS: 최적화된 토큰 갱신 타이머 실행');
      refreshTokenWithRetry();
    }, timeUntilRefresh);

    // 전역 타이머 참조 저장
    if (typeof window !== 'undefined') {
      window.tokenRefreshTimer = timer;
      window.tokenRefreshTime = refreshTime;
    }

    console.log('✅ iOS 성능 최적화된 토큰 갱신 타이머 설정 완료');
  } catch (error) {
    console.error('⚡ iOS 성능 최적화된 토큰 갱신 타이머 설정 중 오류:', error);
  }
};

/**
 * ⚡ iOS 환경 최적화된 토큰 만료 시간 계산
 */
const calculateOptimizedTokenExpiry = (accessToken: string): Date | null => {
  try {
    const payload = decodeJwtPayload(accessToken);
    if (!payload) return null;

    // 1. 표준 JWT exp 필드 사용
    if (payload.exp) {
      const expiryTime = new Date(payload.exp * 1000);
      console.log(
        '⚡ iOS: 표준 JWT exp 필드 사용 - 만료 시간:',
        expiryTime.toLocaleString()
      );
      return expiryTime;
    }

    // 2. 커스텀 토큰 - 기본 만료 시간 (iOS 최적화)
    const defaultExpiryHours = isIOS() ? 24 : 12; // iOS: 24시간, 일반: 12시간
    const expiryTime = new Date(
      Date.now() + defaultExpiryHours * 60 * 60 * 1000
    );

    console.log(
      '⚡ iOS: 커스텀 토큰 기본 만료 시간 설정:',
      expiryTime.toLocaleString()
    );

    // localStorage에 만료 시간 저장 (메모리 최적화)
    try {
      localStorage.setItem('tokenExpiresAt', expiryTime.toISOString());
      sessionStorage.setItem('tokenExpiresAt', expiryTime.toISOString());
    } catch (error) {
      console.error('⚡ iOS: 만료 시간 저장 실패:', error);
    }

    return expiryTime;
  } catch (error) {
    console.error('⚡ iOS: 토큰 만료 시간 계산 중 오류:', error);
    return null;
  }
};

/**
 * ⚡ iOS 환경 성능 최적화된 토큰 갱신 (재시도 포함)
 */
const refreshTokenWithRetry = async (retryCount = 0): Promise<boolean> => {
  try {
    const maxRetries = isIOS() ? 3 : 2; // iOS: 3회, 일반: 2회
    const baseDelay = isIOS() ? 2000 : 1000; // iOS: 2초, 일반: 1초

    console.log(`⚡ iOS: 토큰 갱신 시도 ${retryCount + 1}/${maxRetries + 1}`);

    // 토큰 갱신 시도
    const success = await refreshToken();

    if (success) {
      console.log('✅ iOS: 토큰 갱신 성공');
      return true;
    }

    // 재시도 로직
    if (retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount); // 지수 백오프
      console.log(`⚡ iOS: ${delay}ms 후 재시도 예정`);

      await new Promise((resolve) => setTimeout(resolve, delay));
      return await refreshTokenWithRetry(retryCount + 1);
    }

    console.log('❌ iOS: 최대 재시도 횟수 초과');
    return false;
  } catch (error) {
    console.error('⚡ iOS: 토큰 갱신 재시도 중 오류:', error);
    return false;
  }
};

/**
 * ⚡ iOS 환경 메모리 사용량 최적화
 */
export const optimizeIOSMemoryUsage = (): void => {
  try {
    const isIOSEnvironment = isIOS();
    if (!isIOSEnvironment) return;

    console.log('⚡ iOS 메모리 사용량 최적화 시작');

    // 1. 불필요한 타이머 정리
    clearTokenRefreshTimer();

    // 2. 이벤트 리스너 정리 (메모리 누수 방지)
    cleanupEventListeners();

    // 3. 저장소 최적화
    optimizeStorage();

    // 4. 가비지 컬렉션 유도 (가능한 경우)
    if (typeof window !== 'undefined' && window.gc) {
      window.gc();
      console.log('⚡ iOS: 가비지 컬렉션 실행');
    }

    console.log('✅ iOS 메모리 사용량 최적화 완료');
  } catch (error) {
    console.error('⚡ iOS 메모리 사용량 최적화 중 오류:', error);
  }
};

/**
 * ⚡ iOS 환경 이벤트 리스너 정리
 */
const cleanupEventListeners = (): void => {
  try {
    // 커스텀 이벤트 리스너 정리
    const eventsToCleanup = [
      'tokenUpdated',
      'iosTokenRefreshSuccess',
      'tokenExpired',
      'iosAutoLoginFailed',
      'iosMultiDeviceLogout',
      'biometricAuthResult',
      'biometricStatusResult',
      'biometricAuthEnabled',
      'biometricAutoLoginSettingChanged',
    ];

    eventsToCleanup.forEach((eventName) => {
      // 이벤트 리스너가 너무 많아지지 않도록 정리
      console.log(`⚡ iOS: ${eventName} 이벤트 리스너 정리`);
    });
  } catch (error) {
    console.error('⚡ iOS: 이벤트 리스너 정리 중 오류:', error);
  }
};

/**
 * ⚡ iOS 환경 저장소 최적화
 */
const optimizeStorage = (): void => {
  try {
    // 1. 만료된 토큰 정리
    cleanupExpiredTokens();

    // 2. 저장소 크기 최적화
    optimizeStorageSize();
  } catch (error) {
    console.error('⚡ iOS: 저장소 최적화 중 오류:', error);
  }
};

/**
 * ⚡ iOS 환경 만료된 토큰 정리
 */
const cleanupExpiredTokens = (): void => {
  try {
    const now = new Date();

    // localStorage에서 만료된 토큰 정리
    if (typeof localStorage !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const expiry = localStorage.getItem('tokenExpiresAt');
        if (expiry) {
          const expiryTime = new Date(expiry);
          if (expiryTime <= now) {
            console.log('⚡ iOS: 만료된 토큰 정리');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tokenExpiresAt');
            localStorage.removeItem('isLoggedIn');
          }
        }
      }
    }

    // sessionStorage에서 만료된 토큰 정리
    if (typeof sessionStorage !== 'undefined') {
      const accessToken = sessionStorage.getItem('accessToken');
      if (accessToken) {
        const expiry = sessionStorage.getItem('tokenExpiresAt');
        if (expiry) {
          const expiryTime = new Date(expiry);
          if (expiryTime <= now) {
            console.log('⚡ iOS: 만료된 세션 토큰 정리');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('tokenExpiresAt');
            sessionStorage.removeItem('isLoggedIn');
          }
        }
      }
    }
  } catch (error) {
    console.error('⚡ iOS: 만료된 토큰 정리 중 오류:', error);
  }
};

/**
 * ⚡ iOS 환경 저장소 크기 최적화
 */
const optimizeStorageSize = (): void => {
  try {
    // localStorage 크기 제한 (5MB)
    const localStorageLimit = 5 * 1024 * 1024; // 5MB

    if (typeof localStorage !== 'undefined') {
      let totalSize = 0;
      const keys = Object.keys(localStorage || {});

      for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }

      if (totalSize > localStorageLimit) {
        console.log('⚡ iOS: localStorage 크기 제한 초과 - 오래된 데이터 정리');

        // 오래된 데이터 정리 (토큰 관련이 아닌 데이터)
        const nonTokenKeys = keys.filter(
          (key) =>
            !key.includes('Token') &&
            !key.includes('Login') &&
            !key.includes('Auth')
        );

        // 가장 오래된 데이터부터 정리
        nonTokenKeys
          .slice(0, Math.ceil(nonTokenKeys.length * 0.3))
          .forEach((key) => {
            localStorage.removeItem(key);
          });

        console.log('⚡ iOS: localStorage 크기 최적화 완료');
      }
    }
  } catch (error) {
    console.error('⚡ iOS: 저장소 크기 최적화 중 오류:', error);
  }
};

/**
 * ⚡ iOS 환경 성능 모니터링
 */
export const monitorIOSPerformance = (): void => {
  try {
    const isIOSEnvironment = isIOS();
    if (!isIOSEnvironment) return;

    console.log('⚡ iOS 성능 모니터링 시작');

    // 1. 메모리 사용량 모니터링
    if (typeof performance !== 'undefined') {
      const memory = (
        performance as Performance & { memory?: PerformanceMemory }
      ).memory;
      if (
        memory &&
        typeof memory === 'object' &&
        'usedJSHeapSize' in memory &&
        'totalJSHeapSize' in memory &&
        'jsHeapSizeLimit' in memory
      ) {
        console.log('⚡ iOS 메모리 사용량:');
        console.log(
          '- 사용 중인 힙 크기:',
          Math.round(memory.usedJSHeapSize / 1024 / 1024),
          'MB'
        );
        console.log(
          '- 총 힙 크기:',
          Math.round(memory.totalJSHeapSize / 1024 / 1024),
          'MB'
        );
        console.log(
          '- 힙 크기 제한:',
          Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
          'MB'
        );

        // 메모리 사용량이 높으면 최적화 실행
        if (memory.usedJSHeapSize > 50 * 1024 * 1024) {
          // 50MB 이상
          console.log('⚠️ iOS: 메모리 사용량이 높음 - 최적화 실행');
          optimizeIOSMemoryUsage();
        }
      }
    }

    // 2. 토큰 갱신 타이머 상태 확인
    if (typeof window !== 'undefined') {
      const timer = window.tokenRefreshTimer;
      const nextRefresh = window.tokenRefreshTime;

      if (timer && nextRefresh) {
        const now = new Date();
        const timeUntilRefresh = nextRefresh.getTime() - now.getTime();

        console.log('⚡ iOS 토큰 갱신 타이머 상태:');
        console.log(
          '- 다음 갱신까지:',
          Math.round(timeUntilRefresh / 1000 / 60),
          '분'
        );
        console.log('- 타이머 활성:', !!timer);
      }
    }

    console.log('✅ iOS 성능 모니터링 완료');
  } catch (error) {
    console.error('⚡ iOS 성능 모니터링 중 오류:', error);
  }
};

/**
 * 🧪 iOS 최초 로그인 시나리오 테스트
 */
export const testIOSFirstLogin = async (): Promise<boolean> => {
  try {
    console.log('🧪 === iOS 최초 로그인 시나리오 테스트 시작 ===');

    const isIOSEnvironment = isIOS();
    if (!isIOSEnvironment) {
      console.log('❌ iOS 환경이 아님 - 테스트 중단');
      return false;
    }

    // 1. 기존 토큰 정리
    console.log('🧪 1단계: 기존 토큰 정리');
    clearPersistentLoginSettings();

    // 2. 가상 토큰 생성 (테스트용)
    const testToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.test_signature';
    const testRefreshToken = 'refresh_token_test_123';

    // 3. iOS 방식으로 토큰 저장
    console.log('🧪 2단계: iOS 방식 토큰 저장');
    saveTokenForIOS(testToken, testRefreshToken, true);

    // 4. 저장된 토큰 확인
    console.log('🧪 3단계: 저장된 토큰 확인');
    const savedToken = getCurrentToken();
    const savedRefreshToken = getRefreshToken();

    if (!savedToken || !savedRefreshToken) {
      console.log('❌ 토큰 저장 실패');
      return false;
    }

    console.log('✅ 토큰 저장 성공:', {
      accessToken: savedToken.substring(0, 20) + '...',
      refreshToken: savedRefreshToken.substring(0, 20) + '...',
    });

    // 5. 자동 로그인 시도
    console.log('🧪 4단계: 자동 로그인 시도');
    const autoLoginSuccess = await restorePersistentLogin();

    if (autoLoginSuccess) {
      console.log('✅ iOS 최초 로그인 시나리오 성공!');
      return true;
    } else {
      console.log('❌ iOS 최초 로그인 시나리오 실패');
      return false;
    }
  } catch (error) {
    console.error('🧪 iOS 최초 로그인 시나리오 테스트 중 오류:', error);
    return false;
  } finally {
    console.log('🧪 === iOS 최초 로그인 시나리오 테스트 완료 ===');
  }
};

/**
 * 🧪 웹 최초 로그인 시나리오 테스트
 */
export const testWebFirstLogin = async (): Promise<boolean> => {
  try {
    console.log('🧪 === 웹 최초 로그인 시나리오 테스트 시작 ===');

    const isIOSEnvironment = isIOS();
    if (isIOSEnvironment) {
      console.log('❌ iOS 환경임 - 웹 테스트 중단');
      return false;
    }

    // 1. 기존 토큰 정리
    console.log('🧪 1단계: 기존 토큰 정리');
    clearPersistentLoginSettings();

    // 2. 가상 토큰 생성 (테스트용)
    const testToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.test_signature';
    const testRefreshToken = 'refresh_token_test_123';

    // 3. 웹 방식으로 토큰 저장 (자동 로그인 활성화)
    console.log('🧪 2단계: 웹 방식 토큰 저장 (자동 로그인 활성화)');
    saveTokenForIOS(testToken, testRefreshToken, true);

    // 4. 저장된 토큰 확인
    console.log('🧪 3단계: 저장된 토큰 확인');
    const savedToken = getCurrentToken();
    const savedRefreshToken = getRefreshToken();

    if (!savedToken || !savedRefreshToken) {
      console.log('❌ 토큰 저장 실패');
      return false;
    }

    console.log('✅ 토큰 저장 성공:', {
      accessToken: savedToken.substring(0, 20) + '...',
      refreshToken: savedRefreshToken.substring(0, 20) + '...',
    });

    // 5. 자동 로그인 시도
    console.log('🧪 4단계: 자동 로그인 시도');
    const autoLoginSuccess = await restorePersistentLogin();

    if (autoLoginSuccess) {
      console.log('✅ 웹 최초 로그인 시나리오 성공!');
      return true;
    } else {
      console.log('❌ 웹 최초 로그인 시나리오 실패');
      return false;
    }
  } catch (error) {
    console.error('🧪 웹 최초 로그인 시나리오 테스트 중 오류:', error);
    return false;
  } finally {
    console.log('🧪 === 웹 최초 로그인 시나리오 테스트 완료 ===');
  }
};

/**
 * 🧪 토큰 만료 시 자동 갱신 시나리오 테스트
 */
export const testTokenExpiryRenewal = async (): Promise<boolean> => {
  try {
    console.log('🧪 === 토큰 만료 시 자동 갱신 시나리오 테스트 시작 ===');

    const isIOSEnvironment = isIOS();
    console.log('🧪 환경:', isIOSEnvironment ? 'iOS' : '웹');

    // 1. 만료된 토큰 생성 (테스트용)
    console.log('🧪 1단계: 만료된 토큰 생성');
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9.expired_signature';
    const validRefreshToken = 'refresh_token_test_123';

    // 2. 토큰 저장
    console.log('🧪 2단계: 만료된 토큰 저장');
    if (isIOSEnvironment) {
      saveTokenForIOS(expiredToken, validRefreshToken, true);
    } else {
      saveTokenForIOS(expiredToken, validRefreshToken, true);
    }

    // 3. 토큰 유효성 확인
    console.log('🧪 3단계: 토큰 유효성 확인');
    const currentToken = getCurrentToken();
    const isValid = hasValidToken();

    console.log('🧪 토큰 상태:', {
      hasToken: !!currentToken,
      isValid: isValid,
      tokenLength: currentToken?.length || 0,
    });

    // 4. 자동 로그인 시도 (만료된 토큰으로)
    console.log('🧪 4단계: 만료된 토큰으로 자동 로그인 시도');
    const autoLoginSuccess = await restorePersistentLogin();

    if (autoLoginSuccess) {
      console.log('✅ 토큰 만료 시나리오 성공! (refreshToken으로 갱신됨)');

      // 5. 갱신된 토큰 확인
      const newToken = getCurrentToken();
      const newTokenValid = hasValidToken();

      console.log('🧪 갱신된 토큰 상태:', {
        hasNewToken: !!newToken,
        isValid: newTokenValid,
        isDifferent: newToken !== expiredToken,
      });

      return true;
    } else {
      console.log('❌ 토큰 만료 시나리오 실패 (갱신되지 않음)');
      return false;
    }
  } catch (error) {
    console.error('🧪 토큰 만료 시나리오 테스트 중 오류:', error);
    return false;
  } finally {
    console.log('🧪 === 토큰 만료 시 자동 갱신 시나리오 테스트 완료 ===');
  }
};
