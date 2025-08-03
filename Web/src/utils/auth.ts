import Cookies from 'js-cookie';

import { Axios } from '@/api-utils/Axios';

// 인스타그램 방식 토큰 갱신 타이머
let tokenRefreshTimer: NodeJS.Timeout | null = null;
let isRefreshing = false; // 무한루프 방지를 위한 플래그
let lastRefreshTime = 0; // 마지막 갱신 시간 추적

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
  refreshToken?: string,
  skipTimer = false
): void => {
  setToken(accessToken, refreshToken);

  // 타이머 설정을 건너뛰지 않는 경우에만 설정
  if (!skipTimer) {
    setupTokenRefreshTimer(accessToken);
  }

  syncTokenWithApp(accessToken, refreshToken);

  // 디버깅: 토큰 저장 확인
  console.log('🔐 토큰 저장됨:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    autoLogin: localStorage.getItem('autoLogin'),
    skipTimer,
    timestamp: new Date().toLocaleString(),
  });
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

    // 자동로그인 여부에 따라 갱신 시점 조정
    const autoLogin = localStorage.getItem('autoLogin') === 'true';
    // 자동로그인: 만료 30분 전에 갱신 (더 안전한 설정)
    // 일반로그인: 만료 15분 전에 갱신 (안전성 향상)
    const refreshOffset = autoLogin ? 30 * 60 : 15 * 60; // 30분 또는 15분
    const timeUntilExpiry = expiresAt - currentTime;
    const refreshTime = Math.max(0, timeUntilExpiry - refreshOffset) * 1000;

    const refreshAt = new Date(Date.now() + refreshTime);
    console.log('⏰ 토큰 갱신 타이머 설정:', {
      autoLogin,
      refreshAt: refreshAt.toLocaleString(),
      offsetMinutes: refreshOffset / 60,
      timeUntilExpiry: Math.floor(timeUntilExpiry / 60) + '분',
      refreshTimeMs: refreshTime,
      currentTime: new Date().toLocaleString(),
      tokenExpiresAt: new Date(expiresAt * 1000).toLocaleString(),
    });

    // 토큰이 이미 만료된 경우 즉시 갱신
    if (timeUntilExpiry <= 0) {
      console.log('⚠️ 토큰이 이미 만료됨, 즉시 갱신 시도');
      setTimeout(async () => {
        await refreshTokenWithoutTimer();
      }, 1000); // 1초 후 갱신
      return;
    }

    // 갱신 시간이 너무 짧으면 즉시 갱신
    if (timeUntilExpiry <= refreshOffset) {
      console.log('⚠️ 토큰이 곧 만료됨, 즉시 갱신 시도');
      setTimeout(async () => {
        await refreshTokenWithoutTimer();
      }, 1000); // 1초 후 갱신
      return;
    }

    // 정상적인 경우 타이머 설정
    if (refreshTime > 0 && refreshTime < 30 * 24 * 60 * 60 * 1000) {
      // 30일 이하
      // 기존 타이머 정리
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
      }

      tokenRefreshTimer = setTimeout(async () => {
        console.log('토큰 갱신 타이머 실행');
        const success = await refreshToken();
        if (!success) {
          console.log('토큰 갱신 타이머 실패, 재설정 시도');
          // 실패 시 5분 후 재시도
          setTimeout(
            async () => {
              await refreshToken();
            },
            5 * 60 * 1000
          );
        }
      }, refreshTime);
    } else {
      console.log('⚠️ 토큰 갱신 타이머 설정 건너뜀:', {
        reason: refreshTime <= 0 ? '이미 만료됨' : '시간이 너무 김',
        refreshTime,
        timeUntilExpiry: Math.floor(timeUntilExpiry / 60) + '분',
      });
    }
  } catch (error) {
    console.error('토큰 갱신 타이머 설정 실패:', error);
  }
};

/**
 * 타이머 설정 없이 토큰만 갱신 (무한루프 방지용)
 */
