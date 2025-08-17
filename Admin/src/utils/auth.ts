// src/utils/auth.ts
import Cookies from 'js-cookie';
import { Axios } from 'src/api/Axios';

// 토큰 갱신 타이머
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
 * 토큰이 유효한지 확인
 */
export const hasValidToken = (): boolean => {
  const token = getCurrentToken();
  if (!token) return false;

  try {
    const payload = decodeJwtPayload(token);
    if (!payload) {
      console.error('❌ 토큰 페이로드 디코드 실패');
      return false;
    }

    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    console.error('토큰 디코딩 실패:', error);
    return false;
  }
};

/**
 * 토큰 저장 (쿠키 + 로컬스토리지)
 */
export function setToken(accessToken: string, refreshToken?: string) {
  // 로컬스토리지에 저장
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  // 쿠키에 저장 (보안 강화)
  Cookies.set('accessToken', accessToken, {
    secure: window.location.protocol === 'https:',
    sameSite: 'strict',
    path: '/',
  });

  if (refreshToken) {
    Cookies.set('refreshToken', refreshToken, {
      secure: window.location.protocol === 'https:',
      sameSite: 'strict',
      path: '/',
    });
  }
}

/**
 * 토큰 제거
 */
export function removeToken() {
  // 쿠키에서 제거
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');

  // 로컬스토리지에서 제거
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  // Axios 헤더 제거
  delete Axios.defaults.headers.Authorization;

  // 타이머 정리
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
}

/**
 * 모든 토큰과 관련 데이터를 정리합니다 (로그아웃 시 사용)
 */
export const clearAllTokensAndIntervals = (): void => {
  // 로컬스토리지 정리
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userEmail');

  // 쿠키 정리
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');

  // 자동 갱신 타이머 정리
  if (tokenRefreshTimer) {
    clearInterval(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }

  console.log('🧹 모든 토큰과 인터벌이 정리되었습니다');
};

/**
 * 앱과 토큰 동기화
 */
export function syncTokenWithApp(accessToken?: string, refreshToken?: string) {
  if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
    const message = {
      type: 'TOKEN_UPDATE',
      accessToken,
      refreshToken,
    };
    (window as any).ReactNativeWebView.postMessage(JSON.stringify(message));
  }
}

/**
 * 토큰 저장 및 갱신 타이머 설정
 */
export const saveTokens = (accessToken: string, refreshToken?: string): void => {
  setToken(accessToken, refreshToken);
  setupTokenRefreshTimer(accessToken);
  syncTokenWithApp(accessToken, refreshToken);

  // 디버깅: 토큰 저장 확인
  console.log('🔐 토큰 저장됨:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    autoLogin: localStorage.getItem('autoLogin'),
    timestamp: new Date().toLocaleString(),
  });
};

/**
 * 현재 액세스 토큰 가져오기
 */
export const getCurrentToken = (): string | null => {
  // 쿠키에서 먼저 확인
  let token = Cookies.get('accessToken');
  if (token) return token;

  // 로컬스토리지에서 확인
  const localToken = localStorage.getItem('accessToken');
  if (localToken) {
    // 로컬스토리지에 있으면 쿠키에도 저장
    Cookies.set('accessToken', localToken, { secure: true, sameSite: 'strict' });
    return localToken;
  }

  return null;
};

/**
 * 리프레시 토큰 가져오기
 */
export const getRefreshToken = (): string | null => {
  // 쿠키에서 먼저 확인
  let token = Cookies.get('refreshToken');
  if (token) return token;

  // 로컬스토리지에서 확인
  const localRefreshToken = localStorage.getItem('refreshToken');
  if (localRefreshToken) {
    // 로컬스토리지에 있으면 쿠키에도 저장
    Cookies.set('refreshToken', localRefreshToken, { secure: true, sameSite: 'strict' });
    return localRefreshToken;
  }

  return null;
};

/**
 * 토큰 갱신 타이머 설정
 */
