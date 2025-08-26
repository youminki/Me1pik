import axios from 'axios';
import Cookies from 'js-cookie';

import { isIOS } from './environmentDetection';

// 🔧 인터셉터 없는 전용 axios 인스턴스 (순환 리프레시 방지)
const rawAxios = axios.create({
  baseURL: 'https://api.stylewh.com',
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// 인스타그램 방식 토큰 갱신 타이머
let tokenRefreshTimer: number | null = null;

// 🔧 추가: 중복 갱신 방지(동시성 락)
let refreshInFlight: Promise<boolean> | null = null;

/**
 * JWT 페이로드를 안전하게 디코드합니다 (base64url 규격 대응)
 */
export function decodeJwtPayload(token: string) {
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
 * 🎯 iOS 환경에 최적화된 토큰 읽기 함수
 */
export const getCurrentToken = (): string | null => {
  try {
    const isIOSEnvironment = isIOS();

    if (isIOSEnvironment) {
      // iOS에서는 쿠키를 우선으로 사용 (ITP 대응)
      const cookieToken = Cookies.get('accessToken');
      if (cookieToken?.trim()) {
        return cookieToken.trim();
      }

      // sessionStorage (iOS에서 더 안정적)
      const sessionToken = sessionStorage.getItem('accessToken');
      if (sessionToken?.trim()) {
        return sessionToken.trim();
      }

      // localStorage (마지막 선택)
      const localToken = localStorage.getItem('accessToken');
      if (localToken?.trim()) {
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

    const payload = decodeJwtPayload(token);
    if (!payload) {
      console.log('❌ 토큰 페이로드 디코딩 실패');
      return false;
    }

    // 1. 표준 JWT exp 필드 확인
    if (payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const expiryTime = payload.exp;

      if (currentTime >= expiryTime) {
        console.log('❌ 토큰이 만료됨');
        return false;
      }

      // 만료 5분 전 경고
      const timeUntilExpiry = expiryTime - currentTime;
      if (timeUntilExpiry <= 300) {
        console.log('⚠️ 토큰이 곧 만료됨 (5분 이내)');
      }

      return true;
    }

    // 2. 커스텀 토큰 - 기본 만료 시간 (24시간)
    const tokenAge = Date.now() - (payload.iat ? payload.iat * 1000 : 0);
    const maxAge = 24 * 60 * 60 * 1000; // 24시간

    if (tokenAge > maxAge) {
      console.log('❌ 커스텀 토큰이 만료됨');
      return false;
    }

    return true;
  } catch (error) {
    console.error('토큰 유효성 검사 중 오류:', error);
    return false;
  }
};

/**
 * 🎯 토큰 유효성 또는 갱신 가능성 확인
 */
export const hasValidTokenOrRefreshable = (): boolean => {
  try {
    // 1. 현재 토큰이 유효한 경우
    if (hasValidToken()) {
      return true;
    }

    // 2. refreshToken이 있는 경우 갱신 가능
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      console.log('🔄 refreshToken 존재 - 갱신 가능');
      return true;
    }

    return false;
  } catch (error) {
    console.error('토큰 상태 확인 중 오류:', error);
    return false;
  }
};

/**
 * 🎯 토큰을 저장합니다 (인스타그램 방식)
 */
export const saveTokens = (
  accessToken: string,
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

      Cookies.set('accessToken', accessToken, cookieOptions);
      if (refreshToken) {
        Cookies.set('refreshToken', refreshToken, cookieOptions);
      }

      // 2. sessionStorage (iOS에서 더 안정적)
      sessionStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        sessionStorage.setItem('refreshToken', refreshToken);
      }

      // 3. localStorage (백업)
      if (keepLogin) {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('keepLoginSetting', 'true');
        localStorage.setItem('autoLogin', 'true');
        localStorage.setItem('persistentLogin', 'true');
        localStorage.setItem('loginTimestamp', Date.now().toString());
        console.log('🔐 iOS: 자동 로그인 설정 활성화 완료');
      }
    } else {
      // 일반 웹 환경: 최적화된 로직
      if (keepLogin) {
        // 1. localStorage에 저장 (브라우저 종료 후에도 유지)
        localStorage.setItem('accessToken', accessToken);
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
        sessionStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          sessionStorage.setItem('refreshToken', refreshToken);
        }
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('keepLoginSetting', 'false');
        console.log('📱 웹: sessionStorage에 토큰 저장 완료 (세션 로그인)');
      }

      // 3. 쿠키 저장 제거 - 바디 기반 인증으로 통일
      // const cookieOptions = {
      //   path: '/',
      //   secure: window.location.protocol === 'https:',
      //   sameSite: 'strict' as const,
      //   expires: keepLogin ? 30 : 1,
      // };
      // Cookies.set('accessToken', accessToken, cookieOptions);
      // if (refreshToken) {
      //   Cookies.set('refreshToken', refreshToken, cookieOptions);
      // }
      // console.log('🍪 웹: 쿠키에 토큰 저장 완료');
    }

    // 🎯 토큰 저장 후 자동으로 타이머 설정
    try {
      setupOptimizedTokenRefreshTimer(accessToken);
    } catch (e) {
      console.error('토큰 저장 후 타이머 설정 실패:', e);
    }

    console.log('✅ 토큰 저장 완료');
  } catch (error) {
    console.error('토큰 저장 중 오류:', error);
  }
};

