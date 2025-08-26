import axios, { AxiosRequestConfig } from 'axios';

import {
  getCurrentToken,
  getRefreshToken,
  saveTokens,
  clearAllTokensAndIntervals,
} from '@/utils/auth';
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

// 🔧 인터셉터 없는 전용 axios 인스턴스 (순환 리프레시 방지)
const rawAxios = axios.create({
  baseURL: 'https://api.stylewh.com',
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export const Axios = axios.create({
  baseURL: 'https://api.stylewh.com',
  withCredentials: false, // CORS 제약 줄이기 - 인증은 헤더로, 리프레시는 바디로
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

    // 🔧 헤더 안전 할당
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 요청 ID 생성 (디버깅용)
    (config as ExtendedAxiosRequestConfig).metadata = {
      requestId: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      startTime: Date.now(),
    };

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
      // 🎯 이 플래그들은 현재 설정되지 않아 사용되지 않음
      // 필요시 나중에 구현하여 401 폭주 방지 로직 추가 가능
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
          if (!originalRequest.headers) originalRequest.headers = {};
          const oh = originalRequest.headers as Record<string, string>;
          oh.Authorization = `Bearer ${currentToken}`;
        }
        return Axios(originalRequest); // 토큰 갱신 후 재시도
      }

      // 이미 재시도 중인 경우 무한 루프 방지
      if ((originalRequest as ExtendedAxiosRequestConfig)._retry) {
        console.log('🔄 이미 토큰 갱신을 시도했으므로 로그아웃 처리');
        clearAllTokensAndIntervals();
        redirectToLogin();
        return Promise.reject(error);
      }

      // 재시도 플래그 설정
      (originalRequest as ExtendedAxiosRequestConfig)._retry = true;

      try {
        // 🎯 통일된 유틸 사용으로 iOS/웹 일관성 유지
        const REFRESH_TOKEN = getRefreshToken();

        if (!REFRESH_TOKEN) {
          console.log('❌ 리프레시 토큰이 없어서 로그아웃 처리');
          clearAllTokensAndIntervals();
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

        // 🎯 토큰 갱신 시도 (인터셉터 없는 rawAxios 사용)
        const { data } = await rawAxios.post('/auth/refresh', {
          refreshToken: REFRESH_TOKEN,
        });

        console.log('✅ Axios 인터셉터: 토큰 갱신 성공');

        // 새 토큰 저장 및 타이머 재설치 - 방어적 처리
        const { accessToken, refreshToken: newRefreshToken } = data;
        saveTokens(accessToken, newRefreshToken ?? undefined); // newRefreshToken 없으면 기존 유지
        // 🎯 saveTokens에서 자동으로 타이머 설정되므로 중복 호출 제거

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
        if (!originalRequest.headers) originalRequest.headers = {};
        const oh = originalRequest.headers as Record<string, string>;
        oh.Authorization = `Bearer ${data.accessToken}`;
        console.log('🔄 원래 요청 재시도:', originalRequest.url);
        return Axios(originalRequest);
      } catch (refreshError) {
        console.error('❌ Axios 인터셉터: 토큰 갱신 실패', refreshError);

        // 🎯 대기중인 요청도 모두 해제(실패라도 깨워서 에러를 전파)
        waiters.forEach((w) => w());
        waiters = [];

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
        clearAllTokensAndIntervals();
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

// 토큰 관리 함수들
function redirectToLogin(): void {
  const event = new CustomEvent('forceLoginRedirect');
  window.dispatchEvent(event);
}