const refreshTokenWithoutTimer = async (retryCount = 0): Promise<boolean> => {
  const now = Date.now();

  if (isRefreshing) {
    console.log('⚠️ 이미 토큰 갱신 중, 중복 요청 무시');
    return false;
  }

  // 5초 내에 이미 갱신했다면 중복 요청 차단
  if (now - lastRefreshTime < 5000) {
    console.log('⚠️ 최근에 이미 갱신됨, 중복 요청 무시');
    return false;
  }

  isRefreshing = true;
  lastRefreshTime = now;
  try {
    const refreshToken = getRefreshToken();
    const autoLogin = localStorage.getItem('autoLogin') === 'true';
    console.log('토큰 갱신 시도 (타이머 없음):', { autoLogin, retryCount });

    if (!refreshToken) {
      console.log('Refresh 토큰이 없음');
      return false;
    }

    // 토큰 갱신 API 호출
    console.log('🔄 토큰 갱신 API 호출 (타이머 없음):', {
      endpoint: '/auth/refresh',
      hasRefreshToken: !!refreshToken,
      autoLogin,
      refreshTokenLength: refreshToken?.length,
    });

    const response = await Axios.post('/auth/refresh', {
      refreshToken,
      autoLogin,
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // 새 토큰의 만료시간 확인
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiresAt = new Date(payload.exp * 1000);
      console.log(
        '새 토큰 만료시간 (타이머 없음):',
        expiresAt.toLocaleString()
      );
    } catch (e) {
      console.error('새 토큰 디코딩 실패:', e);
    }

    // 새 토큰 저장 (타이머 설정 없이)
    if (newRefreshToken) {
      saveTokens(accessToken, newRefreshToken, true); // skipTimer = true
    } else {
      // 리프레시 토큰이 없으면 액세스 토큰만 업데이트
      const currentRefreshToken = getRefreshToken();
      saveTokens(accessToken, currentRefreshToken || undefined, true); // skipTimer = true
      console.log('⚠️ 서버에서 새 리프레시 토큰을 반환하지 않음, 기존 것 유지');
    }

    console.log('✅ 토큰 갱신 완료 (타이머 없음):', {
      newTokenLength: accessToken.length,
      newRefreshTokenLength: newRefreshToken?.length,
      timestamp: new Date().toLocaleString(),
    });

    isRefreshing = false;
    return true;
  } catch (error) {
    console.error('토큰 갱신 실패 (타이머 없음):', error);

    // 재시도 로직 (최대 2회)
    if (retryCount < 2) {
      console.log(`토큰 갱신 재시도 ${retryCount + 1}/2 (타이머 없음)`);
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      ); // 지수 백오프
      return refreshTokenWithoutTimer(retryCount + 1);
    }

    // 최대 재시도 후에도 실패하면 토큰 상태 확인
    console.log('토큰 갱신 최대 재시도 실패 (타이머 없음)');
    const remainingToken = getRefreshToken();
    if (!remainingToken) {
      console.log('리프레시 토큰이 없어서 로그아웃 처리');
      await logout();
    } else {
      console.log('리프레시 토큰은 있지만 갱신 실패, 수동 로그인 필요');
      // 토큰은 유지하되 사용자에게 알림
      window.dispatchEvent(new CustomEvent('tokenRefreshFailed'));
    }

    isRefreshing = false;
    return false;
  }
};

/**
 * 토큰 갱신 (인스타그램 방식)
 */
