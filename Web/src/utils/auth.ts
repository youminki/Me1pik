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
 * 토큰의 유효성을 검사합니다 (존재 여부와 만료 여부 확인)
 */
export const hasValidToken = (): boolean => {
  const localToken = localStorage.getItem('accessToken');
  const sessionToken = sessionStorage.getItem('accessToken');
  const cookieToken = Cookies.get('accessToken');
  const token =
    localToken?.trim() || sessionToken?.trim() || cookieToken?.trim();

  if (!token) {
    console.log('❌ 토큰이 없습니다');
    return false;
  }

  try {
    // JWT 토큰의 페이로드 부분을 안전하게 디코드
    const payload = decodeJwtPayload(token);
    if (!payload) {
      console.error('❌ 토큰 페이로드 디코드 실패');
      clearTokens();
      return false;
    }

    const currentTime = Date.now() / 1000;

    // 토큰이 만료되었는지 확인
    if (payload.exp && payload.exp < currentTime) {
      console.log('❌ 토큰이 만료되었습니다:', {
        expiresAt: new Date(payload.exp * 1000).toLocaleString(),
        currentTime: new Date(currentTime * 1000).toLocaleString(),
      });
      clearTokens();
      return false;
    }

    console.log('✅ 토큰이 유효합니다:', {
      expiresAt: new Date(payload.exp * 1000).toLocaleString(),
      timeLeft: Math.floor((payload.exp - currentTime) / 60) + '분',
    });
    return true;
  } catch (error) {
    console.error('❌ 토큰 파싱 오류:', error);
    clearTokens();
    return false;
  }
};

/**
 * access/refresh 토큰을 여러 저장소(localStorage, sessionStorage, Cookies)에 저장
 */
export const saveTokens = (
  accessToken: string,
  refreshToken?: string,
  autoLogin: boolean = false
): void => {
  // 로컬스토리지에 저장
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  // 세션스토리지에 저장
  sessionStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    sessionStorage.setItem('refreshToken', refreshToken);
  }

  // 쿠키에 저장 (보안 강화)
  const maxAge = autoLogin ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30일 또는 1일
  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `accessToken=${accessToken}; Max-Age=${maxAge}; Path=/; SameSite=Strict${secureFlag}`;
  if (refreshToken) {
    document.cookie = `refreshToken=${refreshToken}; Max-Age=${maxAge}; Path=/; SameSite=Strict${secureFlag}`;
  }

  // 자동 로그인 설정 저장
  localStorage.setItem('autoLogin', autoLogin.toString());

  console.log('✅ 토큰 저장 완료:', {
    accessTokenLength: accessToken.length,
    hasRefreshToken: !!refreshToken,
    duration: autoLogin ? '30일' : '일반',
  });
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

  // 쿠키 정리
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');

  // 자동 갱신 타이머 정리
  if (tokenRefreshTimer) {
    clearInterval(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }

  // 앱-웹뷰 동기화
  syncTokenWithApp();

  console.log('🧹 모든 토큰과 지속 로그인 설정이 정리되었습니다');
};

/**
 * 토큰을 여러 저장소에서 삭제
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
export const saveTokensLegacy = (
  accessToken: string,
  refreshToken?: string
): void => {
  const autoLogin = localStorage.getItem('autoLogin') === 'true';

  // 기본 토큰 저장
  saveTokens(accessToken, refreshToken, autoLogin);

  setupTokenRefreshTimer(accessToken);
  syncTokenWithApp(accessToken, refreshToken);

  // 디버깅: 토큰 저장 확인
  console.log('🔐 토큰 저장됨:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    autoLogin,
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
    // 토큰 형식 검증
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('⚠️ 토큰 형식이 올바르지 않습니다:', tokenParts.length);
      return;
    }

    // Base64 디코딩을 안전하게 처리
    let payload;
    try {
      const decodedPayload = atob(tokenParts[1]);
      payload = JSON.parse(decodedPayload);
    } catch (decodeError) {
      console.log('⚠️ 토큰 페이로드 디코딩 실패:', decodeError);
      return;
    }

    const currentTime = Date.now() / 1000;
    const expiresAt = payload.exp;

    if (!expiresAt) {
      console.log('⚠️ 토큰에 만료 시간이 없습니다');
      return;
    }

    // 자동로그인 여부에 따라 갱신 시점 조정
    const autoLogin = localStorage.getItem('autoLogin') === 'true';
    // 자동로그인: 만료 10분 전에 갱신 (더 안전하게)
    // 일반로그인: 만료 5분 전에 갱신 (안전성 향상)
    const refreshOffset = autoLogin ? 10 * 60 : 5 * 60; // 10분 또는 5분
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
      // 기존 타이머 정리
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
      }

      tokenRefreshTimer = setTimeout(async () => {
        console.log('토큰 갱신 타이머 실행');
        try {
          const success = await refreshToken();
          if (!success) {
            console.log('토큰 갱신 타이머 실패, 재설정 시도');
            // 실패 시 1분 후 재시도
            setTimeout(async () => {
              try {
                const retrySuccess = await refreshToken();
                if (!retrySuccess) {
                  console.log('토큰 갱신 재시도도 실패, 로그아웃 처리');
                  await logout();
                }
              } catch (error) {
                console.error('토큰 갱신 재시도 중 에러:', error);
                await logout();
              }
            }, 60 * 1000);
          }
        } catch (error) {
          console.error('토큰 갱신 타이머 실행 중 에러:', error);
          await logout();
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
 * 토큰 갱신 (인스타그램 방식)
 */
