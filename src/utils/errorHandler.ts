import { ApiError, PaypleError } from '@/types';

/**
 * 에러 객체를 ApiError로 변환합니다.
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
 * 에러 메시지를 사용자 친화적으로 변환합니다.
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
 * Payple 관련 에러를 처리합니다.
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
 * 에러 로깅을 위한 유틸리티
 */
export const logError = (error: unknown, context?: string): void => {
  const errorMessage = getErrorMessage(error);
  const timestamp = new Date().toISOString();

  console.error(
    `[${timestamp}] ${context ? `[${context}] ` : ''}${errorMessage}`,
    error
  );
};

/**
 * 에러가 네트워크 오류인지 확인합니다.
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
 * 에러가 인증 관련 오류인지 확인합니다.
 */
export const isAuthError = (error: unknown): boolean => {
  const apiError = parseApiError(error);
  return apiError.status === 401 || apiError.status === 403;
};
