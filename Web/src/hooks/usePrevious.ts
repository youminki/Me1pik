import { useRef, useEffect } from 'react';

/**
 * usePrevious 훅
 *
 * 전달받은 값의 이전 렌더링 값을 반환합니다.
 * React의 useRef를 활용하여 값의 변경 이력을 추적할 때 사용합니다.
 *
 * @template T - 추적할 값의 타입
 * @param value - 현재 값
 * @returns 이전 값 (첫 렌더링 시에는 undefined)
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/**
 * useHasChanged 훅
 *
 * 값이 이전 렌더링과 비교해 변경되었는지 여부를 반환합니다.
 *
 * @template T - 비교할 값의 타입
 * @param value - 현재 값
 * @returns 값이 변경되었으면 true, 그렇지 않으면 false
 */
export const useHasChanged = <T>(value: T): boolean => {
  const prevValue = usePrevious(value);
  return prevValue !== undefined && prevValue !== value;
};

/**
 * useIsFirstRender 훅
 *
 * 해당 값이 컴포넌트에서 처음 렌더링되는지 여부를 반환합니다.
 *
 * @template T - 확인할 값의 타입
 * @param value - 현재 값
 * @returns 처음 렌더링이면 true, 그렇지 않으면 false
 */
export const useIsFirstRender = <T>(value: T): boolean => {
  const prevValue = usePrevious(value);
  return prevValue === undefined;
};
