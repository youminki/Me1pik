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
        console.log('📱 iOS: 쿠키에서 accessToken 발견');
        return cookieToken.trim();
      }

      // sessionStorage (iOS에서 더 안정적)
      const sessionToken = sessionStorage.getItem('accessToken');
      if (sessionToken?.trim()) {
        console.log('📱 iOS: sessionStorage에서 accessToken 발견');
        return sessionToken.trim();
      }

      // localStorage (마지막 선택)
      const localToken = localStorage.getItem('accessToken');
      if (localToken?.trim()) {
        console.log('📱 iOS: localStorage에서 accessToken 발견');
        return localToken.trim();
      }
    } else {
      // 일반 환경: 기존 로직 유지
      // 1. localStorage (가장 안정적, 브라우저 종료 후에도 유지)
      const localToken = localStorage.getItem('accessToken');
      if (localToken?.trim()) {
        console.log('💾 웹: localStorage에서 accessToken 발견');
        return localToken.trim();
      }

      // 2. sessionStorage (탭별 세션)
      const sessionToken = sessionStorage.getItem('accessToken');
      if (sessionToken?.trim()) {
        console.log('💾 웹: sessionStorage에서 accessToken 발견');
        return sessionToken.trim();
      }

      // 3. Cookies (백업, 보안 강화)
      const cookieToken = Cookies.get('accessToken');
      if (cookieToken?.trim()) {
        console.log('💾 웹: 쿠키에서 accessToken 발견');
        return cookieToken.trim();
      }
    }

    try {
      console.log('❌ accessToken을 찾을 수 없음');
    } catch (logError) {
      console.error('accessToken 없음 로깅 중 오류:', logError);
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
        try {
          console.log('⚠️ 토큰이 곧 만료됨 (5분 이내)');
        } catch (logError) {
          console.error('토큰 만료 경고 로깅 중 오류:', logError);
        }
      }

      return true;
    }

    // 2. 커스텀 토큰 - 기본 만료 시간 (7시간, iOS 최적화)
    const tokenAge = Date.now() - (payload.iat ? payload.iat * 1000 : 0);
    const maxAge = 7 * 60 * 60 * 1000; // 7시간 (iOS 최적화)

    if (tokenAge > maxAge) {
      console.log('❌ 커스텀 토큰이 만료됨 (7시간 초과)');
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
      try {
        console.log('🔄 refreshToken 존재 - 갱신 가능');
      } catch (logError) {
        console.error('refreshToken 존재 로깅 중 오류:', logError);
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('토큰 상태 확인 중 오류:', error);
    return false;
  }
};

/**
 * 🎯 토큰을 저장합니다 (30일 자동로그인 보장)
 */
