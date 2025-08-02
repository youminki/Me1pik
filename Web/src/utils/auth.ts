/**
 * 인증 토큰 관리 유틸리티 (auth.ts)
 *
 * JWT 기반 인증 시스템의 토큰을 종합적으로 관리하는 유틸리티를 제공합니다.
 * 다중 저장소 동기화, 자동 갱신, 네이티브 앱 연동, 라우트 보호 등
 * 보안성과 사용자 경험을 모두 고려한 인증 시스템을 구현합니다.
 *
 * @description
 * - JWT 토큰 유효성 검사 및 자동 갱신
 * - 다중 저장소 동기화 (localStorage, sessionStorage, Cookies)
 * - 네이티브 앱 연동 (iOS/Android WebView)
 * - 라우트 보호 및 인증 상태에 따른 리다이렉트
 * - 인스타그램 방식 토큰 갱신 타이머 (만료 전 자동 갱신)
 */

import Cookies from 'js-cookie';

import { Axios } from '@/api-utils/Axios';

/**
 * 토큰 갱신 타이머 변수
 *
 * 인스타그램 방식의 토큰 갱신을 위한 타이머입니다.
 * 토큰 만료 전에 자동으로 갱신을 시도하여 사용자 경험을 개선합니다.
 * 전역 변수로 관리하여 앱 전체에서 일관된 갱신 로직을 제공합니다.
 */
let tokenRefreshTimer: NodeJS.Timeout | null = null;

/**
 * 토큰 유효성 검사 함수
 *
 * 다중 저장소에서 토큰을 확인하고 JWT 구조를 검증하여 유효성을 판단합니다.
 * 만료된 토큰은 자동으로 정리하고 false를 반환합니다.
 *
 * @returns 토큰이 유효하면 true, 없거나 만료되었으면 false
 */
export const hasValidToken = (): boolean => {
  const localToken = localStorage.getItem('accessToken');
  const sessionToken = sessionStorage.getItem('accessToken');
  const cookieToken = Cookies.get('accessToken');
  const token =
    localToken?.trim() || sessionToken?.trim() || cookieToken?.trim();

  if (!token) return false;

  try {
    // JWT 토큰의 페이로드 부분을 디코드
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;

    // 토큰이 만료되었는지 확인
    if (payload.exp && payload.exp < currentTime) {
      clearTokens();
      return false;
    }

    return true;
  } catch {
    clearTokens();
    return false;
  }
};

/**
 * 토큰 저장 함수
 *
 * 액세스 토큰과 리프레시 토큰을 다중 저장소에 동기화하여 저장합니다.
 * localStorage, sessionStorage, Cookies에 모두 저장하여 브라우저 환경에 관계없이
 * 일관된 토큰 접근을 보장합니다.
 *
 * @param accessToken - 액세스 토큰 (필수)
 * @param refreshToken - 리프레시 토큰 (선택적)
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
}

/**
 * 토큰 삭제 함수
 *
 * 모든 저장소(localStorage, sessionStorage, Cookies)에서 토큰을 완전히 삭제합니다.
 * 로그아웃 시 보안을 위해 모든 토큰 관련 데이터를 정리합니다.
 */
export function removeToken() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
}

/**
 * 네이티브 앱 토큰 동기화 함수
 *
 * 웹뷰 환경에서 네이티브 앱과 토큰을 동기화합니다.
 * 로그인/로그아웃 이벤트를 네이티브 앱에 전달하여 일관된 인증 상태를 유지합니다.
 *
 * 플랫폼별 구현:
 * - iOS: WKWebView messageHandlers 사용
 * - Android: WebView JavaScriptInterface 사용
 * - 웹: CustomEvent 사용
 *
 * @param accessToken - 액세스 토큰 (로그인 시)
 * @param refreshToken - 리프레시 토큰 (로그인 시)
 */
