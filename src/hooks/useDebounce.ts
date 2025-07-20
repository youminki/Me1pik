import { useState, useEffect } from 'react';

/**
 * 디바운스 훅
 * @param value 디바운스할 값
 * @param delay 지연 시간 (ms)
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
 * 검색 디바운스 훅
 * @param searchTerm 검색어
 * @param delay 지연 시간 (ms, 기본값: 300ms)
 * @returns 디바운스된 검색어
 */
export const useSearchDebounce = (
  searchTerm: string,
  delay: number = 300
): string => {
  return useDebounce(searchTerm, delay);
};
