/**
 * 인스타그램 방식 앱-웹뷰 통신 스크립트
 * 웹뷰에서 앱과의 완전 연동된 로그인 경험을 제공합니다.
 */

// 전역 변수
let isNativeApp = false;
let loginHandler = null;
let logoutHandler = null;

/**
 * 네이티브 앱 환경 감지
 */
function detectNativeApp() {
  isNativeApp = !!(
    window.webkit?.messageHandlers ||
    window.nativeApp ||
    window.ReactNativeWebView
  );

  if (isNativeApp) {
    console.log('네이티브 앱 환경 감지됨');
    setupNativeHandlers();
  }
}

/**
 * 네이티브 핸들러 설정
 */
function setupNativeHandlers() {
  if (window.webkit?.messageHandlers) {
    loginHandler = window.webkit.messageHandlers.loginHandler;
    logoutHandler = window.webkit.messageHandlers.logoutHandler;
  }
}

/**
 * 앱에 로그인 정보 전달
 */
function notifyAppLogin(loginInfo) {
  if (!isNativeApp || !loginHandler) {
    console.log('네이티브 앱 환경이 아니거나 로그인 핸들러가 없습니다.');
    return;
  }

  try {
    loginHandler.postMessage({
      type: 'login',
      token: loginInfo.token,
      refreshToken: loginInfo.refreshToken,
      email: loginInfo.email,
      userId: loginInfo.userId,
      name: loginInfo.name,
    });
    console.log('앱에 로그인 정보 전달 완료');
  } catch (error) {
    console.error('앱에 로그인 정보 전달 실패:', error);
  }
}

/**
 * 앱에 로그아웃 정보 전달
 */
function notifyAppLogout() {
  if (!isNativeApp || !logoutHandler) {
    console.log('네이티브 앱 환경이 아니거나 로그아웃 핸들러가 없습니다.');
    return;
  }

  try {
    logoutHandler.postMessage({
      type: 'logout',
    });
    console.log('앱에 로그아웃 정보 전달 완료');
  } catch (error) {
    console.error('앱에 로그아웃 정보 전달 실패:', error);
  }
}

/**
 * 앱에서 받은 로그인 정보 처리
 */
