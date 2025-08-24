/**
 * 환경 변수 유틸리티 함수
 * 타입 안전성을 보장하고 기본값을 제공합니다.
 */

export const getEnvVar = (
  key: keyof ImportMetaEnv,
  defaultValue?: string
): string => {
  const value = import.meta.env[key];

  if (value !== undefined) {
    return value;
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  // 빌드 시 환경 변수가 없어도 오류를 발생시키지 않음
  console.warn(`환경 변수 ${key}가 설정되지 않았습니다. 기본값을 사용합니다.`);
  return '';
};

export const getRequiredEnvVar = (key: keyof ImportMetaEnv): string => {
  return getEnvVar(key);
};

export const getOptionalEnvVar = (
  key: keyof ImportMetaEnv,
  defaultValue: string = ''
): string => {
  try {
    return getEnvVar(key, defaultValue);
  } catch {
    return defaultValue;
  }
};

export const isDevelopment = (): boolean => {
  return import.meta.env.VITE_APP_ENV === 'development';
};

export const isProduction = (): boolean => {
  return import.meta.env.VITE_APP_ENV === 'production';
};

export const isStaging = (): boolean => {
  return import.meta.env.VITE_APP_ENV === 'staging';
};

// API 관련 환경 변수
export const API_CONFIG = {
  BASE_URL: getOptionalEnvVar('VITE_API_BASE_URL', 'http://localhost:3000'),
  TIMEOUT: parseInt(getOptionalEnvVar('VITE_API_TIMEOUT', '10000')),
} as const;

// 인증 관련 환경 변수
export const AUTH_CONFIG = {
  DOMAIN: getOptionalEnvVar('VITE_AUTH_DOMAIN', ''),
  CLIENT_ID: getOptionalEnvVar('VITE_AUTH_CLIENT_ID', ''),
} as const;

// 외부 서비스 설정
export const EXTERNAL_SERVICES = {
  KAKAO_MAP_API_KEY: getOptionalEnvVar('VITE_KAKAO_MAP_API_KEY', ''),
  FIREBASE: {
    API_KEY: getOptionalEnvVar('VITE_FIREBASE_API_KEY', ''),
    AUTH_DOMAIN: getOptionalEnvVar('VITE_FIREBASE_AUTH_DOMAIN', ''),
    PROJECT_ID: getOptionalEnvVar('VITE_FIREBASE_PROJECT_ID', ''),
  },
} as const;

// 기능 플래그
export const FEATURE_FLAGS = {
  ANALYTICS: getOptionalEnvVar('VITE_ENABLE_ANALYTICS', 'false') === 'true',
  DEBUG_MODE: getOptionalEnvVar('VITE_ENABLE_DEBUG_MODE', 'false') === 'true',
  PERFORMANCE_MONITORING:
    getOptionalEnvVar('VITE_ENABLE_PERFORMANCE_MONITORING', 'true') === 'true',
} as const;

// 앱 정보
export const APP_INFO = {
  ENV: getOptionalEnvVar('VITE_APP_ENV', 'development'),
  VERSION: getOptionalEnvVar('VITE_APP_VERSION', '1.0.0'),
} as const;
