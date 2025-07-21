// src/api/product.ts

import { Axios } from '@/api-utils/Axios';

/**
 * 특정 브랜드의 제품 정보 타입
 * API 응답 형태에 따라 필드를 추가/수정하세요.
 */
export interface Product {
  id: number;
  name: string;
  brandId: number;
  category: string;
  description?: string;
  price?: number;
  discount?: number;
  image?: string;
}

/**
 * 특정 브랜드의 제품 목록 조회
 * GET /admin/product/brand/{brandId}
 *
 * @param brandId - 조회할 브랜드 ID (path parameter)
 * @param category - 카테고리로 필터링 (optional, query parameter)
 * @returns Promise<Product[]>
 */
export const getProductsByBrand = async (
  brandId: number,
  category?: string
): Promise<Product[]> => {
  const params: Record<string, string> = {};
  if (category) {
    params.category = category;
  }
  const response = await Axios.get<Product[]>(
    `/admin/product/brand/${brandId}`,
    { params }
  );
  return response.data;
};

export default {
  getProductsByBrand,
};
