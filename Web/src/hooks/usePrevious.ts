import { useRef, useEffect } from 'react';

/**
 * 이전 값을 추적하는 훅
 * @param value 현재 값
 * @returns 이전 값
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/**
 * 값이 변경되었는지 확인하는 훅
 * @param value 현재 값
 * @returns 값이 변경되었는지 여부
 */
export const useHasChanged = <T>(value: T): boolean => {
  const prevValue = usePrevious(value);
  return prevValue !== undefined && prevValue !== value;
};

/**
 * 값이 처음 렌더링되었는지 확인하는 훅
 * @param value 현재 값
 * @returns 처음 렌더링되었는지 여부
 */
export const useIsFirstRender = <T>(value: T): boolean => {
  const prevValue = usePrevious(value);
  return prevValue === undefined;
};