export const saveTokens = (
  accessToken: string,
  refreshToken?: string,
  keepLogin: boolean = true
): void => {
  try {
    const isIOSEnvironment = isIOS();

    if (isIOSEnvironment) {
      console.log('📱 iOS 환경: 30일 자동로그인 토큰 저장 시작');

      // 1. 쿠키에 우선 저장 (iOS ITP 대응, 30일 유지)
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

      // 2. sessionStorage (iOS에서 더 안정적, 30일 유지)
      sessionStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        sessionStorage.setItem('refreshToken', refreshToken);
      }

      // 3. localStorage (30일 백업, 브라우저 종료 후에도 유지)
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

        // 30일 만료 시간 설정
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        localStorage.setItem('tokenExpiresAt', thirtyDaysFromNow.toISOString());

        console.log('🔐 iOS: 30일 자동 로그인 설정 활성화 완료');
        console.log('📅 만료 시간:', thirtyDaysFromNow.toLocaleDateString());
      }
    } else {
      // 일반 웹 환경: 30일 자동로그인 보장
      if (keepLogin) {
        // 1. localStorage에 저장 (브라우저 종료 후에도 30일 유지)
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('keepLoginSetting', 'true');
        localStorage.setItem('autoLogin', 'true');
        localStorage.setItem('persistentLogin', 'true');
        localStorage.setItem('loginTimestamp', Date.now().toString());

        // 30일 만료 시간 설정
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        localStorage.setItem('tokenExpiresAt', thirtyDaysFromNow.toISOString());

        console.log(
          '💾 웹: localStorage에 토큰 저장 완료 (30일 자동 로그인 활성화)'
        );
        console.log('📅 만료 시간:', thirtyDaysFromNow.toLocaleDateString());
      } else {
        // 2. sessionStorage에 저장 (탭별 세션, 1일)
        sessionStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          sessionStorage.setItem('refreshToken', refreshToken);
        }
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('keepLoginSetting', 'false');

        // 1일 만료 시간 설정
        const oneDayFromNow = new Date();
        oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
        sessionStorage.setItem('tokenExpiresAt', oneDayFromNow.toISOString());

        console.log('📱 웹: sessionStorage에 토큰 저장 완료 (1일 세션 로그인)');
        console.log('📅 만료 시간:', oneDayFromNow.toLocaleDateString());
      }

      // 3. 쿠키 저장 (30일 또는 1일)
      const cookieOptions = {
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'strict' as const,
        expires: keepLogin ? 30 : 1,
      };

      Cookies.set('accessToken', accessToken, cookieOptions);
      if (refreshToken) {
        Cookies.set('refreshToken', refreshToken, cookieOptions);
      }
      console.log('🍪 웹: 쿠키에 토큰 저장 완료 (30일 또는 1일)');
    }

    // 🎯 토큰 저장 후 자동으로 타이머 설정 (안전한 지연)
    try {
      // 🔧 개선: 약간의 지연 후 타이머 설정 (저장 완료 보장)
      setTimeout(() => {
        console.log('⏰ 토큰 저장 완료 후 타이머 설정 시작');
        try {
          setupTokenRefreshTimer(accessToken);
        } catch (timerError) {
          console.error('토큰 저장 후 타이머 설정 중 오류:', timerError);
        }
      }, 100);
    } catch (e) {
      console.error('토큰 저장 후 타이머 설정 실패:', e);
    }

    console.log('✅ 토큰 저장 완료');
    try {
      console.log('📊 저장된 토큰 정보:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length || 0,
        refreshTokenLength: refreshToken?.length || 0,
        keepLogin,
        isIOS: isIOS(),
        timestamp: new Date().toLocaleString(),
        expiryDate: keepLogin
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
      });
    } catch (logError) {
      console.error('저장된 토큰 정보 로깅 중 오류:', logError);
    }
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

    // 1. 토큰 타이머 정리 (모든 종류)
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
      console.log(
        '⏰ 로컬 토큰 갱신 타이머 정리 완료 (ID:',
        tokenRefreshTimer,
        ')'
      );
      tokenRefreshTimer = null;
    }

    // 2. 전역 타이머 정리
    if (typeof window !== 'undefined' && window.tokenRefreshTimer) {
      clearTimeout(window.tokenRefreshTimer);
      console.log(
        '🌐 전역 토큰 갱신 타이머 정리 완료 (ID:',
        window.tokenRefreshTimer,
        ')'
      );
      window.tokenRefreshTimer = undefined;
    }

    // 3. 추가 타이머 정리 (안전장치)
    if (typeof window !== 'undefined') {
      try {
        // 모든 타이머 관련 전역 변수 정리
        const oldGlobalTimer = window.tokenRefreshTimer;
        const oldGlobalTime = window.tokenRefreshTime;

        delete window.tokenRefreshTimer;
        delete window.tokenRefreshTime;

        console.log('🧹 전역 타이머 변수 정리 완료:', {
          oldTimerId: oldGlobalTimer,
          oldScheduledTime: oldGlobalTime?.toLocaleString(),
        });
      } catch (globalError) {
        console.error('전역 타이머 변수 정리 중 오류:', globalError);
      }
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
    // 🔧 개선: 우선순위 기반 토큰 읽기
    // 1. localStorage (가장 안정적)
    const localToken = localStorage.getItem('refreshToken');
    if (localToken?.trim()) {
      console.log('🔄 localStorage에서 refreshToken 발견');
      return localToken.trim();
    }

    // 2. sessionStorage (탭별 세션)
    const sessionToken = sessionStorage.getItem('refreshToken');
    if (sessionToken?.trim()) {
      console.log('🔄 sessionStorage에서 refreshToken 발견');
      return sessionToken.trim();
    }

    // 3. iOS 보강: 쿠키도 마지막 fallback
    if (isIOS()) {
      const cookieRT = Cookies.get('refreshToken');
      if (cookieRT?.trim()) {
        console.log('🔄 쿠키에서 refreshToken 발견 (iOS)');
        return cookieRT.trim();
      }
    }

    try {
      console.log('❌ refreshToken을 찾을 수 없음');
    } catch (logError) {
      console.error('refreshToken 없음 로깅 중 오류:', logError);
    }
    return null;
  } catch (e) {
    console.error('refreshToken 읽기 중 오류:', e);
    return null;
  }
};

