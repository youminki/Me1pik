import axios from 'axios';
import Cookies from 'js-cookie';

export const Axios = axios.create({
  baseURL: 'https://api.stylewh.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const accessToken = Cookies.get('accessToken');
if (accessToken) {
  Axios.defaults.headers.Authorization = `Bearer ${accessToken}`;
}

Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) throw new Error('No refresh token.');

        const { data } = await axios.post(
          'https://api.stylewh.com/auth/refresh',
          { refreshToken }
        );
        Cookies.set('accessToken', data.accessToken, { secure: true });
        Axios.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return Axios(originalRequest);
      } catch {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
