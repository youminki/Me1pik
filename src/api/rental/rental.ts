import { Axios } from '../Axios';
import { useMutation } from '@tanstack/react-query';

// --- Types ---
/**
 * 개별 렌탈 아이템 정보
 */
export interface RentalItem {
  productId: number;
  sizeLabel: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  quantity: number;
}

/**
 * 배송 정보
 */
export interface ShippingInfo {
  address: string;
  detailAddress: string;
  phone: string;
  receiver: string;
  deliveryMethod: string;
  message?: string;
}

/**
 * 반납 정보
 */
export interface ReturnInfo {
  address: string;
  detailAddress: string;
  phone: string;
}

/**
 * 렌탈 주문 요청 바디
 */
export interface RentalOrderRequest {
  ticketId: number;
  items: RentalItem[];
  shipping: ShippingInfo;
  return: ReturnInfo;
}

/**
 * 렌탈 주문 응답 (예시 구조)
 */
export interface RentalOrderResponse {
  orderId: number;
  status: string;
  createdAt: string;
  // 추가 필드가 있으면 여기에 정의
}

/**
 * 1. 이용권으로 렌탈 결제 및 등록
 * POST /rental-schedule/order
 */
export const createRentalOrder = (
  body: RentalOrderRequest
): Promise<RentalOrderResponse> => {
  return Axios.post<RentalOrderResponse>('/rental-schedule/order', body).then(
    (res) => res.data
  );
};

/**
 * 렌탈 주문을 react-query useMutation으로 처리하는 커스텀 훅
 */
export function useCreateRentalOrder() {
  return useMutation<RentalOrderResponse, unknown, RentalOrderRequest>({
    mutationFn: createRentalOrder,
  });
}
