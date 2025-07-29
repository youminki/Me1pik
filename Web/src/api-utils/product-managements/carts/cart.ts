import { Axios } from '@/api-utils/Axios';

// --- Types ---
/**
 * Cart에 추가할 아이템 정보
 */
export interface CartItemRequest {
  productId: number;
  serviceType: 'rental' | 'purchase';
  rentalStartDate?: string; // YYYY-MM-DD
  rentalEndDate?: string; // YYYY-MM-DD
  size: string;
  color: string;
  quantity: number;
  totalPrice: number;
}

/**
 * Cart에서 반환되는 아이템 정보
 */
export interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    brand: string;
    category: string;
    thumbnail: string;
  };
  serviceType: 'rental' | 'purchase';
  rentalStartDate?: string; // ISO 8601
  rentalEndDate?: string; // ISO 8601
  size: string;
  color: string;
  quantity: number;
  totalPrice: number;
  isSelected: boolean;
  createdAt: string; // ISO 8601
}

/**
 * Cart에서 간단히 사용하는 응답 타입
 */
export interface CartItemListResponse {
  id: number;
  name: string;
  productId: number;
  product_num: string;
  productName: string;
  productThumbnail: string;
  productBrand: string;
  productCategory: string;
  serviceType: 'rental' | 'purchase';
  rentalStartDate?: string; // ISO 8601
  rentalEndDate?: string; // ISO 8601
  size: string;
  color: string;
  quantity: number;
  totalPrice: number;
  isSelected: boolean;
  createdAt: string; // ISO 8601
}

/**
 * Cart 아이템 수정 요청 정보
 */
export interface CartItemUpdateRequest {
  serviceType: 'rental' | 'purchase';
  rentalStartDate?: string; // YYYY-MM-DD
  rentalEndDate?: string; // YYYY-MM-DD
  size: string;
  color: string;
  quantity: number;
  isSelected?: boolean;
}

// --- API Calls ---
/**
 * 장바구니에 아이템 추가
 * POST /cart
 */
export const addCartItem = async (item: CartItemRequest): Promise<CartItem> => {
  const response = await Axios.post<CartItem>('/cart', item);
  return response.data;
};

/**
 * 장바구니 목록 조회
 * GET /cart
 */
export const getCartItems = async (): Promise<CartItemListResponse[]> => {
  const response = await Axios.get<CartItemListResponse[]>('/cart');
  return response.data;
};

/**
 * 장바구니 아이템 삭제
 * DELETE /cart/{id}
 */
export const deleteCartItem = async (cartItemId: number): Promise<void> => {
  await Axios.delete(`/cart/${cartItemId}`);
};

/**
 * 장바구니 아이템 수정
 * PATCH /cart/{id}
 */
export const updateCartItem = async (
  cartItemId: number,
  updateData: CartItemUpdateRequest
): Promise<CartItemListResponse> => {
  const response = await Axios.patch<CartItemListResponse>(
    `/cart/${cartItemId}`,
    updateData
  );
  return response.data;
};
