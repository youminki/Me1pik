// src/api/paypleApi.ts
import { Axios } from '../Axios';
import { useQuery } from '@tanstack/react-query';

/**
 * 1. 로그인 유저의 카드 목록 조회
 * GET /card/me
 * @returns CardListResponse
 */
export const getMyCards = async (): Promise<CardListResponse> => {
  const response = await Axios.get<CardListResponse>('/card/me');
  return response.data;
};

/**
 * 2. 정기결제 실행
 * POST /payple/recurring-payment
 * @param params { payerId, amount, goods }
 * @returns RecurringPaymentResponse
 */
export const postRecurringPayment = (params: RecurringPaymentRequest) => {
  return Axios.post<RecurringPaymentResponse>(
    '/payple/recurring-payment',
    params
  );
};

/**
 * 3. 결제용 Payple 요청 데이터 초기화
 * POST /payple/init-payment
 * @param params { payerId, amount, goods }
 * @returns InitPaymentData
 */
export const postInitPayment = (params: InitPaymentRequest) => {
  return Axios.post<InitPaymentData>('/payple/init-payment', params);
};

// --- Types ---

/** 카드 목록 조회 응답 */
export interface CardItem {
  cardId: number;
  payerId: string;
  cardName: string;
  cardNumber: string;
  createdAt: string; // ISO 8601
}

export interface CardListResponse {
  count: number;
  items: CardItem[];
}

/** 정기결제 요청 바디 */
export interface RecurringPaymentRequest {
  payerId: string;
  amount: number;
  goods: string;
}

/** 정기결제 응답 스펙 */
export interface RecurringPaymentResponse {
  PCD_PAY_RST: string;
  PCD_PAY_MSG: string;
  PCD_PAY_GOODS: string;
  PCD_PAY_TOTAL: string;
}

/** 결제 초기화 요청 바디 */
export interface InitPaymentRequest {
  payerId: string;
  amount: number;
  goods: string;
}

/** 결제 초기화 응답 스펙 */
export interface InitPaymentData {
  clientKey: string;
  PCD_PAY_TYPE: string;
  PCD_PAYER_NO: number;
  PCD_PAYER_NAME: string;
  PCD_PAYER_EMAIL: string;
  PCD_PAY_GOODS: string;
  PCD_PAY_TOTAL: number;
  PCD_RST_URL: string;
}

/**
 * 내 카드 목록을 react-query로 가져오는 커스텀 훅
 */
export function useMyCards() {
  return useQuery<CardListResponse>({
    queryKey: ['myCards'],
    queryFn: getMyCards,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });
}
