import { ApiError, PaypleError } from '@/types';

/**
 * 에러 처리 유틸리티 (errorHandler.ts)
 *
 * 애플리케이션에서 발생하는 다양한 에러를 체계적으로 처리하는 유틸리티 함수 집합입니다.
 * API 에러, 네트워크 에러, 인증 에러, 결제 에러 등을 구분하여 처리하며,
 * 사용자 친화적인 에러 메시지와 개발자용 상세 정보를 제공합니다.
 *
 * @description
 * - parseApiError: API 에러 파싱 및 정규화
 * - getErrorMessage: 사용자 친화적 에러 메시지 생성
 * - parsePaypleError: Payple 결제 에러 파싱
 * - logError: 에러 로깅 및 모니터링
 * - isNetworkError: 네트워크 에러 확인
 * - isAuthError: 인증 에러 확인
 * - isApiError: ApiError 타입 가드
 * - isPaypleError: PaypleError 타입 가드
 * - toApiError: ApiError로 변환
 * - toPaypleError: PaypleError로 변환
 */

/**
 * API 에러 파싱 함수
 *
 * 다양한 형태의 에러 객체를 표준화된 ApiError 형태로 변환합니다.
 * Axios 에러, 일반 Error 객체, 커스텀 에러 객체 등을 처리합니다.
 *
 * @param error - 변환할 에러 객체 (unknown 타입)
 * @returns 정규화된 ApiError 객체
 */
export const parseApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    const axiosError = error as {
      response?: { status?: number; data?: { code?: string } };
    };
    return {
      message: error.message,
      status: axiosError.response?.status,
      code: axiosError.response?.data?.code,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    return {
      message: String(errorObj.message || '알 수 없는 오류가 발생했습니다.'),
      status: Number(errorObj.status) || undefined,
      code: String(errorObj.code || ''),
    };
  }

  return {
    message: String(error || '알 수 없는 오류가 발생했습니다.'),
  };
};

/**
 * 사용자 친화적 에러 메시지 생성 함수
 *
 * 에러 객체를 분석하여 사용자가 이해하기 쉬운 메시지로 변환합니다.
 * HTTP 상태 코드별로 적절한 메시지를 제공하며, 기술적 세부사항은 숨깁니다.
 *
 * @param error - 에러 객체 (unknown 타입)
 * @returns 사용자 친화적인 에러 메시지 문자열
 */
export const getErrorMessage = (error: unknown): string => {
  const apiError = parseApiError(error);

  // HTTP 상태 코드별 메시지
  switch (apiError.status) {
    case 400:
      return '잘못된 요청입니다. 입력 정보를 확인해주세요.';
    case 401:
      return '로그인이 필요합니다.';
    case 403:
      return '접근 권한이 없습니다.';
    case 404:
      return '요청한 정보를 찾을 수 없습니다.';
    case 500:
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    default:
      return apiError.message;
  }
};

/**
 * Payple 결제 에러 파싱 함수
 *
 * Payple 결제 시스템에서 발생하는 에러를 표준화된 형태로 변환합니다.
 * 결제 관련 에러의 특성을 고려하여 적절한 메시지와 코드를 제공합니다.
 *
 * @param error - Payple 에러 객체 (unknown 타입)
 * @returns 정규화된 PaypleError 객체
 */
export const parsePaypleError = (error: unknown): PaypleError => {
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    return {
      message: String(errorObj.message || '결제 처리 중 오류가 발생했습니다.'),
      code: String(errorObj.code || ''),
      status: Number(errorObj.status) || 0,
    };
  }

  return {
    message: String(error || '결제 처리 중 오류가 발생했습니다.'),
    code: '',
    status: 0,
  };
};

/**
 * logError 함수
 *
 * 에러 로깅을 위한 유틸리티입니다.
 */
export const logError = (): void => {
  // const errorMessage = getErrorMessage(error);
  // const timestamp = new Date().toISOString();
  // console.error(
  //   `[${timestamp}] ${context ? `[${context}] ` : ''}${errorMessage}`,
  //   error
  // );
};

/**
 * isNetworkError 함수
 *
 * 에러가 네트워크 오류인지 확인합니다.
 *
 * @param error - 확인할 에러 객체
 * @returns 네트워크 에러 여부
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('Network Error') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('timeout')
    );
  }
  return false;
};

/**
 * isAuthError 함수
 *
 * 에러가 인증 관련 오류인지 확인합니다.
 *
 * @param error - 확인할 에러 객체
 * @returns 인증 에러 여부
 */
export const isAuthError = (error: unknown): boolean => {
  const apiError = parseApiError(error);
  return apiError.status === 401 || apiError.status === 403;
};

/**
 * isApiError 함수
 *
 * 에러가 ApiError 타입인지 확인하는 타입 가드입니다.
 *
 * @param error - 확인할 에러 객체
 * @returns ApiError 타입 여부
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * isPaypleError 함수
 *
 * 에러가 PaypleError 타입인지 확인하는 타입 가드입니다.
 *
 * @param error - 확인할 에러 객체
 * @returns PaypleError 타입 여부
 */
export function isPaypleError(error: unknown): error is PaypleError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  );
}

/**
 * toApiError 함수
 *
 * 에러를 ApiError로 파싱합니다. 실패 시 기본값을 반환합니다.
 *
 * @param error - 변환할 에러 객체
 * @returns ApiError 객체
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;
  return { message: '알 수 없는 오류', code: 'UNKNOWN' };
}

/**
 * toPaypleError 함수
 *
 * 에러를 PaypleError로 파싱합니다. 실패 시 기본값을 반환합니다.
 *
 * @param error - 변환할 에러 객체
 * @returns PaypleError 객체
 */
export function toPaypleError(error: unknown): PaypleError {
  if (isPaypleError(error)) return error;
  return { code: 'UNKNOWN', message: '알 수 없는 페이플 오류', status: 0 };
}