/**
 * 🎯 통합된 토큰 갱신 타이머 설정 (중복 방지)
 */
export const setupTokenRefreshTimer = (token: string): void => {
  try {
    console.log('⚡ 통합된 토큰 갱신 타이머 설정 시작');

    // 기존 타이머 정리 (모든 종류)
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
      tokenRefreshTimer = null;
    }

    if (typeof window !== 'undefined' && window.tokenRefreshTimer) {
      clearTimeout(window.tokenRefreshTimer);
      window.tokenRefreshTimer = undefined;
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
      console.log('⚠️ 토큰이 이미 만료됨 - 즉시 갱신 시도');
      refreshToken();
      return;
    }

    // iOS 환경에서는 더 일찍 갱신 (ITP 대응)
    const isIOSEnvironment = isIOS();
    const refreshOffset = isIOSEnvironment ? 15 * 60 : 10 * 60; // iOS: 15분, 웹: 10분
    const refreshTime = Math.max(timeUntilExpiry - refreshOffset, 0);

    console.log(
      `⏰ 토큰 갱신 타이머 설정: ${Math.floor(timeUntilExpiry / 60)}분 후 만료, ${Math.floor(refreshTime / 60)}분 후 갱신 (iOS: ${isIOSEnvironment})`
    );
    console.log('📊 타이머 상세 정보:', {
      currentTime: new Date().toLocaleString(),
      tokenExpiresAt: new Date(expiresAt * 1000).toLocaleString(),
      refreshTime: new Date(Date.now() + refreshTime * 1000).toLocaleString(),
      timeUntilExpiryMinutes: Math.floor(timeUntilExpiry / 60),
      refreshTimeMinutes: Math.floor(refreshTime / 60),
      isIOS: isIOSEnvironment,
    });

    // 새 타이머 설정
    tokenRefreshTimer = window.setTimeout(async () => {
      console.log('🔄 토큰 갱신 타이머 실행 시작');
      console.log('📊 타이머 실행 정보:', {
        scheduledTime: new Date(
          Date.now() + refreshTime * 1000
        ).toLocaleString(),
        actualExecutionTime: new Date().toLocaleString(),
        delay: refreshTime * 1000,
        delayMinutes: Math.floor(refreshTime / 60),
      });

      try {
        const success = await refreshToken();
        if (success) {
          console.log('✅ 토큰 갱신 성공 - 새로운 갱신 타이머 설정');
          const newToken = getCurrentToken();
          if (newToken) {
            try {
              setupTokenRefreshTimer(newToken);
            } catch (timerError) {
              console.error(
                '토큰 갱신 성공 후 타이머 설정 중 오류:',
                timerError
              );
            }
          } else {
            console.log('⚠️ 토큰 갱신 성공했지만 새 토큰을 찾을 수 없음');
          }
        } else {
          console.log('❌ 토큰 갱신 실패');
          // 토큰 갱신 실패 시 지속 로그인 설정 제거
          try {
            clearTokens();
            localStorage.removeItem('autoLogin');
            localStorage.removeItem('persistentLogin');
          } catch (clearError) {
            console.error('토큰 갱신 실패 후 정리 중 오류:', clearError);
          }
        }
      } catch (error) {
        console.error('토큰 갱신 중 오류:', error);
        // 에러 발생 시 지속 로그인 설정 제거
        try {
          clearTokens();
          localStorage.removeItem('autoLogin');
          localStorage.removeItem('persistentLogin');
        } catch (clearError) {
          console.error('토큰 갱신 오류 후 정리 중 오류:', clearError);
        }
      }
    }, refreshTime * 1000);

    // 🔧 개선: 타이머 ID 유효성 검사
    if (!tokenRefreshTimer || tokenRefreshTimer <= 0) {
      console.error('❌ 토큰 갱신 타이머 생성 실패');
      return;
    }

    // 전역 타이머 참조도 저장 (호환성)
    if (typeof window !== 'undefined' && tokenRefreshTimer) {
      try {
        window.tokenRefreshTimer = tokenRefreshTimer;
        window.tokenRefreshTime = new Date(Date.now() + refreshTime * 1000);
        console.log('🌐 전역 타이머 참조 저장 완료:', {
          timerId: tokenRefreshTimer,
          scheduledTime: window.tokenRefreshTime?.toLocaleString(),
        });
      } catch (globalError) {
        console.error('전역 타이머 참조 저장 중 오류:', globalError);
      }
    }

    console.log('✅ 통합된 토큰 갱신 타이머 설정 완료');
    try {
      console.log('📊 최종 타이머 상태:', {
        localTimerId: tokenRefreshTimer,
        globalTimerId:
          typeof window !== 'undefined' ? window.tokenRefreshTimer : undefined,
        scheduledRefreshTime:
          typeof window !== 'undefined'
            ? window.tokenRefreshTime?.toLocaleString()
            : undefined,
        tokenExpiryTime: new Date(expiresAt * 1000).toLocaleString(),
      });
    } catch (logError) {
      console.error('최종 타이머 상태 로깅 중 오류:', logError);
    }
  } catch (error) {
    console.error('토큰 갱신 타이머 설정 중 오류:', error);
  }
};

