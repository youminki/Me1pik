import { useState, useEffect, useRef, useCallback } from 'react';

interface UseNoResultHandlerProps {
  items: unknown[];
  searchQuery: string;
  selectedColors: string[];
  selectedSizes: string[];
  isLoading: boolean;
  selectedCategory?: string;
  onClearFilters: () => void;
  setSearchParams: (
    params:
      | Record<string, string>
      | ((prev: URLSearchParams) => URLSearchParams),
    options?: { replace?: boolean }
  ) => void;
}

export const useNoResultHandler = ({
  items,
  searchQuery,
  selectedColors,
  selectedSizes,
  isLoading,
  selectedCategory,
  onClearFilters,
  setSearchParams,
}: UseNoResultHandlerProps) => {
  const [showNoResult, setShowNoResult] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // 타이머 참조를 useRef로 관리하여 안정적인 정리 보장
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 정리 함수를 useCallback으로 메모이제이션
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // 검색 결과 없음 감지 및 자동 초기화
  useEffect(() => {
    // 기존 타이머들 정리
    clearTimers();

    // 검색어나 필터가 있고, 로딩이 완료되었으며, 결과가 없을 때
    const hasActiveFilters =
      searchQuery.trim() ||
      selectedColors.length > 0 ||
      selectedSizes.length > 0;

    // 카테고리에 아이템이 없거나 검색/필터 결과가 없을 때
    const shouldShowNoResult =
      !isLoading &&
      items.length === 0 &&
      (hasActiveFilters || selectedCategory !== 'All');

    // 검색어나 필터가 없고 All 카테고리이면 showNoResult를 false로 설정
    if (!hasActiveFilters && selectedCategory === 'All') {
      setShowNoResult(false);
      setCountdown(3);
      return;
    }

    if (shouldShowNoResult) {
      // 300ms 후에 NoResult 표시
      timerRef.current = setTimeout(() => {
        setShowNoResult(true);
        setCountdown(3);

        // 1초마다 카운트다운
        countdownTimerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              // 카운트다운 완료 시 모든 필터 초기화
              onClearFilters();
              setShowNoResult(false);
              setCountdown(3);

              // URL에서 search 파라미터 제거하고 All 카테고리로 이동
              setSearchParams(
                (prev: URLSearchParams) => {
                  const newParams = new URLSearchParams(prev);
                  newParams.delete('search');
                  newParams.delete('category');
                  return newParams;
                },
                { replace: true }
              );

              // 타이머 정리
              clearTimers();
              return 3;
            }
            return prev - 1;
          });
        }, 1000);
      }, 300);
    } else {
      setShowNoResult(false);
      setCountdown(3);
    }

    // cleanup 함수에서 타이머들 정리
    return clearTimers;
  }, [
    isLoading,
    items.length,
    searchQuery,
    selectedColors,
    selectedSizes,
    selectedCategory,
    onClearFilters,
    setSearchParams,
    clearTimers,
  ]);

  return {
    showNoResult,
    countdown,
  };
};
