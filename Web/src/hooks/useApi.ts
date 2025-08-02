import { useState, useCallback } from 'react';

import { Axios } from '@/api-utils/Axios';

/**
 * useApi 훅 모음
 *
 * API 요청/응답 상태를 관리하는 커스텀 훅 집합입니다.
 * - useApi: 범용 API 요청 상태 관리
 * - useGet/usePost/usePut/useDelete: HTTP 메서드별 특화 훅
 */

/**
 * UseApiOptions 인터페이스
 *
 * @template T - API 응답 데이터 타입
 * @property onSuccess - 성공 시 콜백
 * @property onError - 에러 시 콜백
 */
interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * UseApiResult 인터페이스
 *
 * @template T - API 응답 데이터 타입
 * @template A - API 함수 매개변수 타입
 * @property data - 응답 데이터
 * @property loading - 로딩 상태
 * @property error - 에러 메시지
 * @property execute - API 실행 함수
 * @property reset - 상태 초기화 함수
 */
interface UseApiResult<T, A extends unknown[] = unknown[]> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: A) => Promise<void>;
  reset: () => void;
}

/**
 * useApi 훅
 *
 * 범용 API 요청 상태 관리 훅입니다. API 호출, 로딩, 에러, 데이터 상태를 일관되게 관리합니다.
 *
 * @template T - 응답 데이터 타입
 * @template A - API 함수 매개변수 타입
 * @param apiFunction - 실제 호출할 API 함수
 * @param options - 성공/실패 콜백 옵션
 * @returns API 상태와 실행 함수
 */
export function useApi<T, A extends unknown[] = unknown[]>(
  apiFunction: (...args: A) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T, A> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: A) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
        options.onSuccess?.(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : '알 수 없는 오류가 발생했습니다.';
        setError(errorMessage);
        options.onError?.(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * useGet 훅
 *
 * GET 요청 전용 API 상태 관리 훅입니다.
 *
 * @template T - 응답 데이터 타입
 * @param url - API 엔드포인트
 * @param options - 성공/실패 콜백 옵션
 * @returns GET 요청 상태와 실행 함수
 */
export function useGet<T>(url: string, options?: UseApiOptions<T>) {
  const apiFunction = useCallback(async () => {
    const response = await Axios.get<T>(url);
    return response.data;
  }, [url]);

  return useApi(apiFunction, options);
}

/**
 * usePost 훅
 *
 * POST 요청 전용 API 상태 관리 훅입니다.
 *
 * @template T - 응답 데이터 타입
 * @template D - 요청 데이터 타입
 * @param url - API 엔드포인트
 * @param options - 성공/실패 콜백 옵션
 * @returns POST 요청 상태와 실행 함수
 */
export function usePost<T, D = unknown>(
  url: string,
  options?: UseApiOptions<T>
) {
  const apiFunction = useCallback(
    async (data: D) => {
      const response = await Axios.post<T>(url, data);
      return response.data;
    },
    [url]
  );

  return useApi<T, [D]>(apiFunction, options);
}

/**
 * usePut 훅
 *
 * PUT 요청 전용 API 상태 관리 훅입니다.
 *
 * @template T - 응답 데이터 타입
 * @template D - 요청 데이터 타입
 * @param url - API 엔드포인트
 * @param options - 성공/실패 콜백 옵션
 * @returns PUT 요청 상태와 실행 함수
 */
export function usePut<T, D = unknown>(
  url: string,
  options?: UseApiOptions<T>
) {
  const apiFunction = useCallback(
    async (data: D) => {
      const response = await Axios.put<T>(url, data);
      return response.data;
    },
    [url]
  );

  return useApi<T, [D]>(apiFunction, options);
}

/**
 * useDelete 훅
 *
 * DELETE 요청 전용 API 상태 관리 훅입니다.
 *
 * @template T - 응답 데이터 타입
 * @param url - API 엔드포인트
 * @param options - 성공/실패 콜백 옵션
 * @returns DELETE 요청 상태와 실행 함수
 */
export function useDelete<T>(url: string, options?: UseApiOptions<T>) {
  const apiFunction = useCallback(async () => {
    const response = await Axios.delete<T>(url);
    return response.data;
  }, [url]);

  return useApi(apiFunction, options);
}
