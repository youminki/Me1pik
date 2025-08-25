import Cookies from 'js-cookie';

import { isIOS } from './environmentDetection';
import {
  getCurrentToken,
  hasValidToken,
  setupTokenRefreshTimer,
} from './tokenManager';

/**
 * 🎯 지속 로그인 설정 정리 헬퍼 함수
 */
export const clearPersistentLoginSettings = (): void => {
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

/**
 * 🎯 iOS 환경에 최적화된 토큰 저장 함수
 */
export const saveTokenForIOS = (
  token: string,
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

      Cookies.set('accessToken', token, cookieOptions);
      if (refreshToken) {
        Cookies.set('refreshToken', refreshToken, cookieOptions);
      }

      // 2. sessionStorage (iOS에서 더 안정적)
      sessionStorage.setItem('accessToken', token);
      if (refreshToken) {
        sessionStorage.setItem('refreshToken', refreshToken);
      }

      // 3. localStorage (백업)
      if (keepLogin) {
        localStorage.setItem('accessToken', token);
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
        localStorage.setItem('accessToken', token);
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
        sessionStorage.setItem('accessToken', token);
        if (refreshToken) {
          sessionStorage.setItem('refreshToken', refreshToken);
        }
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('keepLoginSetting', 'false');
        console.log('📱 웹: sessionStorage에 토큰 저장 완료 (세션 로그인)');
      }

      // 3. 쿠키에도 저장 (보안 강화)
      const cookieOptions = {
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'strict' as const,
        expires: keepLogin ? 30 : 1,
      };
      Cookies.set('accessToken', token, cookieOptions);
      if (refreshToken) {
        Cookies.set('refreshToken', refreshToken, cookieOptions);
      }
      console.log('🍪 웹: 쿠키에 토큰 저장 완료');
    }

    console.log('✅ 토큰 저장 완료');
  } catch (error) {
    console.error('iOS 토큰 저장 중 오류:', error);
  }
};

/**
 * 🎯 지속 로그인을 위한 토큰 저장
 */
export const saveTokensForPersistentLogin = (
  accessToken: string,
  refreshToken?: string,
  keepLogin: boolean = true
): void => {
  try {
    console.log('🔐 지속 로그인을 위한 토큰 저장 시작');

    // 1. 토큰 저장
    saveTokenForIOS(accessToken, refreshToken, keepLogin);

    // 2. 자동 로그인 설정 활성화
    if (keepLogin) {
      localStorage.setItem('autoLogin', 'true');
      localStorage.setItem('persistentLogin', 'true');
      console.log('✅ 지속 로그인 설정 활성화 완료');
    }

    // 3. 토큰 갱신 타이머 설정
    if (!keepLogin) {
      setupTokenRefreshTimer(accessToken);
    }
  } catch (error) {
    console.error('지속 로그인 토큰 저장 중 오류:', error);
  }
};

/**
 * 🎯 지속 로그인 복원
 */
