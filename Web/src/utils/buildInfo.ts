import {
  APP_INFO,
  FEATURE_FLAGS,
  isDevelopment,
  isProduction,
  isStaging,
} from './env';

/**
 * 빌드 정보를 반환합니다
 */
export const getBuildInfo = () => {
  return {
    environment: APP_INFO.ENV,
    version: APP_INFO.VERSION,
    buildTime: new Date().toISOString(),
    features: FEATURE_FLAGS,
    isDev: isDevelopment(),
    isProd: isProduction(),
    isStaging: isStaging(),
  };
};

/**
 * 개발 환경에서만 콘솔에 빌드 정보를 출력합니다
 */
export const logBuildInfo = () => {
  if (isDevelopment()) {
    console.group('🏗️ 빌드 정보');
    console.log('환경:', APP_INFO.ENV);
    console.log('버전:', APP_INFO.VERSION);
    console.log('빌드 시간:', new Date().toISOString());
    console.log('기능 플래그:', FEATURE_FLAGS);
    console.groupEnd();
  }
};

/**
 * 프로덕션 환경에서 불필요한 로그를 제거합니다
 */
export const setupProductionLogging = () => {
  if (isProduction()) {
    // 프로덕션에서 console.log 비활성화
    if (!FEATURE_FLAGS.DEBUG_MODE) {
      console.log = () => {};
      console.info = () => {};
      console.debug = () => {};
    }
  }
};