function handleAppLogin(loginInfo) {
  console.log('앱에서 로그인 정보 수신:', loginInfo);

  // keepLogin 설정 확인 (기본값: true)
  const keepLogin =
    loginInfo.keepLogin !== undefined ? loginInfo.keepLogin : true;

  // 🎯 auth.ts의 통합된 토큰 저장 함수 사용 (30일 자동로그인)
  if (loginInfo.token) {
    if (keepLogin) {
      // localStorage에 저장 (30일 영구 보관)
      localStorage.setItem('accessToken', loginInfo.token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('autoLogin', 'true');
      localStorage.setItem('persistentLogin', 'true');
      localStorage.setItem('loginTimestamp', Date.now().toString());

      // 30일 만료 시간 설정
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      localStorage.setItem('tokenExpiresAt', thirtyDaysFromNow.toISOString());

      console.log('💾 앱: 30일 자동 로그인 설정 완료');
      console.log('📅 만료 시간:', thirtyDaysFromNow.toLocaleDateString());
    } else {
      // sessionStorage에 저장 (1일 세션)
      sessionStorage.setItem('accessToken', loginInfo.token);
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('keepLoginSetting', 'false');

      // 1일 만료 시간 설정
      const oneDayFromNow = new Date();
      oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
      sessionStorage.setItem('tokenExpiresAt', oneDayFromNow.toISOString());

      console.log('📱 앱: 1일 세션 로그인 설정 완료');
      console.log('📅 만료 시간:', oneDayFromNow.toLocaleDateString());
    }

    // sessionStorage에도 저장 (세션 유지)
    sessionStorage.setItem('accessToken', loginInfo.token);
    sessionStorage.setItem('isLoggedIn', 'true');

    // 쿠키에도 저장 (30일 또는 1일)
    const maxAge = keepLogin ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    const isHttps = window.location.protocol === 'https:';
    document.cookie = `accessToken=${loginInfo.token}; path=/; max-age=${maxAge}; ${isHttps ? 'secure;' : ''} samesite=strict`;
  }

  if (loginInfo.refreshToken) {
    if (keepLogin) {
      // localStorage에 저장 (30일 영구 보관)
      localStorage.setItem('refreshToken', loginInfo.refreshToken);
    } else {
      // sessionStorage에 저장 (1일 세션)
      sessionStorage.setItem('refreshToken', loginInfo.refreshToken);
    }

    // sessionStorage에도 저장 (세션 유지)
    sessionStorage.setItem('refreshToken', loginInfo.refreshToken);

    // 쿠키에도 저장 (30일 또는 1일)
    const maxAge = keepLogin ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    const isHttps = window.location.protocol === 'https:';
    document.cookie = `refreshToken=${loginInfo.refreshToken}; path=/; max-age=${maxAge}; ${isHttps ? 'secure;' : ''} samesite=strict`;
  }

  // 🎯 토큰 갱신 타이머 설정
  if (loginInfo.token && typeof window.setupTokenRefreshTimer === 'function') {
    try {
      window.setupTokenRefreshTimer(loginInfo.token);
      console.log('토큰 갱신 타이머 설정 완료');
    } catch (error) {
      console.error('토큰 갱신 타이머 설정 실패:', error);
    }
  }

  // 🎯 앱-웹뷰 동기화
  if (typeof window.syncTokenWithApp === 'function') {
    try {
      window.syncTokenWithApp(loginInfo.token, loginInfo.refreshToken);
      console.log('앱-웹뷰 토큰 동기화 완료');
    } catch (error) {
      console.error('앱-웹뷰 토큰 동기화 실패:', error);
    }
  }

  console.log(
    '✅ 앱에서 받은 로그인 정보 처리 완료 (30일 자동로그인 또는 1일 세션)'
  );
  console.log('📊 저장 결과:', {
    hasToken: !!loginInfo.token,
    hasRefreshToken: !!loginInfo.refreshToken,
    keepLogin,
    expiryDate: keepLogin
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
  });
}

/**
 * 앱에서 받은 로그아웃 정보 처리
 */
function handleAppLogout() {
  console.log('앱에서 로그아웃 요청 수신');

  // 모든 토큰 제거
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');

  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');

  // 쿠키 제거
  document.cookie =
    'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie =
    'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // 로그아웃 이벤트 발생
  window.dispatchEvent(new CustomEvent('appLogout'));

  console.log('앱 로그아웃 처리 완료');
}

/**
 * 웹에서 로그인 성공 시 호출 (앱에 알림)
 */
function handleWebLoginSuccess(loginInfo) {
  console.log('웹 로그인 성공:', loginInfo);

  // keepLogin 설정 확인 (기본값: true)
  const keepLogin =
    loginInfo.keepLogin !== undefined ? loginInfo.keepLogin : true;

  // 다중 저장소에 토큰 저장 (30일 자동로그인)
  if (loginInfo.token) {
    if (keepLogin) {
      // localStorage에 저장 (30일 영구 보관)
      localStorage.setItem('accessToken', loginInfo.token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('autoLogin', 'true');
      localStorage.setItem('persistentLogin', 'true');
      localStorage.setItem('loginTimestamp', Date.now().toString());

      // 30일 만료 시간 설정
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      localStorage.setItem('tokenExpiresAt', thirtyDaysFromNow.toISOString());

      console.log('💾 웹: 30일 자동 로그인 설정 완료');
      console.log('📅 만료 시간:', thirtyDaysFromNow.toLocaleDateString());
    } else {
      // sessionStorage에 저장 (1일 세션)
      sessionStorage.setItem('accessToken', loginInfo.token);
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('keepLoginSetting', 'false');

      // 1일 만료 시간 설정
      const oneDayFromNow = new Date();
      oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
      sessionStorage.setItem('tokenExpiresAt', oneDayFromNow.toISOString());

      console.log('📱 웹: 1일 세션 로그인 설정 완료');
      console.log('📅 만료 시간:', oneDayFromNow.toLocaleDateString());
    }

    // sessionStorage에도 저장 (세션 유지)
    sessionStorage.setItem('accessToken', loginInfo.token);
    sessionStorage.setItem('isLoggedIn', 'true');

    // 쿠키에도 저장 (30일 또는 1일)
    const maxAge = keepLogin ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    document.cookie = `accessToken=${loginInfo.token}; path=/; max-age=${maxAge}; secure; samesite=strict`;
  }

  if (loginInfo.refreshToken) {
    if (keepLogin) {
      // localStorage에 저장 (30일 영구 보관)
      localStorage.setItem('refreshToken', loginInfo.refreshToken);
    } else {
      // sessionStorage에 저장 (1일 세션)
      sessionStorage.setItem('refreshToken', loginInfo.refreshToken);
    }

    // sessionStorage에도 저장 (세션 유지)
    sessionStorage.setItem('refreshToken', loginInfo.refreshToken);

    // 쿠키에도 저장 (30일 또는 1일)
    const maxAge = keepLogin ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    document.cookie = `refreshToken=${loginInfo.refreshToken}; path=/; max-age=${maxAge}; secure; samesite=strict`;
  }

  if (loginInfo.email) {
    localStorage.setItem('userEmail', loginInfo.email);
  }

  if (loginInfo.userId) {
    localStorage.setItem('userId', loginInfo.userId);
  }

  if (loginInfo.name) {
    localStorage.setItem('userName', loginInfo.name);
  }

  // 앱에 로그인 정보 전달
  notifyAppLogin(loginInfo);

  // 웹 로그인 성공 이벤트 발생
  window.dispatchEvent(
    new CustomEvent('webLoginSuccess', {
      detail: loginInfo,
    })
  );

  console.log('웹 로그인 처리 완료 (30일 자동로그인 또는 1일 세션)');
  console.log('📊 저장 결과:', {
    hasToken: !!loginInfo.token,
    hasRefreshToken: !!loginInfo.refreshToken,
    keepLogin,
    expiryDate: keepLogin
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
  });
}

/**
 * 웹에서 로그아웃 시 호출 (앱에 알림)
 */
function handleWebLogout() {
  console.log('웹 로그아웃 요청');

  // 모든 토큰 제거
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');

  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');

  // 쿠키 제거
  document.cookie =
    'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie =
    'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // 앱에 로그아웃 정보 전달
  notifyAppLogout();

  // 웹 로그아웃 이벤트 발생
  window.dispatchEvent(new CustomEvent('webLogout'));

  console.log('웹 로그아웃 처리 완료');
}

/**
 * 토큰 갱신 처리
 */
async function refreshToken() {
  try {
    const refreshToken =
      localStorage.getItem('refreshToken') ||
      sessionStorage.getItem('refreshToken') ||
      getCookie('refreshToken');

    if (!refreshToken) {
      console.log('리프레시 토큰이 없습니다.');
      return false;
    }

    // 토큰 갱신 API 호출
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('토큰 갱신 실패');
    }

    const data = await response.json();

    // 새 토큰 저장 (30일 자동로그인)
    const keepLogin = localStorage.getItem('keepLoginSetting') === 'true';
    handleWebLoginSuccess({
      token: data.accessToken,
      refreshToken: data.refreshToken,
      keepLogin: keepLogin,
    });

    console.log('토큰 갱신 성공 (30일 자동로그인)');
    console.log('📊 갱신 결과:', {
      keepLogin,
      expiryDate: keepLogin
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
    });
    return true;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    handleWebLogout();
    return false;
  }
}

/**
 * 쿠키에서 값 가져오기
 */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

/**
 * 토큰 유효성 검사
 */
function isTokenValid(token) {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;

    return payload.exp && payload.exp > currentTime;
  } catch (error) {
    console.error('토큰 파싱 오류:', error);
    return false;
  }
}

