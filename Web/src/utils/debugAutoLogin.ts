/**
 * 30일 자동 로그인 디버깅 유틸리티
 */

export const debugAutoLoginStatus = () => {
  console.log('🔍 30일 자동 로그인 상태 디버깅 시작');
  console.log('='.repeat(50));

  // 1. 자동 로그인 설정 확인
  const autoLogin = localStorage.getItem('autoLogin') === 'true';
  const loginTimestamp = localStorage.getItem('loginTimestamp');
  const autoRefreshInterval = localStorage.getItem('autoRefreshInterval');

  console.log('📋 자동 로그인 설정:');
  console.log('  - autoLogin:', autoLogin);
  console.log(
    '  - loginTimestamp:',
    loginTimestamp
      ? new Date(parseInt(loginTimestamp)).toLocaleString()
      : '없음'
  );
  console.log(
    '  - autoRefreshInterval:',
    autoRefreshInterval ? '설정됨' : '설정되지 않음'
  );

  // 2. 토큰 저장소 확인
  const storageStatus = {
    localStorage: {
      accessToken: !!localStorage.getItem('accessToken'),
      refreshToken: !!localStorage.getItem('refreshToken'),
    },
    sessionStorage: {
      accessToken: !!sessionStorage.getItem('accessToken'),
      refreshToken: !!sessionStorage.getItem('refreshToken'),
    },
    cookies: {
      accessToken: !!document.cookie.includes('accessToken'),
      refreshToken: !!document.cookie.includes('refreshToken'),
    },
  };

  console.log('💾 저장소 상태:');
  console.log('  - localStorage:', storageStatus.localStorage);
  console.log('  - sessionStorage:', storageStatus.sessionStorage);
  console.log('  - cookies:', storageStatus.cookies);

  // 3. 쿠키 상세 확인
  const cookies = document.cookie.split(';');
  const accessTokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith('accessToken=')
  );
  const refreshTokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith('refreshToken=')
  );

  console.log('🍪 쿠키 상세:');
  console.log('  - accessToken 쿠키:', accessTokenCookie ? '존재' : '없음');
  console.log('  - refreshToken 쿠키:', refreshTokenCookie ? '존재' : '없음');

  // 4. 토큰 유효성 확인
  const accessToken =
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken') ||
    (document.cookie.match(/accessToken=([^;]+)/) || [])[1];

  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      const minutesLeft = Math.floor(timeUntilExpiry / 60);
      const hoursLeft = Math.floor(timeUntilExpiry / 3600);
      const daysLeft = Math.floor(timeUntilExpiry / (24 * 3600));

      console.log('🔑 토큰 유효성:');
      console.log(
        '  - 만료 시간:',
        new Date(payload.exp * 1000).toLocaleString()
      );
      console.log(
        '  - 남은 시간:',
        `${daysLeft}일 ${hoursLeft % 24}시간 ${minutesLeft % 60}분`
      );
      console.log('  - 만료 여부:', timeUntilExpiry <= 0 ? '만료됨' : '유효함');
    } catch (error) {
      console.log('❌ 토큰 파싱 오류:', error);
    }
  } else {
    console.log('❌ 토큰이 없습니다');
  }

  // 5. 자동 갱신 인터벌 확인
  if (autoRefreshInterval) {
    console.log('⏰ 자동 갱신 인터벌:');
    console.log('  - 인터벌 ID:', autoRefreshInterval);
    console.log('  - 상태: 활성화됨');
  } else {
    console.log('⏰ 자동 갱신 인터벌: 설정되지 않음');
  }

  // 6. 종합 상태
  const persistentCount = Object.values(storageStatus).reduce(
    (acc, storage) => {
      return (
        acc + (storage.accessToken ? 1 : 0) + (storage.refreshToken ? 1 : 0)
      );
    },
    0
  );

  const isFullyConfigured =
    autoLogin &&
    persistentCount >= 6 && // 3개 저장소 × 2개 토큰
    !!autoRefreshInterval;

  console.log('📊 종합 상태:');
  console.log('  - 완전 설정됨:', isFullyConfigured ? '✅' : '❌');
  console.log('  - 저장소 점수:', `${persistentCount}/6`);

  // 토큰 유효성 확인
  let hasValidToken = false;
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      hasValidToken = timeUntilExpiry > 0;
    } catch {
      hasValidToken = false;
    }
  }

  console.log('='.repeat(50));
  return {
    autoLogin,
    persistentCount,
    isFullyConfigured,
    hasValidToken,
  };
};

