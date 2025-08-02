import axios, { AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

/**
 * Axios 기반 API 유틸리티
 *
 * - 인증 토큰 자동 처리, 요청/응답 캐싱, 재시도, 에러 핸들링 등 통합 관리
 * - 인터셉터 기반으로 모든 API 요청에 일관된 정책 적용
 */

/**
 * 요청 메타데이터 인터페이스
 *
 * 각 API 요청에 대한 추적 정보(식별자, 시작시간, 캐시키 등) 저장
 */
interface RequestMetadata {
  requestId: string; // 요청 식별자
  startTime: number; // 요청 시작 시간
  cacheKey?: string; // 캐시 키 (GET 요청용)
}

/**
 * 확장된 Axios 요청 설정
 *
 * 메타데이터, 재시도 플래그 등 커스텀 필드 포함
 */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  metadata?: RequestMetadata;
  _retry?: boolean; // 재시도 플래그
  _retryCount?: number; // 재시도 횟수
}

import { getCurrentToken } from '@/utils/auth';
import { trackApiCall } from '@/utils/monitoring';

/**
 * API 응답 캐시 관리
 *
 * 요청별로 응답/타임스탬프/TTL을 Map으로 관리
 */
const cache = new Map<
  string,
  { data: unknown; timestamp: number; ttl: number }
>();

/**
 * 재시도 설정
 *
 * 최대 횟수, 딜레이, 재시도 허용 HTTP 상태코드 등
 */
const retryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504], // 타임아웃, 과부하, 서버 오류
};

/**
 * Axios 인스턴스 생성
 *
 * baseURL, withCredentials, timeout 등 공통 옵션 지정
 */
export const Axios = axios.create({
  baseURL: 'https://api.stylewh.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000, // 10초 타임아웃
});

/**
 * 요청 인터셉터
 *
 * - 인증 토큰 자동 추가
 * - 요청 메타데이터/캐시키 생성
 * - 요청 로깅
 */