/**
 * 🎯 개선된 토큰 갱신 (인스타그램 방식) - 네트워크 상태 확인 포함
 */
export const refreshToken = async (retryCount = 0): Promise<boolean> => {
  // 🔧 추가: 중복 갱신 방지(동시성 락)
  if (refreshInFlight) {
    console.log('🔄 토큰 갱신이 이미 진행 중 - 대기');
    return refreshInFlight; // 이미 진행중이면 그 결과 재사용
  }

  console.log('🔄 토큰 갱신 시작 (중복 방지 활성화)');
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
          try {
            console.log('🔄 토큰 갱신 API 호출 시작:', {
              url: '/auth/refresh',
              hasRefreshToken: !!currentRefreshToken,
              refreshTokenLength: currentRefreshToken?.length,
              autoLogin,
              retryCount: currentRetryCount,
            });
          } catch (logError) {
            console.error('토큰 갱신 API 호출 시작 로깅 중 오류:', logError);
          }

          const response = await rawAxios.post('/auth/refresh', {
            refreshToken: currentRefreshToken,
            autoLogin,
          });

          try {
            console.log('✅ 토큰 갱신 API 응답 성공:', {
              status: response.status,
              hasAccessToken: !!response.data?.accessToken,
              hasNewRefreshToken: !!response.data?.refreshToken,
              accessTokenLength: response.data?.accessToken?.length,
              newRefreshTokenLength: response.data?.refreshToken?.length,
            });
          } catch (logError) {
            console.error('토큰 갱신 API 응답 성공 로깅 중 오류:', logError);
          }

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
            console.log('⏰ 기존 토큰 갱신 타이머 정리 완료');
          }

          try {
            console.log('💾 새 토큰 저장 시작:', {
              hasNewRefreshToken: !!newRefreshToken,
              newRefreshTokenLength: newRefreshToken?.length,
              accessTokenLength: accessToken?.length,
              autoLogin,
              retryCount: currentRetryCount,
            });
          } catch (logError) {
            console.error('새 토큰 저장 시작 로깅 중 오류:', logError);
          }

          if (newRefreshToken) {
            // 새 리프레시 토큰이 있는 경우
            saveTokens(accessToken, newRefreshToken, autoLogin);
            try {
              console.log('✅ 새 리프레시 토큰과 함께 토큰 저장 완료');
            } catch (logError) {
              console.error(
                '새 리프레시 토큰과 함께 토큰 저장 완료 로깅 중 오류:',
                logError
              );
            }
          } else {
            // 리프레시 토큰이 없으면 액세스 토큰만 업데이트
            const currentRefreshTokenForSave = getRefreshToken();
            saveTokens(
              accessToken,
              currentRefreshTokenForSave || undefined,
              autoLogin
            );
            try {
              console.log('⚠️ 새 리프레시 토큰 없음 - 기존 것 유지');
            } catch (logError) {
              console.error('새 리프레시 토큰 없음 로깅 중 오류:', logError);
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
              console.log('⏰ 토큰 갱신 성공 후 타이머 재설치 시작');
              // 🔧 개선: 약간의 지연 후 타이머 재설치 (토큰 저장 완료 보장)
              setTimeout(() => {
                try {
                  setupTokenRefreshTimer(latest);
                  console.log('✅ 토큰 갱신 성공 후 타이머 재설치 완료');
                } catch (timerError) {
                  console.error(
                    '토큰 갱신 성공 후 타이머 재설치 중 오류:',
                    timerError
                  );
                }
              }, 100);
            } else {
              console.log('⚠️ 토큰 갱신 성공했지만 최신 토큰을 찾을 수 없음');
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
      // 🔧 개선: 약간의 지연 후 플래그 해제 (동시성 문제 방지)
      setTimeout(() => {
        try {
          refreshInFlight = null;
          console.log('🔄 토큰 갱신 완료 - 플래그 해제');
        } catch (flagError) {
          console.error('토큰 갱신 플래그 해제 중 오류:', flagError);
        }
      }, 100);
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
    const oldAccessToken = localStorage.getItem('accessToken');
    const oldRefreshToken = localStorage.getItem('refreshToken');

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

    // 4. 추가 정리 (안전장치)
    localStorage.removeItem('keepLoginSetting');
    localStorage.removeItem('autoLogin');
    localStorage.removeItem('persistentLogin');
    localStorage.removeItem('loginTimestamp');
    localStorage.removeItem('tokenExpiresAt');

    console.log('✅ 토큰 정리 완료');
    try {
      console.log('📊 정리된 토큰 정보:', {
        hadAccessToken: !!oldAccessToken,
        hadRefreshToken: !!oldRefreshToken,
        accessTokenLength: oldAccessToken?.length || 0,
        refreshTokenLength: oldRefreshToken?.length || 0,
      });
    } catch (logError) {
      console.error('정리된 토큰 정보 로깅 중 오류:', logError);
    }
  } catch (error) {
    console.error('토큰 정리 중 오류:', error);
  }
};

/**
 * 🎯 성능 최적화된 토큰 갱신 타이머 (iOS + 일반 환경) - setupTokenRefreshTimer로 통합
 * @deprecated setupTokenRefreshTimer 사용 권장
 */
export const setupOptimizedTokenRefreshTimer = (accessToken: string): void => {
  console.log(
    '⚠️ setupOptimizedTokenRefreshTimer는 deprecated - setupTokenRefreshTimer 사용 권장'
  );
  setupTokenRefreshTimer(accessToken);
};