/**
 * 🎯 모든 토큰과 인터벌을 정리합니다
 */
export const clearAllTokensAndIntervals = (): void => {
  try {
    console.log('🧹 모든 토큰과 인터벌 정리 시작');

    // 1. 토큰 타이머 정리
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
      tokenRefreshTimer = null;
      console.log('⏰ 토큰 갱신 타이머 정리 완료');
    }

    // 2. 전역 타이머 정리
    if (typeof window !== 'undefined' && window.tokenRefreshTimer) {
      clearTimeout(window.tokenRefreshTimer);
      window.tokenRefreshTimer = undefined;
      console.log('🌐 전역 토큰 갱신 타이머 정리 완료');
    }

    // 3. 저장소에서 토큰 제거
    clearTokens();

    // 4. 로그인 상태 초기화
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('keepLoginSetting');
    localStorage.removeItem('autoLogin');
    localStorage.removeItem('persistentLogin');
    localStorage.removeItem('loginTimestamp');
    localStorage.removeItem('tokenExpiresAt');

    console.log('✅ 모든 토큰과 인터벌 정리 완료');
  } catch (error) {
    console.error('토큰과 인터벌 정리 중 오류:', error);
  }
};

/**
 * 🎯 개선된 refreshToken 읽기 함수 - 쿠키 의존성 제거
 */
export const getRefreshToken = (): string | null => {
  try {
    const localToken = localStorage.getItem('refreshToken');
    if (localToken?.trim()) return localToken.trim();

    const sessionToken = sessionStorage.getItem('refreshToken');
    if (sessionToken?.trim()) return sessionToken.trim();

    // iOS 보강: 쿠키도 마지막 fallback
    if (isIOS()) {
      const cookieRT = Cookies.get('refreshToken');
      if (cookieRT?.trim()) return cookieRT.trim();
    }
    return null;
  } catch (e) {
    console.error('refreshToken 읽기 중 오류:', e);
    return null;
  }
};

/**
 * 🎯 iOS 환경에 최적화된 토큰 갱신 타이머 설정
 */
/**
 * 🚨 레거시 타이머 설정 함수 (호환성 유지용)
 *
 * ⚠️  주의: 이 함수는 이중 타이머를 생성할 수 있습니다.
 * 🎯  권장: setupOptimizedTokenRefreshTimer() 사용
 *
 * @param token - 액세스 토큰
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
    const refreshOffset = isIOSEnvironment ? 15 * 60 : 10 * 60; // iOS: 15분, 웹: 10분
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
    tokenRefreshTimer = window.setTimeout(async () => {
      console.log('🔄 토큰 갱신 타이머 실행');
      try {
        // refreshToken 함수를 직접 호출 (순환 의존성 방지)
        const success = await refreshToken();
        if (success) {
          console.log('✅ 토큰 갱신 성공 - 새로운 갱신 타이머 설정');
          const newToken = getCurrentToken();
          if (newToken) {
            setupTokenRefreshTimer(newToken);
          }
        } else {
          console.log('❌ 토큰 갱신 실패');
          // 토큰 갱신 실패 시 지속 로그인 설정 제거
          clearTokens();
          localStorage.removeItem('autoLogin');
          localStorage.removeItem('persistentLogin');
        }
      } catch (error) {
        console.error('토큰 갱신 중 오류:', error);
        // 에러 발생 시 지속 로그인 설정 제거
        clearTokens();
        localStorage.removeItem('autoLogin');
        localStorage.removeItem('persistentLogin');
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
  // 🔧 추가: 중복 갱신 방지(동시성 락)
  if (refreshInFlight) return refreshInFlight; // 이미 진행중이면 그 결과 재사용

  refreshInFlight = (async () => {
    try {
      // 🎯 네트워크 상태 확인
      if (!navigator.onLine) {
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
          const response = await rawAxios.post('/auth/refresh', {
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
              saveTokens(accessToken, newRefreshToken, autoLogin);
            } else {
              // 재시도 중인 경우 타이머 설정 없이 저장
              saveTokens(accessToken, newRefreshToken, autoLogin);
            }
          } else {
            // 리프레시 토큰이 없으면 액세스 토큰만 업데이트
            const currentRefreshTokenForSave = getRefreshToken();
            if (currentRetryCount === 0) {
              saveTokens(
                accessToken,
                currentRefreshTokenForSave || undefined,
                autoLogin
              );
            } else {
              saveTokens(
                accessToken,
                currentRefreshTokenForSave || undefined,
                autoLogin
              );
            }
          }

          // 🎯 토큰 갱신 성공 이벤트 발생
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('tokenRefreshSuccess', {
                detail: {
                  message: '토큰 갱신 성공',
                  timestamp: new Date().toISOString(),
                },
              })
            );
          }

          console.log('✅ 토큰 갱신 성공');

          // 🎯 성공 시 항상 타이머 재설치 (방어선)
          try {
            const latest = getCurrentToken();
            if (latest) {
              setupOptimizedTokenRefreshTimer(latest); // ✅ 성공 후 항상 재설치
            }
          } catch (e) {
            console.error('토큰 갱신 성공 후 타이머 재설치 실패:', e);
          }

          return true;
        } catch (error: unknown) {
          console.error(`토큰 갱신 시도 ${currentRetryCount + 1} 실패:`, error);

          // 🔧 추가: 토큰 에러 이벤트 발생
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('tokenError', {
                detail: {
                  context: 'refreshToken',
                  error: String(error),
                },
              })
            );
          }

          // 🎯 401 에러는 재시도하지 않음
          const errorResponse = error as { response?: { status?: number } };
          if (errorResponse?.response?.status === 401) {
            console.log('❌ 401 에러 - 재시도 중단');
            break;
          }

          currentRetryCount++;
          if (currentRetryCount <= maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, currentRetryCount), 5000);
            console.log(`⏳ ${delay}ms 후 재시도...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      console.log('❌ 최대 재시도 횟수 초과');

      // 🔧 추가: 토큰 갱신 실패 이벤트 발생
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('tokenRefreshFailed', {
            detail: {
              message: '토큰 갱신 실패',
              timestamp: new Date().toISOString(),
            },
          })
        );
      }

      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
};

/**
 * 🎯 토큰을 정리합니다
 */