Axios.interceptors.request.use(
  (config) => {
    const token = getCurrentToken();
    const startTime = Date.now();

    // 인증 토큰이 있으면 헤더에 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /**
     * 요청 식별자 생성
     *
     * 각 API 요청에 고유한 식별자를 부여하여 추적 가능성을 높입니다.
     */
    (config as ExtendedAxiosRequestConfig).metadata = {
      requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime,
    };

    /**
     * GET 요청용 캐시 키 생성
     *
     * 요청 메서드, URL, 파라미터를 조합하여 고유한 캐시 키를 생성합니다.
     * 동일한 요청에 대해 캐시된 응답을 재사용할 수 있습니다.
     */
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

/**
 * 응답 인터셉터
 *
 * 수행하는 작업:
 * - 성능 모니터링 (응답 시간 측정)
 * - GET 요청 결과 캐싱
 * - 응답 로깅
 * - 401 오류 시 토큰 갱신 시도
 */
Axios.interceptors.response.use(
  (response) => {
    const endTime = Date.now();
    const duration =
      endTime -
      ((response.config as ExtendedAxiosRequestConfig).metadata?.startTime ||
        endTime);

    /**
     * API 호출 성능 추적
     *
     * 응답 시간을 측정하여 성능 모니터링 시스템에 전송합니다.
     */
    trackApiCall(
      response.config.url || '',
      response.config.method || '',
      duration,
      response.status
    );

    /**
     * GET 요청 결과를 캐시에 저장
     *
     * 성공적인 GET 요청의 결과를 5분간 캐시하여
     * 동일한 요청에 대해 네트워크 요청을 줄입니다.
     */
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

    /**
     * 에러가 발생한 API 호출도 성능 추적
     *
     * 실패한 요청도 성능 데이터로 수집하여 시스템 개선에 활용합니다.
     */
    if (originalRequest?.url) {
      trackApiCall(
        originalRequest.url,
        originalRequest.method || '',
        duration,
        error.response?.status || 0
      );
    }

    /**
     * 재시도 가능한 오류인지 확인
     *
     * 네트워크 오류나 일시적인 서버 오류의 경우 자동 재시도를 수행합니다.
     */
    if (shouldRetry(error, originalRequest)) {
      return retryRequest(originalRequest);
    }

    /**
     * 401 인증 오류 처리 - 토큰 자동 갱신
     *
     * 토큰이 만료된 경우 refresh token을 사용하여 자동으로 토큰을 갱신합니다.
     * 갱신에 성공하면 원래 요청을 재시도합니다.
     */
    if (
      error.response?.status === 401 &&
      !(originalRequest as ExtendedAxiosRequestConfig)._retry
    ) {
      (originalRequest as ExtendedAxiosRequestConfig)._retry = true;

      try {
        /**
         * 저장된 refresh token 가져오기
         *
         * 로컬 스토리지에서 refresh token을 가져와 새로운 access token을 요청합니다.
         */
        const LOCAL_REFRESH_TOKEN = localStorage.getItem('refreshToken');
        const COOKIE_REFRESH_TOKEN = Cookies.get('refreshToken');
        const REFRESH_TOKEN = LOCAL_REFRESH_TOKEN || COOKIE_REFRESH_TOKEN;

        if (!REFRESH_TOKEN) {
          // refresh token이 없으면 로그인 페이지로 이동
          clearAllTokens();
          redirectToLogin();
          return Promise.reject(error);
        }

        // 토큰 갱신 API 호출
        const { data } = await axios.post(
          'https://api.stylewh.com/auth/refresh',
          { refreshToken: REFRESH_TOKEN },
          { withCredentials: true }
        );

        // 새 토큰 저장
        saveTokens(data.accessToken, data.refreshToken);

        // 원래 요청을 새 토큰으로 재시도
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return Axios(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그인 페이지로 이동
        clearAllTokens();
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    console.error(
      `❌ API 오류: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} (${duration}ms)`,
      error
    );
    return Promise.reject(error);
  }
);

/**
 * 재시도 가능한 오류인지 판단
 *
 * 재시도 조건:
 * - 최대 재시도 횟수 미만
 * - 특정 HTTP 상태 코드 (408, 429, 500, 502, 503, 504)
 * - 네트워크 연결 오류 (ECONNABORTED, NETWORK_ERROR)
 */
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

/**
 * API 요청 재시도
 *
 * 지수 백오프 전략 사용:
 * - 1차 재시도: 1초 후
 * - 2차 재시도: 2초 후
 * - 3차 재시도: 4초 후
 */
async function retryRequest(config: unknown): Promise<unknown> {
  const retryCount =
    ((config as ExtendedAxiosRequestConfig)._retryCount || 0) + 1;
  (config as ExtendedAxiosRequestConfig)._retryCount = retryCount;

  const delay = retryConfig.retryDelay * Math.pow(2, retryCount - 1);

  console.log(
    `🔄 재시도 ${retryCount}/${retryConfig.maxRetries} (${delay}ms 후): ${(config as ExtendedAxiosRequestConfig).method?.toUpperCase()} ${(config as ExtendedAxiosRequestConfig).url}`
  );

  await new Promise((resolve) => setTimeout(resolve, delay));

  return Axios(config as ExtendedAxiosRequestConfig);
}

/**
 * 토큰 관리 함수들
 */

/**
 * 모든 인증 토큰 제거
 * 로그아웃 시 호출
 */
function clearAllTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
}

/**
 * 새 토큰 저장
 *
 * @param accessToken - 액세스 토큰
 * @param refreshToken - 리프레시 토큰 (선택사항)
 */
function saveTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem('accessToken', accessToken);
  Cookies.set('accessToken', accessToken, { secure: true });

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
    Cookies.set('refreshToken', refreshToken, { secure: true });
  }
}

/**
 * 로그인 페이지로 리다이렉트
 * 커스텀 이벤트를 통해 앱 내에서 처리
 */
function redirectToLogin(): void {
  const event = new CustomEvent('forceLoginRedirect');
  window.dispatchEvent(event);
}

/**
 * 캐시 관리 함수들
 */

/**
 * API 캐시 정리
 *
 * @param pattern - 특정 패턴과 일치하는 캐시만 삭제 (선택사항)
 */
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

/**
 * 캐시 통계 반환
 *
 * @returns 캐시 크기와 키 목록
 */
export const getCacheStats = (): { size: number; keys: string[] } => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
};
