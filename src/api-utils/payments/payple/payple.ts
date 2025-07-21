import { Axios } from '@/api-utils/Axios';

// Request and Response Models

// 초기 결제 요청 파라미터 (init-payment)
export interface InitPaymentRequest {
  payerId: string;
  amount: number;
  goods: string;
}

export interface InitPaymentResponse {
  clientKey: string;
  PCD_PAY_TYPE: string;
  PCD_PAYER_NO: number;
  PCD_PAYER_NAME: string;
  PCD_PAYER_EMAIL: string;
  PCD_PAY_GOODS: string;
  PCD_PAY_TOTAL: number;
  PCD_RST_URL: string;
}

// 정기 결제 요청 파라미터 (recurring-payment)
export interface RecurringPaymentRequest {
  payerId: string;
  amount: number;
  goods: string;
}

export interface RecurringPaymentResponse {
  PCD_PAY_RST: string;
  PCD_PAY_MSG: string;
  PCD_PAY_GOODS: string;
  PCD_PAY_TOTAL: number;
}

// API 호출 함수
// 결제 초기화 요청 (init-payment)
export const initPayment = async (
  requestData: InitPaymentRequest
): Promise<InitPaymentResponse> => {
  try {
    const response = await Axios.post<InitPaymentResponse>(
      '/payple/init-payment',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch {
    throw new Error('결제 초기화 요청 실패');
  }
};

// 정기 결제 요청 (recurring-payment)
export const recurringPayment = async (
  requestData: RecurringPaymentRequest
): Promise<RecurringPaymentResponse> => {
  try {
    const response = await Axios.post<RecurringPaymentResponse>(
      '/payple/recurring-payment',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch {
    throw new Error('정기 결제 요청 실패');
  }
};
