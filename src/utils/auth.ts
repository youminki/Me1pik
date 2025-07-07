import Cookies from 'js-cookie';

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
      console.log('토큰이 만료되었습니다.');
      // 만료된 토큰 제거
      clearTokens();
      return false;
    }

    return true;
  } catch (error) {
    console.log('토큰 파싱 오류:', error);
    // 잘못된 토큰 제거
    clearTokens();
    return false;
  }
};

/**
 * 모든 토큰을 제거합니다
 */
export const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');

  // 토큰 갱신 타이머 정리
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }

  // 앱에 로그아웃 이벤트 전달
  notifyAppLogout();
};

/**
 * 토큰을 저장합니다 (인스타그램 방식)
 */
export const saveTokens = (
  accessToken: string,
  refreshToken?: string
): void => {
  // 다중 저장소에 토큰 저장
  localStorage.setItem('accessToken', accessToken);
  sessionStorage.setItem('accessToken', accessToken);
  Cookies.set('accessToken', accessToken, { path: '/' });

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    Cookies.set('refreshToken', refreshToken, { path: '/' });
  }

  // 토큰 갱신 타이머 설정
  setupTokenRefreshTimer(accessToken);

  // 앱에 로그인 이벤트 전달
  notifyAppLogin(accessToken, refreshToken);
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

      console.log(`토큰 갱신 타이머 설정: ${refreshTime}ms 후`);
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
      console.log('리프레시 토큰이 없습니다.');
      return false;
    }

    // 토큰 갱신 API 호출
    const { Axios } = await import('../api/Axios');
    const response = await Axios.post('/auth/refresh', {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // 새 토큰 저장
    saveTokens(accessToken, newRefreshToken);

    console.log('토큰 갱신 성공');
    return true;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    // 갱신 실패 시 로그아웃
    await logout();
    return false;
  }
};

/**
 * 앱에 로그인 이벤트 전달
 */
const notifyAppLogin = (accessToken: string, refreshToken?: string): void => {
  // 네이티브 앱에 로그인 정보 전달
  if (window.webkit?.messageHandlers?.loginHandler) {
    window.webkit.messageHandlers.loginHandler.postMessage({
      type: 'login',
      token: accessToken,
      refreshToken: refreshToken,
    });
  }

  // 커스텀 이벤트로 웹뷰에 알림
  window.dispatchEvent(
    new CustomEvent('webLoginSuccess', {
      detail: {
        token: accessToken,
        refreshToken: refreshToken,
      },
    })
  );
};

/**
 * 앱에 로그아웃 이벤트 전달
 */
const notifyAppLogout = (): void => {
  // 네이티브 앱에 로그아웃 알림
  const messageHandlers = window.webkit?.messageHandlers;
  if (messageHandlers && 'logoutHandler' in messageHandlers) {
    (messageHandlers as any).logoutHandler.postMessage({
      type: 'logout',
    });
  }

  // 커스텀 이벤트로 웹뷰에 알림
  window.dispatchEvent(new CustomEvent('webLogout'));
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
      try {
        const { logoutUser } = await import('../api/user/userApi');
        await logoutUser(email);
      } catch (error) {
        console.log('서버 로그아웃 실패 (무시됨):', error);
      }
    }
  } catch (error) {
    console.log('로그아웃 처리 중 오류:', error);
  } finally {
    // 모든 토큰 제거
    clearTokens();

    // Axios 헤더 초기화
    const { Axios } = await import('../api/Axios');
    Axios.defaults.headers.Authorization = '';

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
  // 앱에서는 항상 localStorage에 저장 (영구 보관)
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  // Cookies에도 저장 (웹뷰 호환성)
  Cookies.set('accessToken', accessToken, { path: '/' });
  if (refreshToken) {
    Cookies.set('refreshToken', refreshToken, { path: '/' });
  }

  // 토큰 갱신 타이머 설정
  setupTokenRefreshTimer(accessToken);

  console.log('앱에 토큰 강제 저장 완료');
};

/**
 * 토큰이 없을 때 로그인 페이지로 이동하는 함수
 */
export const redirectToLoginIfNoToken = (): boolean => {
  const token = getCurrentToken();
  if (!token) {
    console.log('토큰이 없어 로그인 페이지로 이동');
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
    console.log('보호된 라우트에서 토큰이 없어 로그인 페이지로 이동');
    window.location.href = '/login';
    return true; // 이동됨
  }

  return false; // 이동하지 않음
};

