// src/api/rentalScheduleApi.ts
import { Axios } from '../../Axios';

export interface RentalScheduleItem {
  id: number; // 예약 ID
  productId: number;
  brand: string;
  productNum: string;
  category: string;
  serviceType: '대여' | '구매';
  size: string;
  color: string;
  mainImage: string;
  ticketName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  paymentStatus: '결제완료' | '취소요청' | '취소완료'; // 추가
}

export interface RentalScheduleResponse {
  rentals: RentalScheduleItem[];
}

/**
 * 로그인한 유저의 대여/구매 내역을 조회합니다.
 * GET /rental-schedule/my
 */
export const getMyRentalSchedule =
  async (): Promise<RentalScheduleResponse> => {
    const response = await Axios.get<RentalScheduleResponse>(
      '/rental-schedule/my'
    );
    return response.data;
  };

/**
 * 로그인한 유저가 본인의 대여 건에 대해 취소 요청을 합니다.
 * PATCH /rental-schedule/cancel-request/{id}
 */
export interface CancelRequestResponse {
  id: number;
  paymentStatus: '취소요청' | '취소완료'; // 백엔드가 반환하는 상태
}

export const cancelRentalSchedule = async (
  id: number
): Promise<CancelRequestResponse> => {
  const response = await Axios.patch<CancelRequestResponse>(
    `/rental-schedule/cancel-request/${id}`
  );
  return response.data;
};
