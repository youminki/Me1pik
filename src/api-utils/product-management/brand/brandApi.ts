// src/api/brand/brandApi.ts

import { Axios } from '../../Axios';
import { useQuery } from '@tanstack/react-query';

/**
 * 브랜드 정보 타입 (API 응답에 포함되는 모든 필드 반영)
 */
export interface Brand {
  id: number;
  brandName: string;
  groupName: string;

  // 추가 필드
  brand_category: string; // "컨템포러리" 등
  contactPerson: string; // 담당자 명, 빈 문자열일 수 있음
  contactNumber: string | null; // 연락처, null일 수 있음
  createdAt: string; // ISO 문자열
  discount_rate: number; // 할인율
  isActive: boolean; // 활성 여부
  location: string | null; // 위치 정보, null일 수 있음
  productCount: number; // 상품 개수
  status: string; // "등록대기" 등
}

/**
 * 브랜드 통계 정보 타입
 */
export interface BrandStats {
  brandCount: number;
  productCount: number;
}

/**
 * GET 메인 페이지용 전체 브랜드 리스트
 * GET /brand/list
 */
export const getBrandList = async (): Promise<Brand[]> => {
  const response = await Axios.get<Brand[]>('/brand/list');
  return response.data;
};

/**
 * 브랜드 통계 정보 계산
 */
export const getBrandStats = async (): Promise<BrandStats> => {
  const brands = await getBrandList();
  const brandCount = brands.length;
  const productCount = brands.reduce(
    (sum, brand) => sum + (brand.productCount || 0),
    0
  );
  return { brandCount, productCount };
};

/**
 * 브랜드 리스트를 react-query로 가져오는 커스텀 훅
 */
export function useBrandList() {
  return useQuery<Brand[]>({
    queryKey: ['brandList'],
    queryFn: getBrandList,
    staleTime: 1000 * 60 * 10, // 10분 캐싱
  });
}

/**
 * 브랜드 통계 정보를 react-query로 가져오는 커스텀 훅
 */
export function useBrandStats() {
  return useQuery<BrandStats>({
    queryKey: ['brandStats'],
    queryFn: getBrandStats,
    staleTime: 1000 * 60 * 10, // 10분 캐싱
  });
}

export default {
  getBrandList,
  getBrandStats,
  useBrandList,
  useBrandStats,
};
