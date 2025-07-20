// src/api/schedule/schedule.ts
import { Axios } from '../../Axios';

// 예약 스케줄 생성 요청 타입
export interface RentalScheduleCreateRequest {
  productId: number;
  sizeLabel: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  quantity: number;
}

// 예약 스케줄 응답 타입
export interface RentalScheduleResponse {
  product_id: number;
  product_size_stock_id: number;
  start_date: string;
  end_date: string;
  quantity: number;
  id: number;
  createdAt: string;
}

// 서버가 반환하는 비활성 날짜 범위 타입
interface UnavailableEntry {
  sizeLabel: string;
  unavailableRanges: [string, string][];
}

// GET 파라미터 타입
export interface UnavailableParams {
  productId: number;
  sizeLabel: string;
}

/**
 * GET /rental-schedule/{productId}
 * 서버로부터 해당 상품의 사이즈별 예약 불가 날짜 범위를 가져옵니다.
 */
export const getUnavailableDates = async (
  params: UnavailableParams
): Promise<[string, string][]> => {
  const resp = await Axios.get<UnavailableEntry[]>(
    `/rental-schedule/${params.productId}`
  );
  const list = Array.isArray(resp.data) ? resp.data : [];
  const entry = list.find(
    (e: { sizeLabel: string; unavailableRanges: string[][] }) =>
      e.sizeLabel === params.sizeLabel
  );
  return entry ? entry.unavailableRanges : [];
};

/**
 * POST /rental-schedule
 * 새로운 예약 일정을 생성합니다.
 */
export const createRentalSchedule = async (
  data: RentalScheduleCreateRequest
): Promise<RentalScheduleResponse> => {
  const response = await Axios.post<RentalScheduleResponse>(
    '/rental-schedule',
    data
  );
  return response.data;
};