export const refreshToken = async (retryCount = 0): Promise<boolean> => {
  try {
    const currentRefreshToken = getRefreshToken();
    const autoLogin = localStorage.getItem('autoLogin') === 'true';
    console.log('토큰 갱신 시도:', { autoLogin, retryCount });

    if (!currentRefreshToken) {
      console.log('❌ Refresh 토큰이 없음 - 로그아웃 처리');
      await logout();
      return false;
    }

    // 토큰 갱신 API 호출
    console.log('🔄 토큰 갱신 API 호출:', {
      endpoint: '/auth/refresh',
      hasRefreshToken: !!currentRefreshToken,
      autoLogin,
      refreshTokenLength: currentRefreshToken?.length,
    });

    const response = await Axios.post('/auth/refresh', {
      refreshToken: currentRefreshToken,
      autoLogin,
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // 새 토큰의 만료시간 확인
    try {
      const payload = decodeJwtPayload(accessToken);
      if (payload?.exp) {
        const expiresAt = new Date(payload.exp * 1000);
        console.log('새 토큰 만료시간:', expiresAt.toLocaleString());
      }
    } catch (e) {
      console.error('새 토큰 디코딩 실패:', e);
    }

    // 새 토큰 저장 (리프레시 토큰이 없으면 기존 것 유지)
    if (newRefreshToken) {
      saveTokens(accessToken, newRefreshToken);
    } else {
      // 리프레시 토큰이 없으면 액세스 토큰만 업데이트
      const currentRefreshTokenForSave = getRefreshToken();
      saveTokens(accessToken, currentRefreshTokenForSave || undefined);
      console.log('⚠️ 서버에서 새 리프레시 토큰을 반환하지 않음, 기존 것 유지');
    }

    // 30일 자동 로그인 설정이 활성화된 경우 쿠키도 갱신
    const isAutoLoginEnabled = localStorage.getItem('autoLogin') === 'true';
    if (isAutoLoginEnabled) {
      const maxAge = 30 * 24 * 60 * 60; // 30일을 초 단위로
      document.cookie = `accessToken=${accessToken}; max-age=${maxAge}; path=/; SameSite=Strict`;
      if (newRefreshToken) {
        document.cookie = `refreshToken=${newRefreshToken}; max-age=${maxAge}; path=/; SameSite=Strict`;
      }
    }

    console.log('✅ 토큰 갱신 완료:', {
      newTokenLength: accessToken.length,
      newRefreshTokenLength: newRefreshToken?.length,
      timestamp: new Date().toLocaleString(),
    });

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
    console.log('❌ 토큰 갱신 최대 재시도 실패 - 로그아웃 처리');
    const remainingToken = getRefreshToken();
    if (!remainingToken) {
      console.log('리프레시 토큰이 없어서 로그아웃 처리');
      await logout();
    } else {
      console.log('리프레시 토큰은 있지만 갱신 실패, 로그아웃 처리');
      // 토큰 갱신 실패 시에도 로그아웃 처리하여 무한로딩 방지
      await logout();
    }
    return false;
  }
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

  // 쿠키에서 제거
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');

  // 자동 갱신 타이머 정리
  if (tokenRefreshTimer) {
    clearInterval(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }

  console.log('🧹 모든 토큰과 지속 로그인 설정이 제거되었습니다');
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

/**
 * 네이티브 앱 환경인지 확인
 */
export const isNativeApp = (): boolean => {
  return !!(window.webkit?.messageHandlers || window.ReactNativeWebView);
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
};

/**
 * 앱 시작 시 자동 로그인 상태 복원
 */
export const restorePersistentLogin = async (): Promise<boolean> => {
  try {
    const persistentLogin = localStorage.getItem('persistentLogin');
    const autoLogin = localStorage.getItem('autoLogin');

    if (persistentLogin !== 'true' && autoLogin !== 'true') {
      console.log('ℹ️ 지속 로그인 설정이 비활성화됨');
      return false;
    }

    const accessToken = getCurrentToken();
    const currentRefreshToken = getRefreshToken();

    if (!accessToken && !currentRefreshToken) {
      console.log('ℹ️ 저장된 토큰이 없음');
      // 토큰이 없으면 지속 로그인 설정 제거
      localStorage.removeItem('persistentLogin');
      localStorage.removeItem('autoLogin');
      return false;
    }

    // 토큰 유효성 확인
    if (accessToken && hasValidToken()) {
      console.log('✅ 저장된 토큰이 유효함 - 자동 로그인 성공');
      return true;
    }

    // accessToken이 만료되었지만 refreshToken이 있는 경우 갱신 시도
    if (currentRefreshToken) {
      console.log('🔄 accessToken 만료, refreshToken으로 갱신 시도');
      const success = await refreshToken();
      if (success) {
        console.log('✅ 토큰 갱신 성공 - 자동 로그인 완료');
        return true;
      } else {
        console.log('❌ 토큰 갱신 실패 - 자동 로그인 실패');
        // 토큰 갱신 실패 시 지속 로그인 설정 제거
        localStorage.removeItem('persistentLogin');
        localStorage.removeItem('autoLogin');
        return false;
      }
    }

    console.log('❌ 자동 로그인 실패 - 토큰 갱신 불가');
    // 자동 로그인 실패 시 지속 로그인 설정 제거
    localStorage.removeItem('persistentLogin');
    localStorage.removeItem('autoLogin');
    return false;
  } catch (error) {
    console.error('자동 로그인 복원 중 오류:', error);
    // 에러 발생 시 지속 로그인 설정 제거
    localStorage.removeItem('persistentLogin');
    localStorage.removeItem('autoLogin');
    return false;
  }
};

/**
 * 자동 로그인 상태 확인 및 설정
 */
export const checkAndSetupAutoLogin = (): void => {
  const persistentLogin = localStorage.getItem('persistentLogin');
  const autoLogin = localStorage.getItem('autoLogin');

  if (persistentLogin === 'true' || autoLogin === 'true') {
    console.log('🔄 자동 로그인 설정 감지됨');

    // 토큰 만료 시간 확인 및 갱신 타이머 설정
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    if (expiresAt) {
      const expiryDate = new Date(expiresAt);
      const now = new Date();
      const timeUntilExpiry = expiryDate.getTime() - now.getTime();

      if (timeUntilExpiry > 0) {
        // 만료 10분 전에 갱신
        const refreshTime = Math.max(timeUntilExpiry - 10 * 60 * 1000, 0);
        console.log(
          `⏰ 토큰 만료 ${Math.floor(timeUntilExpiry / 1000 / 60)}분 전에 자동 갱신 예정`
        );

        setTimeout(async () => {
          console.log('🔄 자동 토큰 갱신 실행');
          try {
            const success = await refreshToken();
            if (!success) {
              console.log('❌ 자동 토큰 갱신 실패 - 지속 로그인 설정 제거');
              // 갱신 실패 시 지속 로그인 설정 제거
              localStorage.removeItem('persistentLogin');
              localStorage.removeItem('autoLogin');
            }
          } catch (error) {
            console.error('자동 토큰 갱신 실패:', error);
            // 에러 발생 시 지속 로그인 설정 제거
            localStorage.removeItem('persistentLogin');
            localStorage.removeItem('autoLogin');
          }
        }, refreshTime);
      } else {
        console.log('⚠️ 토큰이 이미 만료됨 - 즉시 갱신 시도');
        try {
          refreshToken().then((success) => {
            if (!success) {
              console.log('❌ 즉시 토큰 갱신 실패 - 지속 로그인 설정 제거');
              localStorage.removeItem('persistentLogin');
              localStorage.removeItem('autoLogin');
            }
          });
        } catch (error) {
          console.error('즉시 토큰 갱신 실패:', error);
          localStorage.removeItem('persistentLogin');
          localStorage.removeItem('autoLogin');
        }
      }
    } else {
      console.log('⚠️ 토큰 만료 시간 정보가 없음 - 지속 로그인 설정 제거');
      // 만료 시간 정보가 없으면 지속 로그인 설정 제거
      localStorage.removeItem('persistentLogin');
      localStorage.removeItem('autoLogin');
    }
  }
};
