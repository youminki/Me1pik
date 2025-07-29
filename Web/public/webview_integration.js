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

  // 로그인 성공 이벤트 발생
  window.dispatchEvent(
    new CustomEvent('appLoginSuccess', {
      detail: loginInfo,
    })
  );

  console.log('앱 로그인 정보 저장 완료');
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
window.handleWebLoginSuccess = handleWebLoginSuccess;
window.handleWebLogout = handleWebLogout;
window.refreshToken = refreshToken;
window.isLoggedIn = isLoggedIn;
window.getCurrentToken = getCurrentToken;