export function syncTokenWithApp(accessToken?: string, refreshToken?: string) {
  if (accessToken) {
    // 로그인 이벤트
    if (window.webkit?.messageHandlers?.loginHandler) {
      window.webkit.messageHandlers.loginHandler.postMessage({
        type: 'login',
        token: accessToken,
        refreshToken: refreshToken,
      });
    }
    window.dispatchEvent(
      new CustomEvent('webLoginSuccess', {
        detail: { token: accessToken, refreshToken },
      })
    );
  } else {
    // 로그아웃 이벤트
    const messageHandlers = window.webkit?.messageHandlers as
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
 * saveTokens 함수
 *
 * 토큰을 저장합니다 (인스타그램 방식).
 *
 * @param accessToken - 액세스 토큰
 * @param refreshToken - 리프레시 토큰 (선택)
 */
export const saveTokens = (
  accessToken: string,
  refreshToken?: string
): void => {
  setToken(accessToken, refreshToken);
  setupTokenRefreshTimer(accessToken);
  syncTokenWithApp(accessToken, refreshToken);
};

/**
 * getCurrentToken 함수
 *
 * 현재 토큰을 가져옵니다.
 *
 * @returns 현재 토큰 또는 null
 */
export const getCurrentToken = (): string | null => {
  const localToken = localStorage.getItem('accessToken');
  const sessionToken = sessionStorage.getItem('accessToken');
  const cookieToken = Cookies.get('accessToken');
  return (
    localToken?.trim() || sessionToken?.trim() || cookieToken?.trim() || null
  );
};

/**
 * getRefreshToken 함수
 *
 * Refresh 토큰을 가져옵니다.
 *
 * @returns 리프레시 토큰 또는 null
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
 * setupTokenRefreshTimer 함수
 *
 * 토큰 갱신 타이머를 설정합니다 (인스타그램 방식).
 *
 * @param token - 설정할 토큰
 */
const setupTokenRefreshTimer = (token: string): void => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const expiresAt = payload.exp;

    if (!expiresAt) return;

    // 자동로그인 여부에 따라 갱신 시점 조정
    const autoLogin = localStorage.getItem('autoLogin') === 'true';
    // 자동로그인: 만료 1일 전에 갱신
    // 일반로그인: 만료 5분 전에 갱신
    const refreshOffset = autoLogin ? 24 * 60 * 60 : 300; // 24시간 또는 5분
    const refreshTime = (expiresAt - currentTime - refreshOffset) * 1000;

    const refreshAt = new Date(Date.now() + refreshTime);
    console.log('토큰 갱신 예정:', {
      autoLogin,
      refreshAt: refreshAt.toLocaleString(),
      offsetMinutes: refreshOffset / 60,
    });

    if (refreshTime > 0) {
      // 기존 타이머 정리
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
      }

      tokenRefreshTimer = setTimeout(async () => {
        console.log('토큰 갱신 타이머 실행');
        await refreshToken();
      }, refreshTime);
    }
  } catch (error) {
    console.error('토큰 갱신 타이머 설정 실패:', error);
  }
};

/**
 * refreshToken 함수
 *
 * 토큰을 갱신합니다 (인스타그램 방식).
 *
 * @returns 갱신 성공 여부
 */
export const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshToken = getRefreshToken();
    const autoLogin = localStorage.getItem('autoLogin') === 'true';
    console.log('토큰 갱신 시도:', { autoLogin });

    if (!refreshToken) {
      console.log('Refresh 토큰이 없음');
      return false;
    }

    // 토큰 갱신 API 호출
    const response = await Axios.post('/auth/refresh', {
      refreshToken,
      autoLogin,
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // 새 토큰의 만료시간 확인
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiresAt = new Date(payload.exp * 1000);
      console.log('새 토큰 만료시간:', expiresAt.toLocaleString());
    } catch (e) {
      console.error('새 토큰 디코딩 실패:', e);
    }

    // 새 토큰 저장
    saveTokens(accessToken, newRefreshToken);
    console.log('토큰 갱신 완료');

    return true;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    // 갱신 실패 시 로그아웃
    await logout();
    return false;
  }
};

/**
 * clearTokens 함수
 *
 * 모든 토큰을 제거합니다.
 */
