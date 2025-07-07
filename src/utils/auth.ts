import Cookies from 'js-cookie';

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
};

/**
 * 토큰을 저장합니다
 */
export const saveTokens = (
  accessToken: string,
  refreshToken?: string
): void => {
  localStorage.setItem('accessToken', accessToken);
  Cookies.set('accessToken', accessToken, { path: '/' });

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
    Cookies.set('refreshToken', refreshToken, { path: '/' });
  }
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
 * 로그아웃 처리를 합니다 (무신사 스타일)
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
 * 무신사 스타일 자동로그인 체크
 */
export const checkAutoLogin = (): boolean => {
  const token = getCurrentToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;

    // 토큰이 유효한지 확인
    if (payload.exp && payload.exp < currentTime) {
      console.log('토큰이 만료되어 자동로그인 불가');
      clearTokens();
      return false;
    }

    console.log('자동로그인 가능');
    return true;
  } catch (error) {
    console.log('토큰 파싱 오류로 자동로그인 불가:', error);
    clearTokens();
    return false;
  }
};

/**
 * 앱에서 토큰이 항상 저장되어 있는지 확인
 */
export const ensureAppToken = (): boolean => {
  const token = getCurrentToken();
  if (token) {
    console.log('앱에 토큰이 저장되어 있음');
    return true;
  }

  console.log('앱에 토큰이 없음');
  return false;
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
 * 보호된 라우트에서 토큰 체크 및 리다이렉트
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
