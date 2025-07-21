import axios from 'axios';
import Cookies from 'js-cookie';

import { getCurrentToken } from '@/utils/auth';

export const Axios = axios.create({
  baseURL: 'https://api.stylewh.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 요청 인터셉터: 매 요청마다 최신 토큰을 헤더에 추가
Axios.interceptors.request.use(
  (config) => {
    const token = getCurrentToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 오류 시 토큰 갱신 시도 (무신사 스타일)
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // sessionStorage도 확인
        const LOCAL_REFRESH_TOKEN = localStorage.getItem('refreshToken');
        const SESSION_REFRESH_TOKEN = sessionStorage.getItem('refreshToken');
        const COOKIE_REFRESH_TOKEN = Cookies.get('refreshToken');
        const REFRESH_TOKEN =
          LOCAL_REFRESH_TOKEN || SESSION_REFRESH_TOKEN || COOKIE_REFRESH_TOKEN;

        if (!REFRESH_TOKEN) {
          console.log('리프레시 토큰이 없어 로그인 페이지로 이동');
          // 모든 토큰 제거
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');

          // 로그인 페이지로 이동 (SPA 방식)
          const event = new CustomEvent('forceLoginRedirect');
          window.dispatchEvent(event);
          return Promise.reject(error);
        }

        // 토큰 갱신 시도
        const { data } = await axios.post(
          'https://api.stylewh.com/auth/refresh',
          { refreshToken: REFRESH_TOKEN },
          { withCredentials: true }
        );

        // 새 토큰 저장 (localStorage와 sessionStorage 모두에)
        localStorage.setItem('accessToken', data.accessToken);
        sessionStorage.setItem('accessToken', data.accessToken);
        Cookies.set('accessToken', data.accessToken, { secure: true });

        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
          sessionStorage.setItem('refreshToken', data.refreshToken);
          Cookies.set('refreshToken', data.refreshToken, { secure: true });
        }

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return Axios(originalRequest);
      } catch {
        console.log('토큰 갱신 실패, 로그인 페이지로 이동');
        // 모든 토큰 제거
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');

        // 로그인 페이지로 이동 (SPA 방식)
        const event = new CustomEvent('forceLoginRedirect');
        window.dispatchEvent(event);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