/**
 * 인스타그램 방식: 로그인 상태 유지 토큰 저장
 */
function saveTokensWithKeepLogin(accessToken, refreshToken, keepLogin) {
  console.log('=== saveTokensWithKeepLogin called ===');
  console.log('keepLogin:', keepLogin);

  if (keepLogin) {
    // 로그인 상태 유지: localStorage에 저장 (30일 영구 보관)
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

    console.log('localStorage에 토큰 저장됨 (30일 로그인 상태 유지)');
    console.log('📅 만료 시간:', thirtyDaysFromNow.toLocaleDateString());
  } else {
    // 세션 유지: sessionStorage에 저장 (1일)
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

    console.log('sessionStorage에 토큰 저장됨 (1일 세션 유지)');
    console.log('📅 만료 시간:', oneDayFromNow.toLocaleDateString());
  }

  // 쿠키에도 저장 (웹뷰 호환성, 30일 또는 1일)
  const maxAge = keepLogin ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  document.cookie =
    'accessToken=' +
    accessToken +
    '; path=/; max-age=' +
    maxAge +
    '; secure; samesite=strict';
  if (refreshToken) {
    document.cookie =
      'refreshToken=' +
      refreshToken +
      '; path=/; max-age=' +
      maxAge +
      '; secure; samesite=strict';
  }

  console.log('인스타그램 방식 토큰 저장 완료');
  console.log('📊 저장 결과:');
  console.log('  - keepLogin:', keepLogin);
  console.log(
    '  - 만료 시간:',
    keepLogin
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()
  );
  console.log('  - 30일 자동로그인:', keepLogin ? '✅' : '❌');
}

/**
 * 인스타그램 방식: 로그인 상태 유지 확인
 */
