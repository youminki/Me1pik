import Cookies from 'js-cookie';

/**
 * 토큰의 유효성을 검사합니다 (존재 여부와 만료 여부 확인)
 */
export const hasValidToken = (): boolean => {
  const localToken = localStorage.getItem('accessToken');
  const cookieToken = Cookies.get('accessToken');
  const token = localToken?.trim() || cookieToken?.trim();

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
  const cookieToken = Cookies.get('accessToken');
  return localToken?.trim() || cookieToken?.trim() || null;
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
    '/PersonalLink',
    '/test/payple',
    '/test/AddCardPayple',
    '/Link',
  ];

  return publicRoutes.includes(pathname);
};

/**
 * 보호된 경로인지 확인합니다 (토큰이 필요한 경로)
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return !isPublicRoute(pathname);
};
