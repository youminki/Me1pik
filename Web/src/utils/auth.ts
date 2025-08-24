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
 * 🎯 개선된 토큰 읽기 함수 - 우선순위 명확화
 */
export const getCurrentToken = (): string | null => {
  try {
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
 * 🎯 토큰 만료 시간 검증 및 수정
 */
const validateAndFixTokenExpiry = (accessToken: string): Date | null => {
  try {
    const payload = decodeJwtPayload(accessToken);
    if (!payload?.exp) {
      return null;
    }

    const expiresAt = new Date(payload.exp * 1000);
    const now = new Date();

    // 🎯 만료 시간이 과거인 경우 검증
    if (expiresAt <= now) {
      return null;
    }

    // 🎯 만료 시간이 너무 먼 미래인 경우 검증 (1년 이상)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (expiresAt > oneYearFromNow) {
      return null;
    }

    return expiresAt;
  } catch (error) {
    console.error('토큰 만료 시간 검증 실패:', error);
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
 * 토큰 갱신 타이머 설정 (인스타그램 방식)
 */
export const setupTokenRefreshTimer = (token: string): void => {
  try {
    // 🎯 🚨 핵심 수정: decodeJwtPayload 사용으로 base64url 일관성 보장
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) {
      return;
    }

    const currentTime = Date.now() / 1000;
    const expiresAt = payload.exp as number;

    // 자동로그인 여부에 따라 갱신 시점 조정
    const autoLogin = localStorage.getItem('autoLogin') === 'true';
    // 자동로그인: 만료 10분 전에 갱신 (더 안전하게)
    // 일반로그인: 만료 5분 전에 갱신 (안전성 향상)
    const refreshOffset = autoLogin ? 10 * 60 : 5 * 60; // 10분 또는 5분
    const refreshTime = (expiresAt - currentTime - refreshOffset) * 1000;

    // 🎯 🚨 핵심 수정: 시간 검증 로직 개선
    const ms = Math.min(Math.max(refreshTime, 0), 30 * 24 * 60 * 60 * 1000);

    if (ms > 0) {
      // 기존 타이머 정리
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
        tokenRefreshTimer = null;
      }

      tokenRefreshTimer = setTimeout(async () => {
        try {
          const success = await refreshToken();
          if (success) {
            // 🎯 🚨 핵심 수정: 성공 시 다음 토큰으로 타이머 재설정
            const nextToken = getCurrentToken();
            if (nextToken) {
              setupTokenRefreshTimer(nextToken);
            }
          } else {
            // 🎯 실패 시 1분 후 재시도
            setTimeout(async () => {
              try {
                const retrySuccess = await refreshToken();
                if (!retrySuccess) {
                  // 🎯 즉시 로그아웃하지 않고 이벤트 발생
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                      new CustomEvent('autoLoginFailed', {
                        detail: {
                          reason: '타이머 갱신 실패',
                          message:
                            '자동 로그인이 만료되었습니다. 다시 로그인해주세요.',
                          timestamp: new Date().toLocaleString(),
                        },
                      })
                    );

                    // 3초 후 로그인 페이지로 이동
                    setTimeout(() => {
                      if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                      }
                    }, 3000);
                  }
                }
              } catch (error) {
                console.error('토큰 갱신 재시도 중 에러:', error);
                // 🎯 에러 시에도 이벤트 발생
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('autoLoginFailed', {
                      detail: {
                        reason: '타이머 갱신 에러',
                        message:
                          '자동 로그인 중 오류가 발생했습니다. 다시 로그인해주세요.',
                        timestamp: new Date().toLocaleString(),
                      },
                    })
                  );
                }
              }
            }, 60 * 1000);
          }
        } catch (error) {
          console.error('토큰 갱신 타이머 실행 중 에러:', error);
          // 🎯 에러 시에도 이벤트 발생
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('autoLoginFailed', {
                detail: {
                  reason: '타이머 실행 에러',
                  message:
                    '자동 로그인 중 오류가 발생했습니다. 다시 로그인해주세요.',
                  timestamp: new Date().toLocaleString(),
                },
              })
            );
          }
        }
      }, ms);
    }
  } catch (error) {
    console.error('토큰 갱신 타이머 설정 실패:', error);
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

    if (persistentLogin === 'true' || autoLogin === 'true') {
      console.log('🔄 자동 로그인 설정 감지됨');

      // 🎯 🚨 핵심 수정: tokenExpiresAt에 의존하지 않고 직접 토큰의 exp 읽기
      const accessToken = getCurrentToken();
      const payload = accessToken ? decodeJwtPayload(accessToken) : null;

      if (payload?.exp) {
        const currentTime = Date.now() / 1000;
        const expiresAt = payload.exp;
        const timeUntilExpiry = expiresAt - currentTime;

        if (timeUntilExpiry > 0) {
          // 만료 10분 전에 갱신
          const refreshTime = Math.max(timeUntilExpiry - 10 * 60, 0);
          console.log(
            `⏰ 토큰 만료 ${Math.floor(timeUntilExpiry / 60)}분 전에 자동 갱신 예정`
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
    window.webkit?.messageHandlers ||
    window.nativeApp ||
    window.ReactNativeWebView ||
    // iOS WebKit 환경 추가 감지
    (/iPad|iPhone|iPod/.test(navigator.userAgent) && window.webkit)
  );
};

/**
 * iOS 앱 환경인지 확인
 */
export const isIOSApp = (): boolean => {
  return !!(
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    window.webkit?.messageHandlers
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
 * 🎯 개선된 자동 로그인 상태 복원 - 단계별 처리
 */
export const restorePersistentLogin = async (): Promise<boolean> => {
  try {
    console.log('🔄 자동 로그인 복원 시작');

    // 1. 지속 로그인 설정 확인
    const persistentLogin = localStorage.getItem('persistentLogin');
    const autoLogin = localStorage.getItem('autoLogin');

    if (persistentLogin !== 'true' && autoLogin !== 'true') {
      console.log('ℹ️ 지속 로그인 설정이 비활성화됨');
      return false;
    }

    console.log('✅ 지속 로그인 설정 감지됨:', { persistentLogin, autoLogin });

    // 2. 현재 토큰 상태 확인
    const accessToken = getCurrentToken();
    const currentRefreshToken = getRefreshToken();

    console.log('📊 저장된 토큰 상태:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!currentRefreshToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: currentRefreshToken?.length || 0,
    });

    // 3. 토큰이 전혀 없는 경우
    if (!accessToken && !currentRefreshToken) {
      console.log('ℹ️ 저장된 토큰이 없음');
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

      // 🎯 최대 2회 재시도 (기존 3회에서 감소)
      let retryCount = 0;
      const maxRetries = 2;

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
            console.log(`⏳ ${retryCount}초 후 재시도...`);
            await new Promise((resolve) =>
              setTimeout(resolve, retryCount * 1000)
            );
          }
        } catch (error) {
          console.error(`토큰 갱신 시도 ${retryCount + 1} 실패:`, error);
          retryCount++;

          if (retryCount < maxRetries) {
            console.log(`⏳ ${retryCount}초 후 재시도...`);
            await new Promise((resolve) =>
              setTimeout(resolve, retryCount * 1000)
            );
          }
        }
      }

      // 🎯 모든 재시도 실패 시
      console.log('❌ 모든 토큰 갱신 시도 실패');

      // iOS 앱 환경에서는 네이티브 이벤트만 발생
      if (typeof window !== 'undefined' && window.webkit?.messageHandlers) {
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
