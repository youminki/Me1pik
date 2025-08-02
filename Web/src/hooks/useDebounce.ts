import { useState, useEffect } from 'react';

/**
 * useDebounce 훅
 *
 * 연속된 입력이나 이벤트를 일정 시간 지연 후에 처리합니다.
 * 성능 최적화와 불필요한 API 호출을 방지하는 데 사용됩니다.
 *
 * @template T - 디바운스할 값의 타입
 * @param value - 디바운스할 값
 * @param delay - 지연 시간 (밀리초)
 * @returns 디바운스된 값
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * useSearchDebounce 훅
 *
 * 검색 입력에 특화된 디바운스 훅입니다.
 * 사용자가 타이핑을 멈춘 후 일정 시간이 지나면 검색을 실행합니다.
 *
 * @param searchTerm - 검색어
 * @param delay - 지연 시간 (밀리초, 기본값: 300ms)
 * @returns 디바운스된 검색어
 */
export const useSearchDebounce = (
  searchTerm: string,
  delay: number = 300
): string => {
  return useDebounce(searchTerm, delay);
};