const setupTokenRefreshTimer = (token: string): void => {
  try {
    const payload = decodeJwtPayload(token);
    if (!payload) {
      console.error('❌ 토큰 페이로드 디코드 실패');
      return;
    }
    const currentTime = Date.now() / 1000;
    const expiresAt = payload.exp;

    const autoLogin = localStorage.getItem('autoLogin') === 'true';
    const refreshOffset = autoLogin ? 24 * 60 * 60 : 30 * 60; // 24시간 또는 30분
    const refreshTime = (expiresAt - currentTime - refreshOffset) * 1000;

    const refreshAt = new Date(Date.now() + refreshTime);
    console.log('⏰ 토큰 갱신 타이머 설정:', {
      autoLogin,
      refreshAt: refreshAt.toLocaleString(),
      offsetMinutes: refreshOffset / 60,
      refreshTimeMs: refreshTime,
      currentTime: new Date().toLocaleString(),
      tokenExpiresAt: new Date(expiresAt * 1000).toLocaleString(),
    });

    // 음수 값이면 즉시 갱신, 너무 큰 값이면 기본값 사용
    if (refreshTime > 0 && refreshTime < 30 * 24 * 60 * 60 * 1000) {
      // 30일 이하
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
      }

      tokenRefreshTimer = setTimeout(async () => {
        console.log('⏰ 토큰 갱신 타이머 실행');
        const success = await refreshToken();
        if (!success) {
          console.log('⚠️ 토큰 갱신 타이머 실패, 5분 후 재시도');
          // 실패 시 5분 후 재시도
          setTimeout(
            async () => {
              console.log('🔄 토큰 갱신 재시도 실행');
              await refreshToken();
            },
            5 * 60 * 1000,
          );
        } else {
          console.log('✅ 토큰 갱신 타이머 성공');
        }
      }, refreshTime);
    } else {
      console.log('⚠️ 토큰 갱신 타이머 설정 건너뜀:', {
        reason: refreshTime <= 0 ? '이미 만료됨' : '시간이 너무 김',
        refreshTime,
      });
    }
  } catch (error) {
    console.error('토큰 갱신 타이머 설정 실패:', error);
  }
};

/**
 * 토큰 갱신
 */
export const refreshToken = async (retryCount = 0): Promise<boolean> => {
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
      endpoint: '/admin/auth/refresh',
      hasRefreshToken: !!refreshToken,
      autoLogin,
      refreshTokenLength: refreshToken?.length,
    });
    const response = await Axios.post('/admin/auth/refresh', {
      refreshToken,
      autoLogin,
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // 토큰 만료 시간 확인
    try {
      const payload = decodeJwtPayload(accessToken);
      if (!payload) {
        console.error('새로 받은 토큰 페이로드 디코드 실패');
        return false;
      }
      const currentTime = Date.now() / 1000;
      if (payload.exp <= currentTime) {
        console.error('새로 받은 토큰이 이미 만료됨');
        return false;
      }
    } catch (error) {
      console.error('새 토큰 디코딩 실패:', error);
      return false;
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

    // Axios 헤더 업데이트
    Axios.defaults.headers.Authorization = `Bearer ${accessToken}`;

    console.log('✅ 토큰 갱신 완료:', {
      newTokenLength: accessToken.length,
      newRefreshTokenLength: newRefreshToken?.length,
      timestamp: new Date().toLocaleString(),
    });

    // 토큰 갱신 성공 이벤트 발생
    window.dispatchEvent(
      new CustomEvent('tokenRefreshSuccess', {
        detail: { accessToken, refreshToken: newRefreshToken },
      }),
    );

    return true;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);

    // 재시도 로직 (최대 2회)
    if (retryCount < 2) {
      console.log(`토큰 갱신 재시도 ${retryCount + 1}/2`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1))); // 지수 백오프
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
      window.dispatchEvent(
        new CustomEvent('tokenRefreshFailed', {
          detail: { error: '토큰 갱신에 실패했습니다. 다시 로그인해주세요.' },
        }),
      );
    }
    return false;
  }
};

/**
 * 모든 토큰 제거
 */
