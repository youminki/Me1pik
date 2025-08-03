import { useCallback, useEffect, useState } from 'react';

interface UseLoadingStateReturn {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  setLoadingTimeout: (timeout: number) => void;
}

export const useLoadingState = (initialTimeout = 3000): UseLoadingStateReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  const setLoadingTimeout = useCallback((timeout: number) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const newTimeoutId = setTimeout(() => {
      setIsLoading(false);
    }, timeout);
    
    setTimeoutId(newTimeoutId);
  }, [timeoutId]);

  useEffect(() => {
    // 초기 타임아웃 설정
    if (isLoading) {
      setLoadingTimeout(initialTimeout);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, initialTimeout, setLoadingTimeout, timeoutId]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    setLoadingTimeout,
  };
}; 