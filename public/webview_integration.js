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

  // 다중 저장소에 토큰 저장
  if (loginInfo.token) {
    localStorage.setItem('accessToken', loginInfo.token);
    sessionStorage.setItem('accessToken', loginInfo.token);

    // 쿠키에도 저장
    document.cookie = `accessToken=${loginInfo.token}; path=/; secure; samesite=strict`;
  }

  if (loginInfo.refreshToken) {
    localStorage.setItem('refreshToken', loginInfo.refreshToken);
    sessionStorage.setItem('refreshToken', loginInfo.refreshToken);

    // 쿠키에도 저장
    document.cookie = `refreshToken=${loginInfo.refreshToken}; path=/; secure; samesite=strict`;
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

  // 로그인 상태 업데이트
  isLoggedIn = true;

  // 웹 로그인 성공 이벤트 발생
  window.dispatchEvent(
    new CustomEvent('appLoginSuccess', {
      detail: loginInfo,
    })
  );

  console.log('앱 로그인 처리 완료');
}

/**
 * 앱에서 받은 로그아웃 이벤트 처리
 */
function handleAppLogout() {
  console.log('앱에서 로그아웃 이벤트 수신');

  // 모든 저장소에서 토큰 삭제
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');

  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('userName');

  // 쿠키에서도 삭제
  document.cookie =
    'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie =
    'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // 로그인 상태 업데이트
  isLoggedIn = false;

  // 토큰 갱신 타이머 정리
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }

  // 웹 로그아웃 이벤트 발생
  window.dispatchEvent(new CustomEvent('appLogoutSuccess'));

  console.log('앱 로그아웃 처리 완료');

  // 페이지 리다이렉트 (로그인 페이지로)
  if (
    window.location.pathname !== '/login' &&
    window.location.pathname !== '/'
  ) {
    window.location.href = '/login';
  }
}

/**
 * 앱에서 받은 토큰 갱신 처리
 */
function handleAppTokenRefresh(refreshInfo) {
  console.log('앱에서 토큰 갱신 정보 수신:', refreshInfo);

  // 새로운 토큰으로 업데이트
  if (refreshInfo.token) {
    localStorage.setItem('accessToken', refreshInfo.token);
    sessionStorage.setItem('accessToken', refreshInfo.token);
    document.cookie = `accessToken=${refreshInfo.token}; path=/; secure; samesite=strict`;
  }

  if (refreshInfo.refreshToken) {
    localStorage.setItem('refreshToken', refreshInfo.refreshToken);
    sessionStorage.setItem('refreshToken', refreshInfo.refreshToken);
    document.cookie = `refreshToken=${refreshInfo.refreshToken}; path=/; secure; samesite=strict`;
  }

  // 토큰 갱신 타이머 재설정
  if (refreshInfo.token) {
    setupTokenRefreshTimer(refreshInfo.token);
  }

  console.log('앱 토큰 갱신 처리 완료');
}

/**
 * 웹에서 로그인 성공 시 호출 (앱에 알림)
 */
