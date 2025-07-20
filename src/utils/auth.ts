import Cookies from 'js-cookie';

import { Axios } from '@/api-utils/Axios';

// 인스타그램 방식 토큰 갱신 타이머
let tokenRefreshTimer: NodeJS.Timeout | null = null;

/**
 * 토큰의 유효성을 검사합니다 (존재 여부와 만료 여부 확인)
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
 * access/refresh 토큰을 여러 저장소(localStorage, sessionStorage, Cookies)에 저장
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
 * access/refresh 토큰을 여러 저장소에서 삭제
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
 * 앱-웹뷰에 토큰 동기화(로그인/로그아웃 이벤트 전달)
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
 * 토큰을 저장합니다 (인스타그램 방식)
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
 * 현재 토큰을 가져옵니다
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
 * 토큰 갱신 타이머 설정 (인스타그램 방식)
 */
const setupTokenRefreshTimer = (token: string): void => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const expiresAt = payload.exp;

    if (!expiresAt) return;

    // 토큰 만료 5분 전에 갱신
    const refreshTime = (expiresAt - currentTime - 300) * 1000;

    if (refreshTime > 0) {
      // 기존 타이머 정리
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
      }

      tokenRefreshTimer = setTimeout(async () => {
        await refreshToken();
      }, refreshTime);
    }
  } catch (error) {
    console.error('토큰 갱신 타이머 설정 실패:', error);
  }
};

/**
 * 토큰 갱신 (인스타그램 방식)
 */
export const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    // 토큰 갱신 API 호출
    const response = await Axios.post('/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // 새 토큰 저장
    saveTokens(accessToken, newRefreshToken);

    return true;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    // 갱신 실패 시 로그아웃
    await logout();
    return false;
  }
};

/**
 * 모든 토큰을 제거합니다
 */
export const clearTokens = (): void => {
  removeToken();
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
  syncTokenWithApp(); // 로그아웃 이벤트
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
 * 토큰에서 이메일을 추출합니다
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
 * 앱에서 토큰을 강제로 저장 (네이티브 앱용)
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