export const refreshToken = async (retryCount = 0): Promise<boolean> => {
  const now = Date.now();

  if (isRefreshing) {
    console.log('⚠️ 이미 토큰 갱신 중, 중복 요청 무시');
    return false;
  }

  // 5초 내에 이미 갱신했다면 중복 요청 차단
  if (now - lastRefreshTime < 5000) {
    console.log('⚠️ 최근에 이미 갱신됨, 중복 요청 무시');
    return false;
  }

  isRefreshing = true;
  lastRefreshTime = now;
  try {
    const refreshToken = getRefreshToken();
    const autoLogin = localStorage.getItem('autoLogin') === 'true';
    console.log('토큰 갱신 시도:', { autoLogin, retryCount });

    if (!refreshToken) {
      console.log('Refresh 토큰이 없음');
      return false;
    }

    // 토큰 갱신 API 호출
    console.log('🔄 토큰 갱신 API 호출:', {
      endpoint: '/auth/refresh',
      hasRefreshToken: !!refreshToken,
      autoLogin,
      refreshTokenLength: refreshToken?.length,
    });

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

    // 새 토큰 저장 (리프레시 토큰이 없으면 기존 것 유지)
    if (newRefreshToken) {
      saveTokens(accessToken, newRefreshToken);
    } else {
      // 리프레시 토큰이 없으면 액세스 토큰만 업데이트
      const currentRefreshToken = getRefreshToken();
      saveTokens(accessToken, currentRefreshToken || undefined);
      console.log('⚠️ 서버에서 새 리프레시 토큰을 반환하지 않음, 기존 것 유지');
    }

    console.log('✅ 토큰 갱신 완료:', {
      newTokenLength: accessToken.length,
      newRefreshTokenLength: newRefreshToken?.length,
      timestamp: new Date().toLocaleString(),
    });

    isRefreshing = false;
    return true;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);

    // 재시도 로직 (최대 2회)
    if (retryCount < 2) {
      console.log(`토큰 갱신 재시도 ${retryCount + 1}/2`);
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      ); // 지수 백오프
      return refreshToken(retryCount + 1);
    }

    // 최대 재시도 후에도 실패하면 토큰 상태 확인
    console.log('토큰 갱신 최대 재시도 실패');
    const remainingToken = getRefreshToken();
    if (!remainingToken) {
      console.log('리프레시 토큰이 없어서 로그아웃 처리');
      await logout();
    } else {
      console.log('리프레시 토큰은 있지만 갱신 실패, 수동 로그인 필요');
      // 토큰은 유지하되 사용자에게 알림
      window.dispatchEvent(new CustomEvent('tokenRefreshFailed'));
    }

    isRefreshing = false;
    return false;
  }
};

/**
 * 모든 토큰을 제거합니다
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
  const token = getCurrentToken();
  const isValid = hasValidToken();

  console.log('🔍 checkTokenAndRedirect:', {
    pathname,
    isProtected,
    hasToken: !!token,
    isValidToken: isValid,
  });

  if (!isProtected) {
    console.log('🔍 공개 라우트이므로 리다이렉트 불필요');
    return false; // 공개 라우트는 체크하지 않음
  }

  if (!token) {
    console.log('🔍 토큰이 없으므로 리다이렉트 필요');
    return true; // 리다이렉트 필요
  }

  if (!isValid) {
    console.log('🔍 토큰이 유효하지 않으므로 리다이렉트 필요');
    return true; // 리다이렉트 필요
  }

  console.log('🔍 토큰이 유효하므로 리다이렉트 불필요');
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
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiresAt = new Date(payload.exp * 1000);
      const currentTime = new Date();
      const timeUntilExpiry = expiresAt.getTime() - currentTime.getTime();

      console.log('📅 토큰 만료 정보:', {
        expiresAt: expiresAt.toLocaleString(),
        timeUntilExpiry: Math.floor(timeUntilExpiry / 1000 / 60) + '분',
        isExpired: timeUntilExpiry < 0,
      });
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
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
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
        // 테스트용으로 1분 후 만료로 설정
        const testExpiry = currentTime + 60;
        const testPayload = { ...payload, exp: testExpiry };
        const testToken =
          accessToken.split('.')[0] +
          '.' +
          btoa(JSON.stringify(testPayload)) +
          '.' +
          accessToken.split('.')[2];

        // 테스트 토큰으로 임시 저장
        localStorage.setItem('testAccessToken', testToken);
        console.log('✅ 테스트 토큰이 설정되었습니다. 1분 후 만료됩니다.');
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

  console.log('🔧 디버깅 함수들이 전역으로 노출되었습니다:');
  console.log('- debugTokenStatus(): 토큰 상태 확인');
  console.log('- refreshToken(): 수동 토큰 갱신');
  console.log('- getCurrentToken(): 현재 액세스 토큰');
  console.log('- getRefreshToken(): 현재 리프레시 토큰');
  console.log('- simulateTokenExpiry(): 토큰 만료 시뮬레이션');
  console.log('- testAutoRefresh(): 자동 갱신 테스트');
}
