import { useState, useEffect } from 'react';

interface UseNoResultHandlerProps {
  items: unknown[] | any[];
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
  const [countdown, setCountdown] = useState(2);

  // 검색 결과 없음 감지 및 자동 초기화
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let countdownTimer: NodeJS.Timeout | null = null;

    // 검색어나 필터가 있고, 로딩이 완료되었으며, 결과가 없을 때
    const hasActiveFilters =
      searchQuery.trim() ||
      selectedColors.length > 0 ||
      selectedSizes.length > 0;
    
    // 카테고리에 아이템이 없거나 검색/필터 결과가 없을 때
    const shouldShowNoResult =
      !isLoading && items.length === 0 && (hasActiveFilters || selectedCategory !== 'All');

    // 검색어나 필터가 없고 All 카테고리이면 showNoResult를 false로 설정
    if (!hasActiveFilters && selectedCategory === 'All') {
      setShowNoResult(false);
      setCountdown(2);
      return;
    }

    if (shouldShowNoResult) {
      timer = setTimeout(() => {
        setShowNoResult(true);
        setCountdown(3);

        // 2초 카운트다운 후 자동 초기화
        countdownTimer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              // 카운트다운 완료 시 모든 필터 초기화
              onClearFilters();
              setShowNoResult(false);
              setCountdown(2);

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

              if (countdownTimer) {
                clearInterval(countdownTimer);
              }
              return 2;
            }
            return prev - 1;
          });
        }, 1000);
      }, 300);
    } else {
      setShowNoResult(false);
      setCountdown(2);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [
    isLoading,
    items.length,
    searchQuery,
    selectedColors,
    selectedSizes,
    onClearFilters,
    setSearchParams,
  ]);

  return {
    showNoResult,
    countdown,
  };
};
