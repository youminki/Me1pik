// src/api/brand/brand.ts

import { Axios } from 'src/api/Axios';

/**
 * 관리자용 브랜드 정보 (목록) 타입
 * GET /brand/admin/list
 */
export interface AdminBrand {
  id: number;
  groupName: string;
  brandName: string;
  contactPerson: string;
  contactNumber: string;
  imageUrl: string;
  isPopular: boolean;
  isActive: boolean;
  discount_rate: number;
  brand_category: string;
  createdAt: string;
  // 목록에는 productCount가 없으므로 제외
}

/**
 * 관리자용 브랜드 상세 정보 타입
 * GET /brand/admin/{id}
 */
export interface AdminBrandDetail {
  id: number;
  groupName: string;
  brandName: string;
  contactPerson: string;
  contactNumber: string;
  imageUrl: string;
  isPopular: boolean;
  isActive: boolean;
  discount_rate: number;
  brand_category: string;
  productCount: number;
  createdAt: string;
  // 필요하다면 추가 필드: 예: updatedAt 등
}

/**
 * 관리자용 전체 브랜드 목록 조회
 * GET /brand/admin/list
 */
export const getAdminBrandList = async (): Promise<AdminBrand[]> => {
  const response = await Axios.get<AdminBrand[]>('/brand/admin/list');
  return response.data;
};

/**
 * 관리자용 브랜드 상세 정보 조회
 * GET /brand/admin/{id}
 */
export const getAdminBrandDetail = async (id: number): Promise<AdminBrandDetail> => {
  const response = await Axios.get<AdminBrandDetail>(`/brand/admin/${id}`);
  return response.data;
};

/**
 * 관리자용 브랜드 등록 요청 타입
 * POST /brand/admin
 * (등록 API 스펙이 주어지지 않았으므로, 백엔드 문서에 맞춰 필드를 확인 후 사용하세요)
 */
export interface CreateAdminBrandRequest {
  groupName: string;
  brandName: string;
  contactPerson: string;
  contactNumber: string;
  imageUrl: string;
  isPopular: boolean;
  isActive: boolean;
  discount_rate: number;
  brand_category: string;
  // 상세에 productCount, createdAt는 서버에서 채워주는 경우가 일반적이므로 요청에는 제외
  // 기타 요청 필드가 있다면 여기에 추가
}

/**
 * 관리자용 브랜드 등록
 * POST /brand/admin
 */
export const createAdminBrand = async (
  body: CreateAdminBrandRequest,
): Promise<AdminBrandDetail> => {
  const response = await Axios.post<AdminBrandDetail>('/brand/admin', body);
  return response.data;
};

/**
 * 관리자용 브랜드 수정 요청 타입
 * PATCH /brand/admin/{id}
 */
export interface UpdateAdminBrandRequest {
  groupName?: string;
  brandName?: string;
  contactPerson?: string;
  contactNumber?: string;
  imageUrl?: string;
  isPopular?: boolean;
  isActive?: boolean;
  discount_rate?: number;
  brand_category?: string;
  // productCount는 보통 서버에서 관리; 수정 API 스펙에 포함되는지 확인 후 추가
  // 기타 수정 가능한 필드가 있다면 여기에 추가
}

/**
 * 관리자용 브랜드 정보 수정
 * PATCH /brand/admin/{id}
 */
export const updateAdminBrand = async (
  id: number,
  body: UpdateAdminBrandRequest,
): Promise<AdminBrandDetail> => {
  const response = await Axios.patch<AdminBrandDetail>(`/brand/admin/${id}`, body);
  return response.data;
};

/**
 * 브랜드 삭제 (관리자)
 * DELETE /brand/admin/{id}
 * (기존 deleteBrand 경로가 /brand/{id}였으나, 관리자용 삭제가 /brand/admin/{id}라면 수정 필요)
 */
export const deleteAdminBrand = async (id: number): Promise<void> => {
  await Axios.delete(`/brand/${id}`);
};

/**
 * 관리자용 select 박스 옵션 타입
 * GET /brand/admin/select-options
 * (스펙이 주어졌다면 유지)
 */
export interface AdminBrandSelectOptions {
  discountRates: string[];
  statusOptions: string[];
}

/**
 * 관리자용 select 박스 옵션 조회
 * GET /brand/admin/select-options
 */
export const getAdminBrandSelectOptions = async (): Promise<AdminBrandSelectOptions> => {
  const response = await Axios.get<AdminBrandSelectOptions>('/brand/admin/select-options');
  return response.data;
};

export default {
  getAdminBrandList,
  getAdminBrandDetail,
  createAdminBrand,
  updateAdminBrand,
  deleteAdminBrand,
  getAdminBrandSelectOptions,
};