function checkInstagramLoginStatus() {
  console.log('=== checkInstagramLoginStatus called ===');

  // localStorage에서 토큰 확인
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');

  console.log('localStorage 상태:');
  console.log('- isLoggedIn:', isLoggedIn);
  console.log('- accessToken:', accessToken ? '✅ 존재' : '❌ 없음');
  console.log('- refreshToken:', refreshToken ? '✅ 존재' : '❌ 없음');
  console.log(
    '- tokenExpiresAt:',
    tokenExpiresAt ? new Date(tokenExpiresAt).toLocaleDateString() : '❌ 없음'
  );

  // 로그인 상태가 아니거나 토큰이 없는 경우
  if (!isLoggedIn || !(accessToken || refreshToken)) {
    console.log('ℹ️ 로그인 상태가 아니거나 토큰이 없음');
    return false;
  }

  // accessToken이 없어도 refreshToken이 있으면 갱신 시도
  if (refreshToken && !accessToken) {
    console.log('✅ refreshToken이 존재함 - 토큰 갱신 시도');
    // 🔧 개선: autoLogin 플래그를 true로 설정하여 웹과 일치
    refreshToken();
    return true;
  }

  if (!accessToken) {
    console.log('❌ accessToken이 없거나 비어있음');
    return false;
  }

  // 토큰 유효성 검사
  if (isTokenValid(accessToken)) {
    console.log('✅ accessToken이 유효함');
    return true;
  } else {
    console.log('⚠️ accessToken이 만료됨 - refreshToken으로 갱신 시도');
    if (refreshToken) {
      refreshToken();
      return true;
    } else {
      console.log('❌ refreshToken도 없음 - 로그인 필요');
      return false;
    }
  }
}

/**
 * 로그인 상태 유지 설정 저장
 */
function saveKeepLoginSetting(keepLogin) {
  console.log('=== saveKeepLoginSetting called ===');
  console.log('keepLogin:', keepLogin);

  if (keepLogin) {
    // 30일 자동로그인 설정
    localStorage.setItem('keepLoginSetting', 'true');
    localStorage.setItem('autoLogin', 'true');
    localStorage.setItem('persistentLogin', 'true');

    // 30일 만료 시간 설정
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    localStorage.setItem('tokenExpiresAt', thirtyDaysFromNow.toISOString());

    console.log('✅ 30일 자동로그인 설정 완료');
    console.log('📅 만료 시간:', thirtyDaysFromNow.toLocaleDateString());
  } else {
    // 1일 세션 로그인 설정
    sessionStorage.setItem('keepLoginSetting', 'false');
    sessionStorage.setItem('autoLogin', 'false');
    sessionStorage.setItem('persistentLogin', 'false');

    // 1일 만료 시간 설정
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    sessionStorage.setItem('tokenExpiresAt', oneDayFromNow.toISOString());

    console.log('✅ 1일 세션 로그인 설정 완료');
    console.log('📅 만료 시간:', oneDayFromNow.toLocaleDateString());
  }
}

/**
 * 현재 토큰 가져오기
 */
function getCurrentToken() {
  return (
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken') ||
    getCookie('accessToken')
  );
}

/**
 * 로그인 상태 확인
 */
function isLoggedIn() {
  const token = getCurrentToken();
  return isTokenValid(token);
}

// 초기화
document.addEventListener('DOMContentLoaded', function () {
  detectNativeApp();

  // 앱에서 받은 이벤트 리스너 등록
  window.addEventListener('appLoginSuccess', function (e) {
    console.log('앱 로그인 성공 이벤트 수신');
  });

  window.addEventListener('appLogout', function (e) {
    console.log('앱 로그아웃 이벤트 수신');
  });

  window.addEventListener('webLoginSuccess', function (e) {
    console.log('웹 로그인 성공 이벤트 수신');
  });

  window.addEventListener('webLogout', function (e) {
    console.log('웹 로그아웃 이벤트 수신');
  });

  // 🎯 웹창 닫힘 시 30일 자동로그인 보장
  window.addEventListener('beforeunload', function (e) {
    console.log('🔄 웹창 닫힘 감지 - 30일 자동로그인 보장 시작');

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

        console.log('💾 웹창 닫힘 시 30일 자동로그인 보장 완료');
        console.log('📅 만료 시간:', thirtyDaysFromNow.toLocaleDateString());
      }
    }
  });

  // 🎯 페이지 숨김 시에도 30일 자동로그인 보장
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      console.log('🔄 페이지 숨김 감지 - 30일 자동로그인 보장 시작');

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

          console.log('💾 페이지 숨김 시 30일 자동로그인 보장 완료');
          console.log('📅 만료 시간:', thirtyDaysFromNow.toLocaleDateString());
        }
      }
    }
  });
});

// 전역 함수로 노출 (앱에서 호출 가능)
window.handleAppLogin = handleAppLogin;
window.handleAppLogout = handleAppLogout;
window.handleWebLoginSuccess = handleWebLoginSuccess;
window.handleWebLogout = handleWebLogout;
window.refreshToken = refreshToken;
window.isLoggedIn = isLoggedIn;
window.getCurrentToken = getCurrentToken;
window.saveTokensWithKeepLogin = saveTokensWithKeepLogin;
window.checkInstagramLoginStatus = checkInstagramLoginStatus;
window.saveKeepLoginSetting = saveKeepLoginSetting;
