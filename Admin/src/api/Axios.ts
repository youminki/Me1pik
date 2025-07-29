// src/api/Axios.ts
import axios from 'axios';
import Cookies from 'js-cookie';

export const Axios = axios.create({
  baseURL: 'https://api.stylewh.com',
  withCredentials: true, // 쿠키 포함 (세션 관리 가능)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 🔄 Axios 응답 인터셉터: 401 에러 시 자동 토큰 갱신
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized 발생 시 리프레시 토큰으로 재발급 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available.');

        console.log('🔄 리프레시 토큰으로 새 액세스 토큰 요청 중...');
        // 명세서에 맞게 /admin/auth/refresh 엔드포인트 호출
        const { data } = await axios.post('https://api.stylewh.com/admin/auth/refresh', {
          refreshToken,
        });

        console.log('✅ 액세스 토큰 갱신 성공:', data);
        Cookies.set('accessToken', data.accessToken, { secure: true });
        Axios.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return Axios(originalRequest);
      } catch (refreshError) {
        console.error('❌ 리프레시 토큰 만료 - 로그아웃 처리', refreshError);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login'; // 강제 로그아웃 처리
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