/**
 * 앱에서 받은 로그인 정보 처리 (인스타그램 방식)
 */
export const handleAppLogin = (loginInfo: {
  token: string;
  refreshToken?: string;
  email?: string;
}): void => {
  console.log('앱에서 로그인 정보 수신:', loginInfo);

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
  console.log('앱에서 로그아웃 요청 수신');
  logout();
};

/**
 * 앱에서 웹뷰로 로그아웃 이벤트 전달 (Swift에서 호출)
 */
export const sendLogoutToWebView = (): void => {
  console.log('앱에서 웹뷰로 로그아웃 이벤트 전달');

  if ((window as any).sendLogoutToWebView) {
    (window as any).sendLogoutToWebView();
  } else {
    // 웹뷰 통신 스크립트가 로드되지 않은 경우 직접 처리
    console.log('웹뷰 통신 스크립트가 로드되지 않음, 직접 로그아웃 처리');
    logout();
  }
};

/**
 * 앱에서 웹뷰로 토큰 갱신 이벤트 전달 (Swift에서 호출)
 */
export const sendTokenRefreshToWebView = (
  newToken: string,
  newRefreshToken?: string
): void => {
  console.log('앱에서 웹뷰로 토큰 갱신 이벤트 전달');

  if ((window as any).sendTokenRefreshToWebView) {
    (window as any).sendTokenRefreshToWebView(newToken, newRefreshToken);
  } else {
    // 웹뷰 통신 스크립트가 로드되지 않은 경우 직접 처리
    console.log('웹뷰 통신 스크립트가 로드되지 않음, 직접 토큰 갱신 처리');
    saveTokens(newToken, newRefreshToken);
  }
};

/**
 * 로그인 상태 유지 설정 저장 (인스타그램 방식)
 */
export const saveKeepLoginSetting = (keepLogin: boolean): void => {
  localStorage.setItem('keepLoginSetting', keepLogin.toString());
  console.log('로그인 상태 유지 설정 저장:', keepLogin);
};

/**
 * 로그인 상태 유지 설정 가져오기 (인스타그램 방식)
 */
export const getKeepLoginSetting = (): boolean => {
  const setting = localStorage.getItem('keepLoginSetting');
  return setting === 'true';
};

/**
 * 인스타그램 방식 로그인 상태 유지 토큰 저장
 */
export const saveTokensWithKeepLogin = (
  accessToken: string,
  refreshToken?: string,
  keepLogin: boolean = false
): void => {
  // 로그인 상태 유지 설정 저장
  saveKeepLoginSetting(keepLogin);

  if (keepLogin) {
    // 로그인 상태 유지: localStorage에 저장 (영구 보관)
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    console.log('localStorage에 토큰 저장됨 (로그인 상태 유지)');
  } else {
    // 세션 유지: sessionStorage에 저장 (브라우저 닫으면 삭제)
    sessionStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      sessionStorage.setItem('refreshToken', refreshToken);
    }
    console.log('sessionStorage에 토큰 저장됨 (세션 유지)');
  }

  // Cookies에도 저장 (웹뷰 호환성)
  Cookies.set('accessToken', accessToken, { path: '/' });
  if (refreshToken) {
    Cookies.set('refreshToken', refreshToken, { path: '/' });
  }

  // 토큰 갱신 타이머 설정
  setupTokenRefreshTimer(accessToken);

  // 앱에 로그인 이벤트 전달
  notifyAppLogin(accessToken, refreshToken);
};

/**
 * 인스타그램 방식 로그인 상태 확인
 */
export const checkInstagramLoginStatus = (): boolean => {
  // localStorage와 sessionStorage 모두 확인
  const localToken = localStorage.getItem('accessToken');
  const sessionToken = sessionStorage.getItem('accessToken');
  const cookieToken = Cookies.get('accessToken');

  const token =
    localToken?.trim() || sessionToken?.trim() || cookieToken?.trim();

  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;

    // 토큰이 만료되었는지 확인
    if (payload.exp && payload.exp < currentTime) {
      console.log('토큰이 만료되어 로그인 상태 유지 불가');
      clearTokens();
      return false;
    }

    console.log('인스타그램 방식 로그인 상태 유지 가능');
    return true;
  } catch (error) {
    console.log('토큰 파싱 오류로 로그인 상태 유지 불가:', error);
    clearTokens();
    return false;
  }
};
