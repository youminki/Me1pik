import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage 훅
 *
 * 브라우저의 localStorage를 React 상태와 동기화합니다.
 * 다른 탭에서의 변경사항도 자동으로 감지합니다.
 *
 * @template T - 저장할 데이터 타입
 * @param key - 스토리지 키
 * @param initialValue - 초기값
 * @returns [저장된 값, 설정 함수, 제거 함수]
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] => {
  // 상태를 로컬 스토리지에서 초기화
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 로컬 스토리지에 값을 저장하는 함수
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // 함수인 경우 이전 값을 받아서 새로운 값을 계산
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // 로컬 스토리지에서 값을 제거하는 함수
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // 다른 탭에서 로컬 스토리지 변경 감지
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
};

/**
 * useSessionStorage 훅
 *
 * 브라우저의 sessionStorage를 React 상태와 동기화합니다.
 * 현재 탭에서만 유지되며, 탭을 닫으면 데이터가 삭제됩니다.
 *
 * @template T - 저장할 데이터 타입
 * @param key - 스토리지 키
 * @param initialValue - 초기값
 * @returns [저장된 값, 설정 함수, 제거 함수]
 */
export const useSessionStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] => {
  // 상태를 세션 스토리지에서 초기화
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 세션 스토리지에 값을 저장하는 함수
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // 세션 스토리지에서 값을 제거하는 함수
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};