export const setupTestAutoLogin = () => {
  console.log('🧪 테스트용 30일 자동 로그인 설정 시작');

  // 테스트용 토큰 생성 (실제로는 로그인 후 받아야 함)
  const testAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.test';
  const testRefreshToken = 'refresh_token_test_123';

  // 1. 모든 저장소에 토큰 저장
  localStorage.setItem('accessToken', testAccessToken);
  localStorage.setItem('refreshToken', testRefreshToken);
  sessionStorage.setItem('accessToken', testAccessToken);
  sessionStorage.setItem('refreshToken', testRefreshToken);

  // 2. 쿠키에 토큰 저장 (30일 만료)
  const maxAge = 30 * 24 * 60 * 60;
  document.cookie = `accessToken=${testAccessToken}; max-age=${maxAge}; path=/; SameSite=Strict`;
  document.cookie = `refreshToken=${testRefreshToken}; max-age=${maxAge}; path=/; SameSite=Strict`;

  // 3. 자동 로그인 설정
  localStorage.setItem('autoLogin', 'true');
  localStorage.setItem('loginTimestamp', Date.now().toString());

  // 4. 자동 갱신 인터벌 설정
  const autoRefreshInterval = setInterval(() => {
    console.log('🔄 자동 토큰 갱신 체크:', new Date().toLocaleString());
  }, 60000); // 1분마다

  localStorage.setItem('autoRefreshInterval', autoRefreshInterval.toString());

  console.log('✅ 테스트용 30일 자동 로그인 설정 완료');
  debugAutoLoginStatus();
};

export const disableTestAutoLogin = () => {
  console.log('🔓 테스트용 30일 자동 로그인 해제 시작');

  // 자동 로그인 해제
  localStorage.removeItem('autoLogin');
  localStorage.removeItem('loginTimestamp');

  // 자동 갱신 중지
  const intervalId = localStorage.getItem('autoRefreshInterval');
  if (intervalId) {
    clearInterval(parseInt(intervalId));
    localStorage.removeItem('autoRefreshInterval');
  }

  // 쿠키 삭제
  document.cookie =
    'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie =
    'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

  console.log('✅ 테스트용 30일 자동 로그인 해제 완료');
  debugAutoLoginStatus();
};

// 브라우저 콘솔에서 사용할 수 있도록 전역 함수로 등록
if (typeof window !== 'undefined') {
  (
    window as Window &
      typeof globalThis & {
        debugAutoLogin: typeof debugAutoLoginStatus;
        setupTestAutoLogin: typeof setupTestAutoLogin;
        disableTestAutoLogin: typeof disableTestAutoLogin;
      }
  ).debugAutoLogin = debugAutoLoginStatus;
  (
    window as Window &
      typeof globalThis & {
        debugAutoLogin: typeof debugAutoLoginStatus;
        setupTestAutoLogin: typeof setupTestAutoLogin;
        disableTestAutoLogin: typeof disableTestAutoLogin;
      }
  ).setupTestAutoLogin = setupTestAutoLogin;
  (
    window as Window &
      typeof globalThis & {
        debugAutoLogin: typeof debugAutoLoginStatus;
        setupTestAutoLogin: typeof setupTestAutoLogin;
        disableTestAutoLogin: typeof disableTestAutoLogin;
      }
  ).disableTestAutoLogin = disableTestAutoLogin;
}
