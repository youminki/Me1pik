import { Axios } from '../Axios'; // Axios 인스턴스: 기본 URL, 인터셉터 등이 설정된 인스턴스라고 가정
import { useQuery } from '@tanstack/react-query';

// 요청 바디 타입: 판매 스케줄 생성
export interface CreateSaleScheduleRequest {
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  saleType: '제품판매' | '제품 대여' | '제품대여' | '제품판매' | string;
  productIds: number[];
}

// 생성 응답 타입
export interface SaleScheduleProductSummary {
  id: number;
  name: string;
}

export interface CreateSaleScheduleResponse {
  id: number;
  title: string; // 예: "2025-06"
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  saleType: string; // 예: "제품 대여"
  status: string; // 예: "scheduled"
  products: SaleScheduleProductSummary[];
}

// 요약 리스트 조회 응답 타입
export interface SaleScheduleSummaryItem {
  id: number; // 스케줄 ID 추가
  title: string; // 예: "2025-06"
  dateRange: string; // 예: "2025-06-01 ~ 2025-06-30"
  status: string; // 예: "scheduled" 등
  productCount: number; // 선택된 상품 수
}

// blocked dates 조회 응답 타입
export interface BlockedDatesResponse {
  progressTime: number;
  blockedDates: Array<[string, string]>; // 예: [ ["2025-06-01", "2025-06-10"], ... ]
}

// 특정 스케줄 상세 조회 응답 타입
export interface SaleScheduleDetailProduct {
  id: number;
  name: string;
  brandName: string;
  imageUrl: string;
}

export interface SaleScheduleDetailResponse {
  id?: number; // 상세 응답에 ID가 필요하면 추가
  title: string; // 예: "2025-06"
  dateRange: string; // 예: "2025-06-01 ~ 2025-06-30"
  status: string; // 예: "scheduled"
  productCount: number;
  products: SaleScheduleDetailProduct[];
}

// 삭제 응답 타입
export interface DeleteSaleScheduleResponse {
  message: string; // 예: "스케줄이 삭제되었습니다."
}

// 수정 요청 바디 타입: 스케줄 타이틀 및 날짜 수정
export interface PatchSaleScheduleRequest {
  title?: string;
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
}

// API 호출 함수들

/**
 * 판매 스케줄 생성
 * POST /sale_schedule
 */
export async function createSaleSchedule(
  data: CreateSaleScheduleRequest
): Promise<CreateSaleScheduleResponse> {
  const response = await Axios.post<CreateSaleScheduleResponse>(
    '/sale_schedule',
    data
  );
  return response.data;
}

/**
 * 본인 스케줄 요약 리스트 조회 (정렬 포함)
 * GET /sale_schedule
 */
export async function getMySaleScheduleSummaries(): Promise<
  SaleScheduleSummaryItem[]
> {
  const response = await Axios.get<SaleScheduleSummaryItem[]>('/sale_schedule');
  return response.data;
}

/**
 * 예약된 스케줄 날짜 범위 리스트 + 사용자 progressTime 반환
 * GET /sale_schedule/blocked_dates
 */
export async function getBlockedSaleScheduleDates(): Promise<BlockedDatesResponse> {
  const response = await Axios.get<BlockedDatesResponse>(
    '/sale_schedule/blocked_dates'
  );
  return response.data;
}

/**
 * 특정 스케줄 상세 조회
 * GET /sale_schedule/{scheduleId}
 */
export async function getSaleScheduleDetail(
  scheduleId: number
): Promise<SaleScheduleDetailResponse> {
  const response = await Axios.get<SaleScheduleDetailResponse>(
    `/sale_schedule/${scheduleId}`
  );
  return response.data;
}

/**
 * 판매 스케줄 삭제 (scheduled, scheduling 상태만 가능)
 * DELETE /sale_schedule/{scheduleId}
 */
export async function deleteSaleSchedule(
  scheduleId: number
): Promise<DeleteSaleScheduleResponse> {
  const response = await Axios.delete<DeleteSaleScheduleResponse>(
    `/sale_schedule/${scheduleId}`
  );
  return response.data;
}

/**
 * 판매 스케줄 수정 (타이틀, 예약일자)
 * PATCH /sale_schedule/{scheduleId}
 */
export async function patchSaleSchedule(
  scheduleId: number,
  data: PatchSaleScheduleRequest
): Promise<{ message: string }> {
  const response = await Axios.patch<{ message: string }>(
    `/sale_schedule/${scheduleId}`,
    data
  );
  return response.data;
}

/**
 * 내 판매 스케줄 요약 리스트를 react-query로 가져오는 커스텀 훅
 */
export function useMySaleScheduleSummaries() {
  return useQuery<SaleScheduleSummaryItem[]>({
    queryKey: ['mySaleScheduleSummaries'],
    queryFn: getMySaleScheduleSummaries,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 예약된 스케줄 날짜 범위를 react-query로 가져오는 커스텀 훅
 */
export function useBlockedSaleScheduleDates() {
  return useQuery<BlockedDatesResponse>({
    queryKey: ['blockedSaleScheduleDates'],
    queryFn: getBlockedSaleScheduleDates,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 특정 스케줄 상세를 react-query로 가져오는 커스텀 훅
 * @param scheduleId 스케줄 ID
 */
export function useSaleScheduleDetail(scheduleId: number) {
  return useQuery<SaleScheduleDetailResponse>({
    queryKey: ['saleScheduleDetail', scheduleId],
    queryFn: () => getSaleScheduleDetail(scheduleId),
    enabled: !!scheduleId,
    staleTime: 1000 * 60 * 5,
  });
}
