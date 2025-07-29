// src/api/admin.ts
import { Axios } from 'src/api/Axios';

/**
 * 관리자 생성 요청 데이터 인터페이스
 */
export interface AdminCreateRequest {
  id: string;
  name: string;
  password: string;
  email: string;
  role: string;
  status: string;
}

/**
 * 관리자 응답 인터페이스
 */
export interface AdminResponse {
  no: number;
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  // GET /admin 응답의 경우 signupDate도 있을 수 있음
  signupDate?: string;
}

/**
 * 관리자 목록 조회 응답 인터페이스
 */
export interface GetAdminsResponse {
  admins: AdminResponse[];
  total: number;
}

/**
 * 관리자 업데이트 요청 데이터 인터페이스
 */
export interface AdminUpdateRequest {
  name: string;
  email: string;
  role: string;
  status: string;
}

/**
 * 관리자 삭제 응답 인터페이스
 */
export interface DeleteAdminResponse {
  message: string;
}

/**
 * 전체 관리자 수 조회 응답 인터페이스
 */
export interface GetAdminCountResponse {
  total: number;
}

/**
 * 새 관리자를 생성합니다.
 * POST /admin
 */
export const createAdmin = async (data: AdminCreateRequest): Promise<AdminResponse> => {
  const response = await Axios.post('/admin', data);
  return response.data;
};

/**
 * 모든 관리자를 조회합니다. (페이지당 최대 10명)
 * GET /admin
 */
export const getAllAdmins = async (limit = 10, page = 1): Promise<GetAdminsResponse> => {
  const response = await Axios.get('/admin', { params: { limit, page } });
  return response.data;
};

/**
 * active 상태인 관리자를 조회합니다. (페이지당 최대 10명)
 * GET /admin/active
 */
export const getActiveAdmins = async (limit = 10, page = 1): Promise<GetAdminsResponse> => {
  const response = await Axios.get('/admin/active', {
    params: { limit, page },
  });
  return response.data;
};

/**
 * 차단된 관리자를 조회합니다. (페이지당 최대 10명)
 * GET /admin/blocked
 */
export const getBlockedAdmins = async (limit = 10, page = 1): Promise<GetAdminsResponse> => {
  const response = await Axios.get('/admin/blocked', {
    params: { limit, page },
  });
  return response.data;
};

/**
 * 특정 관리자의 정보를 업데이트합니다.
 * PUT /admin/{id}
 */
export const updateAdmin = async (id: string, data: AdminUpdateRequest): Promise<AdminResponse> => {
  const response = await Axios.put(`/admin/${id}`, data);
  return response.data;
};

/**
 * 특정 관리자를 삭제합니다.
 * DELETE /admin/{id}
 */
export const deleteAdmin = async (id: string): Promise<DeleteAdminResponse> => {
  const response = await Axios.delete(`/admin/${id}`);
  return response.data;
};

/**
 * 특정 관리자 정보를 조회합니다.
 * GET /admin/{id}
 */
export const getAdminById = async (id: string): Promise<AdminResponse> => {
  const response = await Axios.get(`/admin/${id}`);
  return response.data;
};

/**
 * 전체 관리자 수를 조회합니다.
 * GET /admin/count
 */
export const getAdminCount = async (): Promise<GetAdminCountResponse> => {
  const response = await Axios.get('/admin/count');
  return response.data;
};
