import { useState, useCallback, useRef } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncStateReturn<T> extends AsyncState<T> {
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: Error) => void;
}

/**
 * 비동기 상태 관리 훅
 * @param asyncFn 비동기 함수
 * @param initialData 초기 데이터
 * @returns 비동기 상태와 메서드들
 */
export const useAsyncState = <T>(
  asyncFn: (...args: unknown[]) => Promise<T>,
  initialData: T | null = null
): UseAsyncStateReturn<T> => {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: unknown[]) => {
      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 새로운 AbortController 생성
      abortControllerRef.current = new AbortController();

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFn(...args);

        // 요청이 취소되지 않았을 때만 상태 업데이트
        if (!abortControllerRef.current.signal.aborted) {
          setState({
            data: result,
            loading: false,
            error: null,
          });
        }

        return result;
      } catch (error) {
        // 요청이 취소되지 않았을 때만 에러 상태 업데이트
        if (!abortControllerRef.current.signal.aborted) {
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorObj,
          }));
        }
        throw error;
      }
    },
    [asyncFn]
  );

  const reset = useCallback(() => {
    // 진행 중인 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  const setData = useCallback((data: T) => {
    setState((prev) => ({ ...prev, data, error: null }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState((prev) => ({ ...prev, error, loading: false }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
};

/**
 * 조건부 비동기 상태 훅
 * @param condition 실행 조건
 * @param asyncFn 비동기 함수
 * @param initialData 초기 데이터
 * @returns 조건부 비동기 상태
 */
export const useConditionalAsyncState = <T>(
  condition: boolean,
  asyncFn: (...args: unknown[]) => Promise<T>,
  initialData: T | null = null
): UseAsyncStateReturn<T> => {
  const asyncState = useAsyncState(asyncFn, initialData);

  const execute = useCallback(
    async (...args: unknown[]) => {
      if (!condition) {
        throw new Error('조건이 충족되지 않아 실행할 수 없습니다.');
      }
      return asyncState.execute(...args);
    },
    [condition, asyncState]
  );

  return {
    ...asyncState,
    execute,
  };
};

/**
 * 자동 실행 비동기 상태 훅
 * @param asyncFn 비동기 함수
 * @param deps 의존성 배열
 * @param initialData 초기 데이터
 * @returns 자동 실행 비동기 상태
 */
export const useAutoAsyncState = <T>(
  asyncFn: (...args: unknown[]) => Promise<T>,
  deps: unknown[] = [],
  initialData: T | null = null
): UseAsyncStateReturn<T> => {
  const asyncState = useAsyncState(asyncFn, initialData);

  // 의존성이 변경될 때마다 자동 실행
  const execute = useCallback(
    async (...args: unknown[]) => {
      return asyncState.execute(...args);
    },
    [asyncState]
  );

  // 컴포넌트 마운트 시 자동 실행
  const executeOnMount = useCallback(async () => {
    try {
      await execute();
    } catch {
      // 에러는 이미 상태에 저장됨
    }
  }, [execute]);

  // 의존성 변경 시 자동 실행
  const executeOnDepsChange = useCallback(async () => {
    try {
      await execute();
    } catch {
      // 에러는 이미 상태에 저장됨
    }
  }, [execute]);

  // 컴포넌트 마운트 시 실행
  useState(() => {
    executeOnMount();
  });

  // 의존성 변경 시 실행
  useState(() => {
    if (deps.length > 0) {
      executeOnDepsChange();
    }
  });

  return {
    ...asyncState,
    execute,
  };
};

/**
 * 캐시된 비동기 상태 훅
 * @param key 캐시 키
 * @param asyncFn 비동기 함수
 * @param ttl 캐시 TTL (밀리초)
 * @param initialData 초기 데이터
 * @returns 캐시된 비동기 상태
 */
export const useCachedAsyncState = <T>(
  key: string,
  asyncFn: (...args: unknown[]) => Promise<T>,
  ttl: number = 5 * 60 * 1000, // 기본 5분
  initialData: T | null = null
): UseAsyncStateReturn<T> => {
  const [cache, setCache] = useState<
    Map<string, { data: T; timestamp: number }>
  >(new Map());
  const asyncState = useAsyncState(asyncFn, initialData);

  const execute = useCallback(
    async (...args: unknown[]) => {
      const now = Date.now();
      const cached = cache.get(key);

      // 캐시된 데이터가 있고 만료되지 않았으면 반환
      if (cached && now - cached.timestamp < ttl) {
        asyncState.setData(cached.data);
        return cached.data;
      }

      // 새로운 데이터 가져오기
      const result = await asyncState.execute(...args);

      // 캐시에 저장
      setCache(
        (prev) => new Map(prev.set(key, { data: result, timestamp: now }))
      );

      return result;
    },
    [key, cache, ttl, asyncState]
  );

  const reset = useCallback(() => {
    setCache(new Map());
    asyncState.reset();
  }, [asyncState]);

  return {
    ...asyncState,
    execute,
    reset,
  };
};
