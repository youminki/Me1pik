import { useState, useCallback } from 'react';

/**
 * useErrorHandler 훅 모음
 *
 * 다양한 에러 처리 기능을 제공하는 커스텀 훅 집합입니다.
 * - useErrorHandler: 기본 에러 상태 관리
 * - useNetworkErrorHandler: 네트워크 에러 처리
 * - useApiErrorHandler: API 에러 처리
 */

/**
 * ErrorState 인터페이스
 *
 * @property hasError - 에러 발생 여부
 * @property error - 에러 객체
 * @property message - 에러 메시지
 */
interface ErrorState {
  hasError: boolean;
  error: Error | null;
  message: string;
}

/**
 * UseErrorHandlerReturn 인터페이스
 *
 * @property error - 에러 상태
 * @property setError - 에러 설정 함수
 * @property clearError - 에러 초기화 함수
 * @property handleAsyncError - 비동기 함수 에러 처리
 */
interface UseErrorHandlerReturn {
  error: ErrorState;
  setError: (error: Error | string) => void;
  clearError: () => void;
  handleAsyncError: <T>(asyncFn: () => Promise<T>) => Promise<T | null>;
}

/**
 * ApiError 인터페이스
 *
 * @property response - API 응답 에러 정보
 * @property request - 요청 에러 정보
 * @property message - 에러 메시지
 */
interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  request?: unknown;
  message?: string;
}

/**
 * useErrorHandler 훅
 *
 * 컴포넌트 단위에서 에러 상태를 일관되게 관리하는 훅입니다.
 *
 * @returns { error, setError, clearError, handleAsyncError }
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    message: '',
  });

  const setError = useCallback((error: Error | string) => {
    const errorObj = error instanceof Error ? error : new Error(error);
    setErrorState({
      hasError: true,
      error: errorObj,
      message: errorObj.message,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      message: '',
    });
  }, []);

  const handleAsyncError = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
      try {
        clearError();
        return await asyncFn();
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        return null;
      }
    },
    [setError, clearError]
  );

  return {
    error,
    setError,
    clearError,
    handleAsyncError,
  };
};

/**
 * useNetworkErrorHandler 훅
 *
 * 네트워크 관련 에러를 감지하고 상태를 관리하는 훅입니다.
 *
 * @returns { handleNetworkError, isNetworkError }
 */
export const useNetworkErrorHandler = () => {
  const [isNetworkError, setIsNetworkError] = useState(false);

  const handleNetworkError = useCallback((error: Error) => {
    if (
      error.name === 'NetworkError' ||
      error.message.includes('network') ||
      error.message.includes('fetch')
    ) {
      setIsNetworkError(true);
      return true;
    }
    return false;
  }, []);

  return { handleNetworkError, isNetworkError };
};

/**
 * useApiErrorHandler 훅
 *
 * API 호출 시 발생하는 에러를 일관되게 처리하는 훅입니다.
 *
 * @returns { handleApiError, getErrorMessage }
 */
export const useApiErrorHandler = () => {
  const getErrorMessage = useCallback((status: number, message?: string) => {
    switch (status) {
      case 400:
        return message || '잘못된 요청입니다.';
      case 401:
        return message || '인증이 필요합니다.';
      case 403:
        return message || '접근 권한이 없습니다.';
      case 404:
        return message || '요청한 리소스를 찾을 수 없습니다.';
      case 500:
        return message || '서버 오류가 발생했습니다.';
      case 502:
        return message || '서버가 일시적으로 사용할 수 없습니다.';
      case 503:
        return message || '서비스가 일시적으로 사용할 수 없습니다.';
      default:
        return message || '알 수 없는 오류가 발생했습니다.';
    }
  }, []);

  const handleApiError = useCallback(
    (error: ApiError) => {
      if (error.response) {
        const { status, data } = error.response;
        return {
          status,
          message: getErrorMessage(status, data?.message),
          data,
        };
      }

      if (error.request) {
        return {
          status: 0,
          message: '네트워크 연결을 확인해주세요.',
          data: null,
        };
      }

      return {
        status: 0,
        message: error.message || '알 수 없는 오류가 발생했습니다.',
        data: null,
      };
    },
    [getErrorMessage]
  );

  return { handleApiError, getErrorMessage };
};
