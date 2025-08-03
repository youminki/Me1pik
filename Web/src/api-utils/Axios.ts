import axios, { AxiosRequestConfig } from 'axios';

import { getCurrentToken, refreshToken, clearTokens } from '@/utils/auth';
import { trackApiCall } from '@/utils/monitoring';

interface RequestMetadata {
  requestId: string;
  startTime: number;
  cacheKey?: string;
}

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  metadata?: RequestMetadata;
  _retry?: boolean;
  _retryCount?: number;
}

// 캐시 관리
const cache = new Map<
  string,
  { data: unknown; timestamp: number; ttl: number }
>();

// 재시도 설정
const retryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

export const Axios = axios.create({
  baseURL: 'https://api.stylewh.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000, // 10초 타임아웃
});

// 요청 인터셉터: 매 요청마다 최신 토큰을 헤더에 추가
Axios.interceptors.request.use(
  (config) => {
    const token = getCurrentToken();
    const startTime = Date.now();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 요청 ID 생성 (디버깅용)
    (config as ExtendedAxiosRequestConfig).metadata = {
      requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime,
    };

    // 캐시 키 생성
    const cacheKey = `${config.method?.toUpperCase()}-${config.url}-${JSON.stringify(config.params || {})}`;
    (config as ExtendedAxiosRequestConfig).metadata!.cacheKey = cacheKey;

    console.log(
      `🚀 API 요청 시작: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error('❌ 요청 인터셉터 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 오류 시 토큰 갱신 시도 (무신사 스타일)
Axios.interceptors.response.use(
  (response) => {
    const endTime = Date.now();
    const duration =
      endTime -
      ((response.config as ExtendedAxiosRequestConfig).metadata?.startTime ||
        endTime);

    // 성능 모니터링
    trackApiCall(
      response.config.url || '',
      response.config.method || '',
      duration,
      response.status
    );

    // GET 요청 결과 캐싱
    if (
      response.config.method?.toLowerCase() === 'get' &&
      response.status === 200
    ) {
      const cacheKey = (response.config as ExtendedAxiosRequestConfig).metadata
        ?.cacheKey;
      if (cacheKey) {
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
          ttl: 5 * 60 * 1000, // 5분 캐시
        });
        console.log('💾 응답 캐싱:', cacheKey);
      }
    }

    console.log(
      `✅ API 응답 완료: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const endTime = Date.now();
    const duration =
      endTime -
      ((originalRequest as ExtendedAxiosRequestConfig)?.metadata?.startTime ||
        endTime);

    // 성능 모니터링 (에러 포함)
    if (originalRequest?.url) {
      trackApiCall(
        originalRequest.url,
        originalRequest.method || '',
        duration,
        error.response?.status || 0
      );
    }

    // 재시도 로직
    if (shouldRetry(error, originalRequest)) {
      return retryRequest(originalRequest);
    }

    // 401 에러 처리 (토큰 갱신)
    if (
      error.response?.status === 401 &&
      !(originalRequest as ExtendedAxiosRequestConfig)._retry
    ) {
      (originalRequest as ExtendedAxiosRequestConfig)._retry = true;

      try {
        console.log('🔄 Axios 인터셉터: 토큰 갱신 시도');

        // auth.ts의 refreshToken 함수 사용
        const success = await refreshToken();

        if (success) {
          console.log('✅ Axios 인터셉터: 토큰 갱신 성공');

          // 새 토큰으로 원래 요청 재시도
          const newToken = getCurrentToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return Axios(originalRequest);
          }
        } else {
          console.log('❌ Axios 인터셉터: 토큰 갱신 실패');
          clearTokens();
          redirectToLogin();
        }
      } catch (refreshError) {
        console.error('❌ Axios 인터셉터: 토큰 갱신 중 오류:', refreshError);
        clearTokens();
        redirectToLogin();
      }
    }

    console.error(
      `❌ API 오류: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} (${duration}ms)`,
      error
    );
    return Promise.reject(error);
  }
);

// 재시도 로직
function shouldRetry(error: unknown, config: unknown): boolean {
  const retryCount = (config as ExtendedAxiosRequestConfig)._retryCount || 0;

  return (
    retryCount < retryConfig.maxRetries &&
    (retryConfig.retryableStatuses.includes(
      (error as { response?: { status?: number } }).response?.status || 0
    ) ||
      (error as { code?: string }).code === 'ECONNABORTED' ||
      (error as { code?: string }).code === 'NETWORK_ERROR')
  );
}

async function retryRequest(config: unknown): Promise<unknown> {
  const retryCount =
    ((config as ExtendedAxiosRequestConfig)._retryCount || 0) + 1;
  (config as ExtendedAxiosRequestConfig)._retryCount = retryCount;

  const delay = retryConfig.retryDelay * Math.pow(2, retryCount - 1);

  console.log(
    `🔄 재시도 ${retryCount}/${retryConfig.maxRetries} (${delay}ms 후): ${(config as ExtendedAxiosRequestConfig).method?.toUpperCase()} ${(config as ExtendedAxiosRequestConfig).url}`
  );

  await new Promise((resolve) => setTimeout(resolve, delay));

  // 타입 안전성을 위해 config를 ExtendedAxiosRequestConfig로 캐스팅
  return Axios(config as ExtendedAxiosRequestConfig);
}

// 토큰 관리 함수들 (간소화)
function redirectToLogin(): void {
  const event = new CustomEvent('forceLoginRedirect');
  window.dispatchEvent(event);
}

// 캐시 관리 함수들
export const clearCache = (pattern?: string): void => {
  if (pattern) {
    for (const [key] of cache) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
  console.log('🗑️ 캐시 정리 완료');
};

export const getCacheStats = (): { size: number; keys: string[] } => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
};
