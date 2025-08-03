// src/api/brand/brandApi.ts

import { useQuery } from '@tanstack/react-query';

import { Axios } from '@/api-utils/Axios';

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
  try {
    const response = await Axios.get<Brand[]>('/brand/list');
    return response.data;
  } catch (error) {
    console.error('브랜드 리스트 조회 실패:', error);
    // 401 에러는 Axios 인터셉터에서 처리됨
    throw error;
  }
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
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 재요청 방지
    retry: (failureCount, error: unknown) => {
      // 401 에러 시 재시도하지 않음 (로그인 모달이 표시됨)
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status === 401) {
        return false;
      }
      // 다른 에러는 최대 3번 재시도
      return failureCount < 3;
    },
    retryDelay: 1000, // 1초 후 재시도
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