export const restorePersistentLogin = async (): Promise<boolean> => {
  try {
    console.log('🔄 지속 로그인 복원 시작');

    // 1. 지속 로그인 설정 확인
    const persistentLogin = localStorage.getItem('persistentLogin');
    const autoLogin = localStorage.getItem('autoLogin');
    const hasPersistentSetting =
      persistentLogin === 'true' || autoLogin === 'true';

    if (!hasPersistentSetting) {
      console.log('ℹ️ 지속 로그인 설정이 없음');
      return false;
    }

    // 2. 저장된 토큰 확인
    const accessToken = getCurrentToken();
    const refreshToken =
      localStorage.getItem('refreshToken') ||
      sessionStorage.getItem('refreshToken') ||
      Cookies.get('refreshToken');

    if (!accessToken && !refreshToken) {
      console.log('❌ 저장된 토큰이 없음');
      clearPersistentLoginSettings();
      return false;
    }

    // 3. accessToken이 있고 유효한 경우
    if (accessToken && hasValidToken()) {
      console.log('✅ 저장된 토큰이 유효함 - 자동 로그인 성공');

      // 토큰 갱신 타이머 설정
      setupTokenRefreshTimer(accessToken);

      return true;
    }

    // 4. accessToken이 만료되었지만 refreshToken이 있는 경우 갱신 시도
    if (refreshToken) {
      console.log('🔄 accessToken 만료, refreshToken으로 갱신 시도');

      // iOS 환경에서는 더 적극적인 재시도
      let retryCount = 0;
      const maxRetries = isIOS() ? 3 : 2;

      while (retryCount < maxRetries) {
        try {
          console.log(`🔄 토큰 갱신 시도 ${retryCount + 1}/${maxRetries}`);

          const { refreshToken: refreshTokenFn } = await import(
            './tokenManager'
          );
          const success = await refreshTokenFn(retryCount);
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
            const delay = isIOS() ? retryCount * 2 : retryCount; // iOS에서는 더 긴 지연
            console.log(`⏳ ${delay}초 후 재시도...`);
            await new Promise((resolve) => setTimeout(resolve, delay * 1000));
          }
        } catch (error) {
          console.error(`토큰 갱신 시도 ${retryCount + 1} 실패:`, error);
          retryCount++;

          if (retryCount < maxRetries) {
            const delay = isIOS() ? retryCount * 2 : retryCount;
            console.log(`⏳ ${delay}초 후 재시도...`);
            await new Promise((resolve) => setTimeout(resolve, delay * 1000));
          }
        }
      }

      // 🎯 모든 재시도 실패 시
      console.log('❌ 모든 토큰 갱신 시도 실패');

      // iOS 앱 환경에서는 네이티브 이벤트만 발생
      if (
        isIOS() &&
        (window as { webkit?: { messageHandlers?: unknown } }).webkit
          ?.messageHandlers
      ) {
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
 * 🎯 자동 로그인 설정 확인 및 타이머 설정
 */
export const checkAndSetupAutoLogin = async (): Promise<void> => {
  try {
    console.log('🔍 자동 로그인 설정 확인 시작');

    // 1. 자동 로그인 설정 확인
    const autoLogin = localStorage.getItem('autoLogin') === 'true';
    const persistentLogin = localStorage.getItem('persistentLogin') === 'true';

    if (!autoLogin && !persistentLogin) {
      console.log('ℹ️ 자동 로그인 설정이 없음');
      return;
    }

    // 2. 현재 토큰 상태 확인
    const currentToken = getCurrentToken();
    if (!currentToken) {
      console.log('❌ 현재 토큰이 없음');
      return;
    }

    // 3. 토큰 만료 시간 확인
    const tokenExpiry = localStorage.getItem('tokenExpiresAt');
    if (tokenExpiry) {
      const expiryTime = new Date(tokenExpiry);
      const now = new Date();
      const timeUntilExpiry = expiryTime.getTime() - now.getTime();

      if (timeUntilExpiry > 0) {
        // 🎯 토큰이 아직 유효한 경우 자동 갱신 타이머 설정
        const refreshOffset = isIOS() ? 15 * 60 : 10 * 60; // iOS: 15분, 일반: 10분
        const refreshTime = Math.max(timeUntilExpiry - refreshOffset * 1000, 0);

        console.log(
          `⏰ 토큰 만료 ${Math.floor(timeUntilExpiry / 1000 / 60)}분 전에 자동 갱신 예정 (iOS: ${isIOS()})`
        );

        if (refreshTime > 0) {
          // 자동 갱신 타이머 설정
          setTimeout(async () => {
            console.log('🔄 자동 토큰 갱신 실행');
            try {
              const { refreshToken } = await import('./tokenManager');
              const success = await refreshToken();
              if (!success) {
                console.log('❌ 자동 토큰 갱신 실패 - 지속 로그인 설정 제거');
                clearPersistentLoginSettings();
              }
            } catch (error) {
              console.error('자동 토큰 갱신 실패:', error);
              clearPersistentLoginSettings();
            }
          }, refreshTime);
        } else {
          console.log('⚠️ 토큰이 이미 만료됨 - 즉시 갱신 시도');
          const { refreshToken } = await import('./tokenManager');
          await refreshToken();
        }
      } else {
        console.log('⚠️ 토큰이 이미 만료됨 - 지속 로그인 설정 제거');
        clearPersistentLoginSettings();
      }
    } else {
      console.log('⚠️ 토큰에 만료 시간 정보가 없음 - 지속 로그인 설정 제거');
      clearPersistentLoginSettings();
    }
  } catch (error) {
    console.error('자동 로그인 설정 확인 중 오류:', error);
    clearPersistentLoginSettings();
  }
};
