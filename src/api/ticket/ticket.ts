import { Axios } from '../Axios';
import { useQuery } from '@tanstack/react-query';

/**
 * 이용권 템플릿 정보 (UserTicket.ticketList 및 /ticket-list 응답 아이템)
 */
export interface TicketList {
  id: number;
  name: string; // 이용권 이름
  durationMonths: number; // 사용 가능 개월 수
  rentalLimit: number; // 전체 대여 제한 횟수
  monthlyRentalLimit: number; // 월별 대여 제한 횟수
  isLongTerm: boolean; // 장기권 여부
  price: number; // 가격 (원)
  // 아래 필드는 /ticket-list 엔드포인트에서만 제공됩니다.
  recurringIntervalMonths?: number;
  isVisible?: boolean;
  createdAt?: string;
  isUlimited: string;
}

/**
 * 로그인한 사용자의 이용권 정보 스펙
 */
export interface TicketItem {
  id: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  remainingRentals: number; // 잔여 대여 횟수
  monthlyUsedRentals: number; // 이번 달 사용한 횟수
  autoRenewal: boolean; // 자동 갱신 여부
  nextBillingDate?: string; // 다음 결제 일시 (ISO 8601, 자동 갱신 시에만)
  isActive: boolean; // 활성 상태
  status: 'PAID' | 'PENDING' | 'CANCELLED' | 'EXPIRED' | string;
  ticketList: TicketList; // 템플릿 정보
  purchasedAt: string; // 구매 일시 (ISO 8601)
}

/**
 * 로그인한 사용자의 이용권 목록 조회
 * GET /user/me/tickets
 */
export const getUserTickets = async (): Promise<TicketItem[]> => {
  const response = await Axios.get<TicketItem[]>('/user/me/tickets');
  return response.data;
};

/**
 * /ticket-list 응답 스펙
 */
export interface TicketListResponse {
  total: number;
  items: TicketList[];
}

/**
 * 전체 이용권 목록 조회 (공개)
 * GET /ticket-list
 */
export const getTicketList = async (): Promise<TicketListResponse> => {
  const response = await Axios.get<TicketListResponse>('/ticket-list');
  return response.data;
};

/**
 * 이용권 템플릿 전체 조회 (관리자용 혹은 다른 용도)
 * GET /ticket/templates
 */
export interface TicketTemplatesResponse {
  items: TicketList[];
}

export const getTicketTemplates =
  async (): Promise<TicketTemplatesResponse> => {
    const response =
      await Axios.get<TicketTemplatesResponse>('/ticket/templates');
    return response.data;
  };

/**
 * 로그인한 사용자의 이용권 목록을 react-query로 가져오는 커스텀 훅
 */
export function useUserTickets() {
  return useQuery<TicketItem[]>({
    queryKey: ['userTickets'],
    queryFn: getUserTickets,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 전체 이용권 목록을 react-query로 가져오는 커스텀 훅
 */
export function useTicketList() {
  return useQuery<TicketListResponse>({
    queryKey: ['ticketList'],
    queryFn: getTicketList,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 이용권 템플릿 전체를 react-query로 가져오는 커스텀 훅
 */
export function useTicketTemplates() {
  return useQuery<TicketTemplatesResponse>({
    queryKey: ['ticketTemplates'],
    queryFn: getTicketTemplates,
    staleTime: 1000 * 60 * 5,
  });
}
