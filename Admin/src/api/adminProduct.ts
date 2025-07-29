import { Axios } from 'src/api/Axios';

export interface SizeRow {
  size: string;
  measurements: Record<string, number>;
}

export interface ProductListParams {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
}

export interface ProductItem {
  no: number;
  styleCode: string;
  brand: string;
  category: string;
  color: string;
  size: string;
  retailPrice: number; // 리테일가
  registerDate: string;
  status: string;
}

export interface ProductListResponse {
  items: ProductItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface ProductDetailResponse {
  id: number;
  name: string;
  product_num: string;
  brand: string;
  category: string;
  color: string;
  retailPrice: number; // 리테일가
  sale_price?: number; // 판매가
  rental_price?: number; // 대여가
  registration: number;
  registration_date: string;
  product_url: string;
  product_img: string[];
  size_picture: string;
  season: string;
  manufacturer: string | null;
  description: string;
  fabricComposition: {
    겉감?: string;
    안감?: string;
    배색?: string;
    부속?: string;
  };
  elasticity: string;
  transparency: string;
  thickness: string;
  lining: string;
  touch: string;
  fit: string;
  sizes: SizeRow[];
  // 명세에 따라 선택적 필드 추가
  sizeTableJson?: Record<string, Record<string, number>>;
  size_label_guide?: Record<string, string>;
}

// PATCH 시 price / sale_price / rental_price 부분도 업데이트 가능
export type UpdateProductRequest = Partial<
  Omit<ProductDetailResponse, 'price' | 'sale_price' | 'rental_price'>
> & {
  retailPrice?: number;
  sale_price?: number;
  rental_price?: number;
  sizeTableJson?: Record<string, Record<string, number>>;
  size_label_guide?: Record<string, string>;
};

/** 제품 목록 조회 */
export const getProducts = async (params?: ProductListParams): Promise<ProductListResponse> => {
  const response = await Axios.get('/admin/products-management/list', {
    params,
  });
  return response.data;
};

/** 제품 상세 조회 */
export const getProductDetail = async (id: number): Promise<ProductDetailResponse> => {
  const response = await Axios.get(`/admin/products-management/${id}`);
  return response.data;
};

/** 제품 수정 */
export const updateProduct = async (
  id: number,
  updateData: UpdateProductRequest,
): Promise<ProductDetailResponse> => {
  const response = await Axios.patch(`/admin/products-management/${id}`, updateData);
  return response.data;
};

/** 신규 제품 등록 */
export const createProduct = async (
  productData: Partial<
    Pick<ProductDetailResponse, 'fabricComposition' | 'retailPrice' | 'sale_price' | 'rental_price'>
  >,
): Promise<ProductDetailResponse> => {
  const response = await Axios.post('/admin/products-management', productData);
  return response.data;
};

/**
 * 제품 등록 상태 일괄 수정 (관리자 전용)
 * PATCH /admin/products-management/status/cn
 */
export interface BulkUpdateStatusRequest {
  ids: number[];
  registration: number;
}

export const updateProductsStatus = async (payload: BulkUpdateStatusRequest): Promise<void> => {
  const response = await Axios.patch('/admin/products-management/status/cn', payload);
  return response.data;
};

export default {
  getProducts,
  getProductDetail,
  updateProduct,
  createProduct,
  updateProductsStatus,
};