export const clearTokens = (): void => {
  try {
    console.log('🧹 토큰 정리 시작');

    // 1. 저장소에서 토큰 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');

    // 2. iOS 대응: 쿠키도 제거 (path 반드시 일치)
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });

    // 3. 로그인 상태 초기화
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('isLoggedIn');

    console.log('✅ 토큰 정리 완료');
  } catch (error) {
    console.error('토큰 정리 중 오류:', error);
  }
};

/**
 * 🎯 성능 최적화된 토큰 갱신 타이머 (iOS + 일반 환경)
 */
export const setupOptimizedTokenRefreshTimer = (accessToken: string): void => {
  try {
    console.log('⚡ 성능 최적화된 토큰 갱신 타이머 설정 시작');

    // 기존 타이머 정리
    if (typeof window !== 'undefined' && window.tokenRefreshTimer) {
      clearTimeout(window.tokenRefreshTimer);
      window.tokenRefreshTimer = undefined;
    }

    // 토큰 만료 시간 계산
    const payload = decodeJwtPayload(accessToken);
    if (!payload?.exp) {
      console.log('⚠️ 토큰 만료 시간을 계산할 수 없음');
      return;
    }

    const tokenExpiry = new Date(payload.exp * 1000);
    const isIOSEnvironment = isIOS();
    const refreshOffset = isIOSEnvironment ? 30 : 20; // iOS: 30분, 일반: 20분 (7시간 토큰 기준)
    const refreshTime = new Date(
      tokenExpiry.getTime() - refreshOffset * 60 * 1000
    );
    const now = new Date();

    if (refreshTime <= now) {
      console.log('⚡ 토큰이 곧 만료됨 - 즉시 갱신 시도');
      refreshToken();
      return;
    }

    const timeUntilRefresh = refreshTime.getTime() - now.getTime();

    console.log('⚡ 최적화된 토큰 갱신 타이밍 설정');
    console.log('- 토큰 만료 시간:', tokenExpiry.toLocaleString());
    console.log('- 갱신 예정 시간:', refreshTime.toLocaleString());
    console.log(
      '- 갱신까지 남은 시간:',
      Math.round(timeUntilRefresh / 1000 / 60),
      '분'
    );

    // 성능 최적화된 타이머 설정
    const timer: number = window.setTimeout(() => {
      console.log('⚡ 최적화된 토큰 갱신 타이머 실행');
      refreshToken();
    }, timeUntilRefresh);

    // 전역 타이머 참조 저장
    if (typeof window !== 'undefined') {
      window.tokenRefreshTimer = timer;
      window.tokenRefreshTime = refreshTime;
    }

    console.log('✅ 성능 최적화된 토큰 갱신 타이머 설정 완료');
  } catch (error) {
    console.error('⚡ 성능 최적화된 토큰 갱신 타이머 설정 중 오류:', error);
  }
};