export const clearTokens = (): void => {
  removeToken();
  localStorage.removeItem('autoLogin');
  localStorage.removeItem('userEmail');
};

/**
 * 공개 라우트 확인
 */
export const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ];
  return publicRoutes.some((route) => pathname.startsWith(route));
};

/**
 * 보호된 라우트 확인
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return !isPublicRoute(pathname) && pathname !== '/';
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  try {
    // 서버에 로그아웃 요청 (선택사항)
    const token = getCurrentToken();
    if (token) {
      await Axios.post('/admin/auth/logout');
    }
  } catch (error) {
    console.error('로그아웃 API 호출 실패:', error);
  } finally {
    // 클라이언트 측 정리
    clearTokens();
    syncTokenWithApp();

    // 로그인 페이지로 리다이렉트
    window.location.href = '/login';
  }
};

/**
 * 토큰에서 이메일 추출
 */
const getEmailFromToken = (): string | null => {
  try {
    const token = getCurrentToken();
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload) {
      console.error('토큰에서 이메일 추출 실패: 페이로드 디코드 실패');
      return null;
    }
    return payload.email || null;
  } catch (error) {
    console.error('토큰에서 이메일 추출 실패:', error);
    return null;
  }
};

/**
 * 앱에서 강제로 토큰 저장
 */
export const forceSaveAppToken = (accessToken: string, refreshToken?: string): void => {
  saveTokens(accessToken, refreshToken);
  localStorage.setItem('autoLogin', 'true');
  const email = getEmailFromToken();
  if (email) {
    localStorage.setItem('userEmail', email);
  }
};

/**
 * 토큰이 없으면 로그인 페이지로 리다이렉트
 */
export const redirectToLoginIfNoToken = (): boolean => {
  if (!hasValidToken()) {
    window.location.href = '/login';
    return true;
  }
  return false;
};

/**
 * 토큰 확인 및 리다이렉트
 */
export const checkTokenAndRedirect = (pathname: string): boolean => {
  if (isProtectedRoute(pathname) && !hasValidToken()) {
    window.location.href = '/login';
    return true;
  }
  return false;
};

/**
 * 앱 로그인 처리
 */
export const handleAppLogin = (loginInfo: {
  token: string;
  refreshToken?: string;
  email?: string;
}): void => {
  forceSaveAppToken(loginInfo.token, loginInfo.refreshToken);
  if (loginInfo.email) {
    localStorage.setItem('userEmail', loginInfo.email);
  }
};

/**
 * 앱 로그아웃 처리
 */
export const handleAppLogout = (): void => {
  clearTokens();
  window.location.href = '/login';
};

/**
 * 에러 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return '알 수 없는 오류가 발생했습니다.';
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
      const payload = decodeJwtPayload(accessToken);
      if (payload) {
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
      const payload = decodeJwtPayload(accessToken);
      if (!payload) {
        console.log('❌ 액세스 토큰 페이로드 디코드 실패');
        return;
      }
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;

      console.log('📊 현재 토큰 상태:', {
        expiresAt: new Date(payload.exp * 1000).toLocaleString(),
        timeUntilExpiry: Math.floor(timeUntilExpiry / 60) + '분',
        isExpired: timeUntilExpiry < 0,
      });

      if (timeUntilExpiry > 0) {
        console.log('⚠️ 토큰이 아직 유효합니다. 만료 시뮬레이션을 위해 30초 후로 설정');
        // 테스트용으로 30초 후 만료로 설정 (더 빠른 테스트)
        const testExpiry = currentTime + 30;
        const testPayload = { ...payload, exp: testExpiry };
        const testToken =
          accessToken.split('.')[0] +
          '.' +
          btoa(JSON.stringify(testPayload)) +
          '.' +
          accessToken.split('.')[2];

        // 테스트 토큰으로 임시 저장
        localStorage.setItem('testAccessToken', testToken);
        console.log('✅ 테스트 토큰이 설정되었습니다. 30초 후 만료됩니다.');
        console.log('🔄 30초 후 자동 갱신이 실행될 예정입니다.');
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
