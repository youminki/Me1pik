// src/api/adminAuth.ts
import { Axios } from 'src/api/Axios';
import { saveTokens } from 'src/utils/auth';

export interface AdminLoginRequest {
  id: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  team?: string;
  lastLogin?: string;
  createdAt?: string;
}

/**
 * 관리자 로그인 API
 * POST /admin/auth/login
 */
export const adminLogin = async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
  const response = await Axios.post('/admin/auth/login', credentials);

  // 로그인 성공 시 토큰 저장
  const { accessToken, refreshToken } = response.data;
  saveTokens(accessToken, refreshToken);

  return response.data;
};

export interface AdminRefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

/**
 * 액세스 토큰 갱신 API
 * POST /admin/auth/refresh
 */
export const adminRefresh = async (refreshToken: string): Promise<AdminRefreshResponse> => {
  const response = await Axios.post('/admin/auth/refresh', { refreshToken });

  // 갱신 성공 시 새 토큰 저장
  const { accessToken, refreshToken: newRefreshToken } = response.data;
  saveTokens(accessToken, newRefreshToken);

  return response.data;
};

/**
 * 현재 로그인한 관리자 프로필 정보 조회 API
 * GET /admin/auth/profile
 */
export const getAdminProfile = async (): Promise<AdminProfile> => {
  const response = await Axios.get('/admin/auth/profile');
  return response.data;
};
