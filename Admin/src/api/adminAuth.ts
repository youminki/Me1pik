// src/api/adminAuth.ts
import { Axios } from 'src/api/Axios';

export interface AdminLoginRequest {
  id: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * 관리자 로그인 API
 * POST /admin/auth/login
 */
export const adminLogin = async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
  const response = await Axios.post('/admin/auth/login', credentials);
  return response.data;
};

export interface AdminRefreshResponse {
  accessToken: string;
}

/**
 * 액세스 토큰 갱신 API
 * POST /admin/auth/refresh
 */
export const adminRefresh = async (refreshToken: string): Promise<AdminRefreshResponse> => {
  const response = await Axios.post('/admin/auth/refresh', { refreshToken });
  return response.data;
};