export const clearTokens = (): void => {
  removeToken();
  localStorage.removeItem('autoLogin'); // 자동로그인 플래그도 제거
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
  syncTokenWithApp(); // 로그아웃 이벤트
};

/**
 * isPublicRoute 함수
 *
 * 공개 경로인지 확인합니다 (토큰이 없어도 접근 가능한 경로).
 *
 * @param pathname - 확인할 경로
 * @returns 공개 경로 여부
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
  ];
  return publicRoutes.includes(pathname);
};

/**
 * isProtectedRoute 함수
 *
 * 보호된 경로인지 확인합니다 (토큰이 필요한 경로).
 *
 * @param pathname - 확인할 경로
 * @returns 보호된 경로 여부
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return !isPublicRoute(pathname);
};

/**
 * logout 함수
 *
 * 로그아웃 처리를 합니다 (인스타그램 방식).
 */
export const logout = async (): Promise<void> => {
  try {
    // 서버에 로그아웃 요청 (선택사항)
    const email = getEmailFromToken();
    if (email) {
      // logoutUser API 호출 (에러가 나도 무시)
      await Axios.post('/user/logout', { email });
    }
  } catch (error) {
    console.log('로그아웃 처리 중 오류:', error);
  } finally {
    // 모든 토큰 제거
    clearTokens();

    // Axios 헤더 초기화
    // Axios import 제거 - 사용하지 않음
    // const { Axios } = await import('../api-utils/Axios');
    // Axios.defaults.headers.Authorization = '';

    console.log('로그아웃 완료');
  }
};

/**
 * getEmailFromToken 함수
 *
 * 토큰에서 이메일을 추출합니다.
 *
 * @returns 이메일 또는 null
 */
const getEmailFromToken = (): string | null => {
  const token = getCurrentToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.email as string;
  } catch {
    return null;
  }
};

/**
 * forceSaveAppToken 함수
 *
 * 앱에서 토큰을 강제로 저장합니다 (네이티브 앱용).
 *
 * @param accessToken - 액세스 토큰
 * @param refreshToken - 리프레시 토큰 (선택)
 */
export const forceSaveAppToken = (
  accessToken: string,
  refreshToken?: string
): void => {
  setToken(accessToken, refreshToken);
  setupTokenRefreshTimer(accessToken);
  // 앱-웹뷰 동기화는 필요시 호출자가 직접 syncTokenWithApp 사용
  console.log('앱에 토큰 강제 저장 완료');
};

/**
 * redirectToLoginIfNoToken 함수
 *
 * 토큰이 없을 때 로그인 페이지로 이동하는 함수입니다.
 *
 * @returns 이동 여부
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
 * checkTokenAndRedirect 함수
 *
 * 보호된 라우트에서 토크 체크 및 리다이렉트를 수행합니다.
 *
 * @param pathname - 확인할 경로
 * @returns 리다이렉트 필요 여부
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
 * handleAppLogin 함수
 *
 * 앱에서 받은 로그인 정보를 처리합니다 (인스타그램 방식).
 *
 * @param loginInfo - 로그인 정보
 * @param loginInfo.token - 액세스 토큰
 * @param loginInfo.refreshToken - 리프레시 토큰 (선택)
 * @param loginInfo.email - 사용자 이메일 (선택)
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
 * handleAppLogout 함수
 *
 * 앱에서 받은 로그아웃을 처리합니다 (인스타그램 방식).
 */
export const handleAppLogout = (): void => {
  logout();
};

/**
 * getErrorMessage 함수
 *
 * 에러 객체에서 사용자 친화적인 메시지를 추출하는 유틸 함수입니다.
 *
 * @param error - 에러 객체
 * @returns 사용자 친화적 에러 메시지
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ('response' in error && typeof (error as any).response === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (error as any).response?.data;
      if (data && typeof data.message === 'string') {
        return data.message;
      }
    }
    return error.message;
  }
  if (typeof error === 'string') return error;
  return '알 수 없는 오류';
}