function handleWebLoginSuccess(loginInfo) {
  console.log('웹 로그인 성공:', loginInfo);

  // 다중 저장소에 토큰 저장
  if (loginInfo.token) {
    localStorage.setItem('accessToken', loginInfo.token);
    sessionStorage.setItem('accessToken', loginInfo.token);

    // 쿠키에도 저장
    document.cookie = `accessToken=${loginInfo.token}; path=/; secure; samesite=strict`;
  }

  if (loginInfo.refreshToken) {
    localStorage.setItem('refreshToken', loginInfo.refreshToken);
    sessionStorage.setItem('refreshToken', loginInfo.refreshToken);

    // 쿠키에도 저장
    document.cookie = `refreshToken=${loginInfo.refreshToken}; path=/; secure; samesite=strict`;
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

  // 인스타그램 방식: 로그인 상태 유지 설정 저장
  if (loginInfo.keepLogin !== undefined) {
    localStorage.setItem('keepLoginSetting', loginInfo.keepLogin.toString());
    console.log('로그인 상태 유지 설정 저장:', loginInfo.keepLogin);
  }

  // 앱에 로그인 정보 전달
  notifyAppLogin(loginInfo);

  // 웹 로그인 성공 이벤트 발생
  window.dispatchEvent(
    new CustomEvent('webLoginSuccess', {
      detail: loginInfo,
    })
  );

  console.log('웹 로그인 처리 완료');
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

    // 새 토큰 저장
    handleWebLoginSuccess({
      token: data.accessToken,
      refreshToken: data.refreshToken,
    });

    console.log('토큰 갱신 성공');
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

/**
 * 인스타그램 방식 로그인 상태 유지 확인
 */
function checkInstagramLoginStatus() {
  // localStorage와 sessionStorage 모두 확인
  const localToken = localStorage.getItem('accessToken');
  const sessionToken = sessionStorage.getItem('accessToken');
  const cookieToken = getCookie('accessToken');

  const token = localToken || sessionToken || cookieToken;

  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;

    // 토큰이 만료되었는지 확인
    if (payload.exp && payload.exp < currentTime) {
      console.log('토큰이 만료되어 로그인 상태 유지 불가');
      handleWebLogout();
      return false;
    }

    console.log('인스타그램 방식 로그인 상태 유지 가능');
    return true;
  } catch (error) {
    console.error('토큰 파싱 오류:', error);
    handleWebLogout();
    return false;
  }
}

/**
 * 인스타그램 방식 로그인 상태 유지 설정 가져오기
 */
function getKeepLoginSetting() {
  const setting = localStorage.getItem('keepLoginSetting');
  return setting === 'true';
}

/**
 * 인스타그램 방식 로그인 상태 유지 토큰 저장
 */
function saveTokensWithKeepLogin(accessToken, refreshToken, keepLogin = false) {
  // 로그인 상태 유지 설정 저장
  localStorage.setItem('keepLoginSetting', keepLogin.toString());
  console.log('로그인 상태 유지 설정 저장:', keepLogin);

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

  // 쿠키에도 저장 (웹뷰 호환성)
  document.cookie = `accessToken=${accessToken}; path=/; secure; samesite=strict`;
  if (refreshToken) {
    document.cookie = `refreshToken=${refreshToken}; path=/; secure; samesite=strict`;
  }

  console.log('인스타그램 방식 토큰 저장 완료');
}

/**
 * 앱에서 웹뷰로 로그아웃 이벤트 전달 (Swift에서 호출)
 */
function sendLogoutToWebView() {
  console.log('앱에서 웹뷰로 로그아웃 이벤트 전달');

  // 웹뷰에 로그아웃 이벤트 발생
  window.dispatchEvent(
    new CustomEvent('appLogoutRequest', {
      detail: {
        source: 'native',
        timestamp: Date.now(),
      },
    })
  );

  // 웹뷰 로그아웃 처리 함수 호출
  handleAppLogout();
}

/**
 * 앱에서 웹뷰로 토큰 갱신 이벤트 전달 (Swift에서 호출)
 */
function sendTokenRefreshToWebView(newToken, newRefreshToken) {
  console.log('앱에서 웹뷰로 토큰 갱신 이벤트 전달');

  // 웹뷰에 토큰 갱신 이벤트 발생
  window.dispatchEvent(
    new CustomEvent('appTokenRefresh', {
      detail: {
        token: newToken,
        refreshToken: newRefreshToken,
        source: 'native',
        timestamp: Date.now(),
      },
    })
  );

  // 웹뷰 토큰 갱신 처리 함수 호출
  handleAppTokenRefresh({
    token: newToken,
    refreshToken: newRefreshToken,
  });
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
});

// 전역 함수로 노출 (앱에서 호출 가능)
window.handleAppLogin = handleAppLogin;
window.handleAppLogout = handleAppLogout;
window.sendLogoutToWebView = sendLogoutToWebView;
window.sendTokenRefreshToWebView = sendTokenRefreshToWebView;
window.handleWebLoginSuccess = handleWebLoginSuccess;
window.handleWebLogout = handleWebLogout;
window.refreshToken = refreshToken;
window.isLoggedIn = isLoggedIn;
window.getCurrentToken = getCurrentToken;
window.checkInstagramLoginStatus = checkInstagramLoginStatus;
window.getKeepLoginSetting = getKeepLoginSetting;
window.saveTokensWithKeepLogin = saveTokensWithKeepLogin;
