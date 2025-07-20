import { useState, useCallback } from 'react';
import { Axios } from '../api-utils/Axios';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: unknown[]) => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: unknown[]) => {
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

// 특정 API 호출을 위한 훅들
export function useGet<T>(url: string, options?: UseApiOptions<T>) {
  const apiFunction = useCallback(async () => {
    const response = await Axios.get<T>(url);
    return response.data;
  }, [url]);

  return useApi(apiFunction, options);
}

export function usePost<T>(url: string, options?: UseApiOptions<T>) {
  const apiFunction = useCallback(
    async (data: unknown) => {
      const response = await Axios.post<T>(url, data);
      return response.data;
    },
    [url]
  );

  return useApi(apiFunction, options);
}

export function usePut<T>(url: string, options?: UseApiOptions<T>) {
  const apiFunction = useCallback(
    async (data: unknown) => {
      const response = await Axios.put<T>(url, data);
      return response.data;
    },
    [url]
  );

  return useApi(apiFunction, options);
}

export function useDelete<T>(url: string, options?: UseApiOptions<T>) {
  const apiFunction = useCallback(async () => {
    const response = await Axios.delete<T>(url);
    return response.data;
  }, [url]);

  return useApi(apiFunction, options);
}
