import axios, { AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

import { getCurrentToken } from '@/utils/auth';
import { trackApiCall } from '@/utils/monitoring';

// 🔧 개선: 단일 refresh in-flight + 요청 큐잉 보장
let refreshing = false;
let waiters: Array<() => void> = [];

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

    // 🔧 개선: 초기 401 폭격 방지 - 복구 중일 때는 요청을 큐잉
    if (error.response?.status === 401) {
      const isRecovering =
        localStorage.getItem('autoLoginInProgress') === 'true';
      const isCompleted = localStorage.getItem('autoLoginCompleted') === 'true';

      if (isRecovering && !isCompleted) {
        console.log('🔄 자동 로그인 복구 중 - 요청을 큐잉합니다');
        // 복구가 완료될 때까지 잠시 대기
        await new Promise((resolve) => {
          const checkRecovery = () => {
            const completed =
              localStorage.getItem('autoLoginCompleted') === 'true';
            if (completed) {
              resolve(true);
            } else {
              setTimeout(checkRecovery, 100);
            }
          };
          checkRecovery();
        });

        // 복구 완료 후 원래 요청 재시도
        console.log('✅ 복구 완료 - 원래 요청 재시도');
        return Axios(originalRequest);
      }
    }

    // 재시도 로직
    if (shouldRetry(error, originalRequest)) {
      return retryRequest(originalRequest);
    }

    // 401 에러 처리 (토큰 갱신)
    if (error.response?.status === 401) {
      // 🔧 개선: 이미 refresh 중이면 대기
      if (refreshing) {
        console.log('🔄 이미 토큰 갱신 중 - 요청을 큐에 대기');
        await new Promise<void>((resolve) => waiters.push(resolve));
        console.log('✅ 토큰 갱신 완료 - 대기 중인 요청 재시도');
        // 🔧 개선: 재시도 시 최신 토큰 주입
        const currentToken = getCurrentToken();
        if (currentToken) {
          originalRequest.headers.Authorization = `Bearer ${currentToken}`;
        }
        return Axios(originalRequest); // 토큰 갱신 후 재시도
      }

      // 이미 재시도 중인 경우 무한 루프 방지
      if ((originalRequest as ExtendedAxiosRequestConfig)._retry) {
        console.log('🔄 이미 토큰 갱신을 시도했으므로 로그아웃 처리');
        clearAllTokens();
        redirectToLogin();
        return Promise.reject(error);
      }

      // 재시도 플래그 설정
      (originalRequest as ExtendedAxiosRequestConfig)._retry = true;

      try {
        // auth.ts의 getRefreshToken 함수와 동일한 로직 사용
        const localToken = localStorage.getItem('refreshToken');
        const sessionToken = sessionStorage.getItem('refreshToken');
        const cookieToken = Cookies.get('refreshToken');
        const REFRESH_TOKEN =
          localToken?.trim() || sessionToken?.trim() || cookieToken?.trim();

        if (!REFRESH_TOKEN) {
          console.log('❌ 리프레시 토큰이 없어서 로그아웃 처리');
          clearAllTokens();
          redirectToLogin();
          return Promise.reject(error);
        }

        // 🔧 개선: refresh 시작 플래그 설정
        refreshing = true;
        console.log('🔄 Axios 인터셉터: 토큰 갱신 시도', {
          url: originalRequest.url,
          method: originalRequest.method,
          hasRefreshToken: !!REFRESH_TOKEN,
          refreshTokenLength: REFRESH_TOKEN?.length,
        });

        // 토큰 갱신 시도
        const { data } = await axios.post(
          'https://api.stylewh.com/auth/refresh',
          { refreshToken: REFRESH_TOKEN },
          { withCredentials: true }
        );

        console.log('✅ Axios 인터셉터: 토큰 갱신 성공');

        // 새 토큰 저장
        saveTokens(data.accessToken, data.refreshToken);

        // 🔧 개선: 대기 중인 모든 요청들 해제
        waiters.forEach((w) => w());
        waiters = [];

        // 성공 이벤트 발생
        window.dispatchEvent(
          new CustomEvent('tokenRefreshSuccess', {
            detail: {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            },
          })
        );

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        console.log('🔄 원래 요청 재시도:', originalRequest.url);
        return Axios(originalRequest);
      } catch (refreshError) {
        console.error('❌ Axios 인터셉터: 토큰 갱신 실패:', refreshError);

        // 🎯 토큰 갱신 실패 시 즉시 로그아웃하지 않고 이벤트 발생
        console.log('❌ 토큰 갱신 실패 - 이벤트 발생');

        // 토큰 갱신 실패 이벤트 발생
        window.dispatchEvent(
          new CustomEvent('tokenRefreshFailed', {
            detail: {
              reason: 'Axios 인터셉터 토큰 갱신 실패',
              error: refreshError,
              timestamp: new Date().toLocaleString(),
            },
          })
        );

        // 🎯 iOS 앱 환경에서는 로그아웃하지 않고 에러만 반환
        if (window.webkit?.messageHandlers) {
          console.log('iOS 앱 환경 - 로그아웃 처리하지 않음');
          return Promise.reject(refreshError);
        }

        // 웹 환경에서만 로그아웃 처리
        clearAllTokens();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        // 🔧 개선: refresh 완료 플래그 리셋
        refreshing = false;
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

// 토큰 관리 함수들
function clearAllTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
}

function saveTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem('accessToken', accessToken);
  Cookies.set('accessToken', accessToken, { secure: true });

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
    Cookies.set('refreshToken', refreshToken, { secure: true });
  }
}

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
