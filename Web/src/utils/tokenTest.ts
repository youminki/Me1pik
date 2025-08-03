import Cookies from 'js-cookie';

import {
  getCurrentToken,
  getRefreshToken,
  hasValidToken,
  saveTokens,
  clearTokens,
} from './auth';

/**
 * 토큰 시스템 종합 테스트
 */
export const runTokenSystemTest = async (): Promise<void> => {
  console.log('🧪 === 토큰 시스템 종합 테스트 시작 ===');

  // 1. 초기 상태 확인
  console.log('\n📋 1. 초기 토큰 상태 확인');
  const initialToken = getCurrentToken();
  const initialRefreshToken = getRefreshToken();
  const initialValid = hasValidToken();

  console.log('초기 액세스 토큰:', initialToken ? '있음' : '없음');
  console.log('초기 리프레시 토큰:', initialRefreshToken ? '있음' : '없음');
  console.log('토큰 유효성:', initialValid ? '유효' : '무효');

  // 2. 토큰 저장 테스트
  console.log('\n📋 2. 토큰 저장 테스트');
  const testAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.test';
  const testRefreshToken = 'refresh_token_test_123';

  saveTokens(testAccessToken, testRefreshToken);

  const savedToken = getCurrentToken();
  const savedRefreshToken = getRefreshToken();
  const savedValid = hasValidToken();

  console.log('저장 후 액세스 토큰:', savedToken ? '있음' : '없음');
  console.log('저장 후 리프레시 토큰:', savedRefreshToken ? '있음' : '없음');
  console.log('저장 후 토큰 유효성:', savedValid ? '유효' : '무효');

  // 3. 토큰 삭제 테스트
  console.log('\n📋 3. 토큰 삭제 테스트');
  clearTokens();

  const clearedToken = getCurrentToken();
  const clearedRefreshToken = getRefreshToken();
  const clearedValid = hasValidToken();

  console.log('삭제 후 액세스 토큰:', clearedToken ? '있음' : '없음');
  console.log('삭제 후 리프레시 토큰:', clearedRefreshToken ? '있음' : '없음');
  console.log('삭제 후 토큰 유효성:', clearedValid ? '유효' : '무효');

  // 4. 만료된 토큰 테스트
  console.log('\n📋 4. 만료된 토큰 테스트');
  const expiredToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9.expired';

  saveTokens(expiredToken, testRefreshToken);
  const expiredValid = hasValidToken();
  console.log('만료된 토큰 유효성:', expiredValid ? '유효' : '무효');

  // 5. 정리
  clearTokens();
  console.log('\n✅ === 토큰 시스템 종합 테스트 완료 ===');
};

/**
 * 토큰 갱신 테스트
 */
export const runTokenRefreshTest = async (): Promise<void> => {
  console.log('🔄 === 토큰 갱신 테스트 시작 ===');

  // 1. 유효한 토큰으로 시작
  const validToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.valid';
  const refreshToken = 'refresh_token_test_123';

  saveTokens(validToken, refreshToken);

  // 2. 갱신 시도
  try {
    const { refreshToken: refreshTokenFn } = await import('./auth');
    const success = await refreshTokenFn();
    console.log('토큰 갱신 결과:', success ? '성공' : '실패');
  } catch (error) {
    console.log('토큰 갱신 중 오류:', error);
  }

  // 3. 정리
  clearTokens();
  console.log('✅ === 토큰 갱신 테스트 완료 ===');
};

/**
 * 다중 저장소 테스트
 */
export const runMultiStorageTest = (): void => {
  console.log('💾 === 다중 저장소 테스트 시작 ===');

  const testToken = 'test_token_123';

  // localStorage에 저장
  localStorage.setItem('accessToken', testToken);
  console.log(
    'localStorage 저장 후:',
    getCurrentToken() === testToken ? '성공' : '실패'
  );

  // sessionStorage에 저장
  sessionStorage.setItem('accessToken', testToken);
  console.log(
    'sessionStorage 저장 후:',
    getCurrentToken() === testToken ? '성공' : '실패'
  );

  // Cookies에 저장
  Cookies.set('accessToken', testToken, { path: '/' });
  console.log(
    'Cookies 저장 후:',
    getCurrentToken() === testToken ? '성공' : '실패'
  );

  // 정리
  localStorage.removeItem('accessToken');
  sessionStorage.removeItem('accessToken');
  Cookies.remove('accessToken');

  console.log('✅ === 다중 저장소 테스트 완료 ===');
};

/**
 * 리프레시 토큰 활성화 상태 확인
 */
