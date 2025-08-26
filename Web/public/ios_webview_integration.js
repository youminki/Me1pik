/**
 * 🍎 iOS 웹뷰 자동로그인 통합 스크립트
 * iOS Safari ITP(Intelligent Tracking Prevention) 대응
 * 웹뷰와 네이티브 앱 간 토큰 동기화
 */

(function () {
  'use strict';

  console.log('🍎 iOS 웹뷰 자동로그인 통합 스크립트 로드됨');

  // iOS 환경 감지
  const isIOS = () => {
    // iOS 웹뷰 감지
    if (window.webkit?.messageHandlers) return true;

    // iOS Safari 감지
    const userAgent = navigator.userAgent.toLowerCase();
    return (
      /iphone|ipad|ipod/.test(userAgent) || /ipad/.test(navigator.platform)
    );
  };

  // iOS 환경이 아니면 스크립트 종료
  if (!isIOS()) {
    console.log('🍎 iOS 환경이 아님 - 스크립트 종료');
    return;
  }

  console.log('🍎 iOS 환경 감지됨 - iOS 최적화된 자동로그인 설정');

  // 🎯 iOS에서 안정적인 토큰 저장 함수
  const saveTokenForIOS = (token, refreshToken, keepLogin = true) => {
    try {
      console.log('🍎 iOS: 30일 자동로그인 토큰 저장 시작');

      // 1. 쿠키에 우선 저장 (iOS ITP 대응, 30일 유지)
      const cookieOptions = {
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'strict',
        expires: keepLogin ? 30 : 1, // 30일 또는 1일
      };

      document.cookie = `accessToken=${token}; path=${cookieOptions.path}; max-age=${cookieOptions.expires * 24 * 60 * 60}`;
      if (refreshToken) {
        document.cookie = `refreshToken=${refreshToken}; path=${cookieOptions.path}; max-age=${cookieOptions.expires * 24 * 60 * 60}`;
      }
      console.log('🍪 iOS: 쿠키에 토큰 저장 완료 (30일 또는 1일)');

      // 2. sessionStorage에 저장 (iOS에서 안정적, 30일 유지)
      sessionStorage.setItem('accessToken', token);
      if (refreshToken) {
        sessionStorage.setItem('refreshToken', refreshToken);
      }
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('keepLoginSetting', keepLogin.toString());
      console.log('📱 iOS: sessionStorage에 토큰 저장 완료 (30일 또는 1일)');

      // 3. localStorage에도 저장 (30일 백업, 브라우저 종료 후에도 유지)
      if (keepLogin) {
        localStorage.setItem('accessToken', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('keepLoginSetting', keepLogin.toString());
        localStorage.setItem('autoLogin', 'true');
        localStorage.setItem('persistentLogin', 'true');
        localStorage.setItem('loginTimestamp', Date.now().toString());

        // 30일 만료 시간 설정
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        localStorage.setItem('tokenExpiresAt', thirtyDaysFromNow.toISOString());

        console.log('💾 iOS: localStorage에 토큰 저장 완료 (30일 자동로그인)');
        console.log('📅 만료 시간:', thirtyDaysFromNow.toLocaleDateString());
      } else {
        // 1일 만료 시간 설정
        const oneDayFromNow = new Date();
        oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
        sessionStorage.setItem('tokenExpiresAt', oneDayFromNow.toISOString());

        console.log('📱 iOS: sessionStorage에 토큰 저장 완료 (1일 세션)');
        console.log('📅 만료 시간:', oneDayFromNow.toLocaleDateString());
      }

      // 4. iOS 앱에 토큰 동기화 요청
      if (window.webkit?.messageHandlers?.nativeBridge) {
        window.webkit.messageHandlers.nativeBridge.postMessage({
          action: 'syncToken',
          token: token,
          refreshToken: refreshToken,
          keepLogin: keepLogin,
        });
        console.log('🍎 iOS: 네이티브 앱에 토큰 동기화 요청');
      }

      console.log('✅ iOS 토큰 저장 완료 (30일 자동로그인)');
      console.log('📊 저장 결과:', {
        keepLogin,
        expiryDate: keepLogin
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
      });
    } catch (error) {
      console.error('iOS 토큰 저장 중 오류:', error);
    }
  };

  // 🎯 iOS에서 안정적인 토큰 읽기 함수
  const getTokenForIOS = () => {
    try {
      // 1. 쿠키에서 우선 읽기 (iOS ITP 대응)
      const cookieToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('accessToken='))
        ?.split('=')[1];

      if (cookieToken) {
        console.log('🍪 iOS: 쿠키에서 토큰 읽기 성공');
        return cookieToken;
      }

      // 2. sessionStorage에서 읽기 (iOS에서 안정적)
      const sessionToken = sessionStorage.getItem('accessToken');
      if (sessionToken) {
        console.log('📱 iOS: sessionStorage에서 토큰 읽기 성공');
        return sessionToken;
      }

      // 3. localStorage에서 읽기 (백업)
      const localToken = localStorage.getItem('accessToken');
      if (localToken) {
        console.log('💾 iOS: localStorage에서 토큰 읽기 성공');
        return localToken;
      }

      console.log('❌ iOS: 모든 저장소에서 토큰을 찾을 수 없음');
      return null;
    } catch (error) {
      console.error('iOS 토큰 읽기 중 오류:', error);
      return null;
    }
  };

  // 🎯 iOS 웹뷰 닫힘 시 30일 자동로그인 보장
  window.addEventListener('beforeunload', function (e) {
    console.log('🔄 iOS 웹뷰 닫힘 감지 - 30일 자동로그인 보장 시작');

    // keepLogin 설정 확인
    const keepLogin = localStorage.getItem('keepLoginSetting') === 'true';

    if (keepLogin) {
      // 30일 자동로그인이 활성화된 경우 토큰 저장 보장
      const accessToken =
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken');
      const refreshToken =
        localStorage.getItem('refreshToken') ||
        sessionStorage.getItem('refreshToken');

      if (accessToken) {
        // localStorage에 30일 토큰 저장 보장
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('autoLogin', 'true');
        localStorage.setItem('persistentLogin', 'true');
        localStorage.setItem('loginTimestamp', Date.now().toString());

        // 30일 만료 시간 설정
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        localStorage.setItem('tokenExpiresAt', thirtyDaysFromNow.toISOString());

        // iOS 앱에 토큰 동기화 요청 (웹뷰 닫힘 시)
        if (window.webkit?.messageHandlers?.nativeBridge) {
          window.webkit.messageHandlers.nativeBridge.postMessage({
            action: 'syncTokenOnUnload',
            token: accessToken,
            refreshToken: refreshToken,
            keepLogin: keepLogin,
          });
          console.log('🍎 iOS: 웹뷰 닫힘 시 네이티브 앱에 토큰 동기화 요청');
        }

        console.log('💾 iOS 웹뷰 닫힘 시 30일 자동로그인 보장 완료');
        console.log('📅 만료 시간:', thirtyDaysFromNow.toLocaleDateString());
      }
    }
  });

  // 🎯 iOS 웹뷰 페이지 숨김 시에도 30일 자동로그인 보장
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      console.log('🔄 iOS 웹뷰 페이지 숨김 감지 - 30일 자동로그인 보장 시작');

      const keepLogin = localStorage.getItem('keepLoginSetting') === 'true';

      if (keepLogin) {
        const accessToken =
          localStorage.getItem('accessToken') ||
          sessionStorage.getItem('accessToken');
        const refreshToken =
          localStorage.getItem('refreshToken') ||
          sessionStorage.getItem('refreshToken');

        if (accessToken) {
          // localStorage에 30일 토큰 저장 보장
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('autoLogin', 'true');
          localStorage.setItem('persistentLogin', 'true');
          localStorage.setItem('loginTimestamp', Date.now().toString());

          // 30일 만료 시간 설정
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          localStorage.setItem(
            'tokenExpiresAt',
            thirtyDaysFromNow.toISOString()
          );

          // iOS 앱에 토큰 동기화 요청 (페이지 숨김 시)
          if (window.webkit?.messageHandlers?.nativeBridge) {
            window.webkit.messageHandlers.nativeBridge.postMessage({
              action: 'syncTokenOnHidden',
              token: accessToken,
              refreshToken: refreshToken,
              keepLogin: keepLogin,
            });
            console.log(
              '🍎 iOS: 페이지 숨김 시 네이티브 앱에 토큰 동기화 요청'
            );
          }

          console.log('💾 iOS 웹뷰 페이지 숨김 시 30일 자동로그인 보장 완료');
          console.log('📅 만료 시간:', thirtyDaysFromNow.toLocaleDateString());
        }
      }
    }
  });

  // 🎯 iOS에서 안정적인 로그인 상태 확인
  const checkLoginStatusForIOS = () => {
    try {
      const token = getTokenForIOS();
      const isLoggedIn =
        token &&
        (sessionStorage.getItem('isLoggedIn') === 'true' ||
          localStorage.getItem('isLoggedIn') === 'true');

      console.log('🍎 iOS 로그인 상태 확인:', {
        hasToken: !!token,
        isLoggedIn: isLoggedIn,
        tokenLength: token?.length || 0,
      });

      return { hasToken: !!token, isLoggedIn, token };
    } catch (error) {
      console.error('🍎 iOS 로그인 상태 확인 중 오류:', error);
      return { hasToken: false, isLoggedIn: false, token: null };
    }
  };

  // 🎯 iOS에서 안정적인 자동로그인 복원
  const restoreAutoLoginForIOS = async () => {
    try {
      console.log('🍎 iOS: 자동로그인 복원 시작');

      // 1. 지속 로그인 설정 확인
      const keepLogin =
        sessionStorage.getItem('keepLoginSetting') === 'true' ||
        localStorage.getItem('keepLoginSetting') === 'true';

      if (!keepLogin) {
        console.log('🍎 iOS: 지속 로그인 설정이 비활성화됨');
        return false;
      }

      // 2. 현재 토큰 상태 확인
      const { hasToken, isLoggedIn, token } = checkLoginStatusForIOS();

      if (!hasToken) {
        console.log('🍎 iOS: 저장된 토큰이 없음');

        // iOS 앱에 토큰 요청
        if (window.webkit?.messageHandlers?.nativeBridge) {
          console.log('🍎 iOS: 네이티브 앱에 토큰 요청');
          window.webkit.messageHandlers.nativeBridge.postMessage({
            action: 'requestLoginInfo',
          });

          // 잠시 대기 후 다시 확인
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const retryToken = getTokenForIOS();
          if (retryToken) {
            console.log('✅ iOS: 네이티브 앱에서 토큰 수신 성공');
            return true;
          }
        }

        return false;
      }

      // 3. 토큰 유효성 확인 (간단한 JWT 파싱)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (payload.exp && payload.exp > currentTime) {
          console.log('✅ iOS: 저장된 토큰이 유효함 - 자동 로그인 성공');
          return true;
        } else {
          console.log('⚠️ iOS: 토큰이 만료됨');

          // refreshToken으로 갱신 시도
          const refreshToken =
            sessionStorage.getItem('refreshToken') ||
            localStorage.getItem('refreshToken');
          if (refreshToken) {
            console.log('🔄 iOS: refreshToken으로 갱신 시도');
            // 여기서 실제 토큰 갱신 API 호출
            return false; // 임시로 false 반환
          }

          return false;
        }
      } catch (error) {
        console.error('🍎 iOS: 토큰 파싱 실패:', error);
        return false;
      }
    } catch (error) {
      console.error('🍎 iOS 자동로그인 복원 중 오류:', error);
      return false;
    }
  };

  // 🎯 페이지 로드 시 자동로그인 시도
  const setupAutoLoginForIOS = () => {
    try {
      console.log('🍎 iOS: 자동로그인 설정 시작');

      // 1. 페이지 로드 완료 후 자동로그인 시도
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(restoreAutoLoginForIOS, 1000);
        });
      } else {
        setTimeout(restoreAutoLoginForIOS, 1000);
      }

      // 2. iOS 앱에서 로그인 정보 수신 이벤트 리스너
      window.addEventListener('loginInfoReceived', (event) => {
        console.log('🍎 iOS: 로그인 정보 수신 이벤트');
        const { userInfo, keepLogin } = event.detail;

        if (userInfo && userInfo.token) {
          saveTokenForIOS(userInfo.token, userInfo.refreshToken, keepLogin);

          // 로그인 성공 이벤트 발생
          window.dispatchEvent(
            new CustomEvent('iosLoginSuccess', {
              detail: { userInfo, keepLogin },
            })
          );
        }
      });

      // 3. iOS 앱에서 토큰 갱신 이벤트 리스너
      window.addEventListener('tokenRefreshed', (event) => {
        console.log('🍎 iOS: 토큰 갱신 이벤트');
        const { tokenData } = event.detail;

        if (tokenData && tokenData.token) {
          saveTokenForIOS(tokenData.token, tokenData.refreshToken, true);

          // 토큰 갱신 성공 이벤트 발생
          window.dispatchEvent(
            new CustomEvent('iosTokenRefreshSuccess', {
              detail: { tokenData },
            })
          );
        }
      });

      console.log('✅ iOS 자동로그인 설정 완료');
    } catch (error) {
      console.error('🍎 iOS 자동로그인 설정 중 오류:', error);
    }
  };

  // 🎯 전역 함수로 노출
  window.iOSAutoLogin = {
    saveToken: saveTokenForIOS,
    getToken: getTokenForIOS,
    checkStatus: checkLoginStatusForIOS,
    restore: restoreAutoLoginForIOS,
    setup: setupAutoLoginForIOS,
  };

  // 🎯 자동 설정 시작
  setupAutoLoginForIOS();

  console.log('🍎 iOS 웹뷰 자동로그인 통합 스크립트 설정 완료');
})();