export const checkRefreshTokenStatus = (): void => {
  console.log('🔄 === 리프레시 토큰 활성화 상태 확인 ===');

  // 1. 현재 리프레시 토큰 확인
  const refreshToken = getRefreshToken();
  console.log('📋 1. 현재 리프레시 토큰 상태:');
  console.log('- 리프레시 토큰 존재:', !!refreshToken);
  console.log('- 리프레시 토큰 길이:', refreshToken?.length || 0);

  // 2. 다중 저장소에서 리프레시 토큰 확인
  const localRefreshToken = localStorage.getItem('refreshToken');
  const sessionRefreshToken = sessionStorage.getItem('refreshToken');
  const cookieRefreshToken = Cookies.get('refreshToken');

  console.log('📋 2. 다중 저장소 리프레시 토큰 상태:');
  console.log(
    '- localStorage:',
    !!localRefreshToken,
    localRefreshToken?.length || 0
  );
  console.log(
    '- sessionStorage:',
    !!sessionRefreshToken,
    sessionRefreshToken?.length || 0
  );
  console.log(
    '- Cookies:',
    !!cookieRefreshToken,
    cookieRefreshToken?.length || 0
  );

  // 3. 리프레시 토큰 유효성 확인
  if (refreshToken) {
    try {
      // JWT 토큰 구조 확인 (리프레시 토큰이 JWT 형식인 경우)
      const parts = refreshToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('📋 3. 리프레시 토큰 JWT 정보:');
        console.log(
          '- 만료시간:',
          payload.exp ? new Date(payload.exp * 1000).toLocaleString() : '없음'
        );
        console.log(
          '- 발급시간:',
          payload.iat ? new Date(payload.iat * 1000).toLocaleString() : '없음'
        );
        console.log('- 현재시간:', new Date().toLocaleString());

        if (payload.exp) {
          const currentTime = Date.now() / 1000;
          const isExpired = payload.exp < currentTime;
          const timeUntilExpiry = payload.exp - currentTime;

          console.log('- 만료 여부:', isExpired ? '만료됨' : '유효함');
          console.log(
            '- 만료까지 남은 시간:',
            Math.floor(timeUntilExpiry / 60) + '분'
          );
        }
      } else {
        console.log('📋 3. 리프레시 토큰 (JWT 형식 아님):');
        console.log('- 토큰 형식: 일반 문자열');
      }
    } catch (error) {
      console.log('📋 3. 리프레시 토큰 디코딩 실패:', error);
    }
  }

  // 4. 자동 갱신 타이머 상태 확인
  console.log('📋 4. 자동 갱신 시스템 상태:');
  const autoLogin = localStorage.getItem('autoLogin');
  console.log(
    '- 자동로그인 설정:',
    autoLogin === 'true' ? '활성화' : '비활성화'
  );

  // 5. 액세스 토큰과의 관계 확인
  const accessToken = getCurrentToken();
  console.log('📋 5. 액세스 토큰과의 관계:');
  console.log('- 액세스 토큰 존재:', !!accessToken);
  console.log('- 액세스 토큰 유효성:', hasValidToken());

  console.log('✅ === 리프레시 토큰 활성화 상태 확인 완료 ===');
};

/**
 * 리프레시 토큰 갱신 테스트
 */
export const testRefreshTokenRenewal = async (): Promise<void> => {
  console.log('🔄 === 리프레시 토큰 갱신 테스트 시작 ===');

  // 1. 현재 상태 확인
  const currentRefreshToken = getRefreshToken();
  console.log(
    '📋 1. 갱신 전 리프레시 토큰:',
    currentRefreshToken ? '있음' : '없음'
  );

  if (!currentRefreshToken) {
    console.log('❌ 리프레시 토큰이 없어서 갱신 테스트를 건너뜁니다.');
    return;
  }

  // 2. 갱신 시도
  try {
    const { refreshToken: refreshTokenFn } = await import('./auth');
    console.log('📋 2. 리프레시 토큰 갱신 시도...');

    const success = await refreshTokenFn();
    console.log('📋 3. 갱신 결과:', success ? '성공' : '실패');

    if (success) {
      const newRefreshToken = getRefreshToken();
      console.log(
        '📋 4. 갱신 후 리프레시 토큰:',
        newRefreshToken ? '있음' : '없음'
      );
      console.log(
        '📋 5. 토큰 변경 여부:',
        newRefreshToken !== currentRefreshToken ? '변경됨' : '동일함'
      );
    }
  } catch (error) {
    console.error('❌ 리프레시 토큰 갱신 중 오류:', error);
  }

  console.log('✅ === 리프레시 토큰 갱신 테스트 완료 ===');
};

/**
 * 리프레시 토큰 저장 테스트
 */
export const testRefreshTokenStorage = (): void => {
  console.log('💾 === 리프레시 토큰 저장 테스트 시작 ===');

  const testRefreshToken = 'test_refresh_token_123';

  // 1. 테스트 토큰 저장
  console.log('📋 1. 테스트 리프레시 토큰 저장...');
  saveTokens('test_access_token', testRefreshToken);

  // 2. 저장 확인
  const savedRefreshToken = getRefreshToken();
  console.log(
    '📋 2. 저장된 리프레시 토큰:',
    savedRefreshToken === testRefreshToken ? '성공' : '실패'
  );

  // 3. 다중 저장소 확인
  const localRefreshToken = localStorage.getItem('refreshToken');
  const sessionRefreshToken = sessionStorage.getItem('refreshToken');
  const cookieRefreshToken = Cookies.get('refreshToken');

  console.log('📋 3. 다중 저장소 저장 확인:');
  console.log(
    '- localStorage:',
    localRefreshToken === testRefreshToken ? '성공' : '실패'
  );
  console.log(
    '- sessionStorage:',
    sessionRefreshToken === testRefreshToken ? '성공' : '실패'
  );
  console.log(
    '- Cookies:',
    cookieRefreshToken === testRefreshToken ? '성공' : '실패'
  );

  // 4. 정리
  clearTokens();
  console.log('📋 4. 테스트 토큰 정리 완료');

  console.log('✅ === 리프레시 토큰 저장 테스트 완료 ===');
};
