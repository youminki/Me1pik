import { useState, useEffect } from 'react';

interface UseNoResultHandlerProps {
  items: unknown[]; // 필터링된 상품 목록
  originalItems: unknown[]; // 원본 상품 목록 (필터링 전)
  searchQuery: string;
  selectedColors: string[];
  selectedSizes: string[];
  isLoading: boolean;
  selectedCategory?: string;
}

export const useNoResultHandler = ({
  items,
  originalItems,
  searchQuery,
  selectedColors,
  selectedSizes,
  isLoading,
  selectedCategory,
}: UseNoResultHandlerProps) => {
  const [showNoResult, setShowNoResult] = useState(false);

  // 검색 결과 없음 감지 및 필터 조건 변경 시 즉시 반영
  useEffect(() => {
    // 로딩 중이면 NoResult를 표시하지 않음
    if (isLoading) {
      setShowNoResult(false);
      return;
    }

    // 검색어나 필터가 있는지 확인
    const hasActiveFilters =
      searchQuery.trim() ||
      selectedColors.length > 0 ||
      selectedSizes.length > 0;

    // All 카테고리가 아니거나 필터가 활성화된 경우
    const hasActiveCategoryOrFilters =
      selectedCategory !== 'All' || hasActiveFilters;

    // 원본 상품이 있는지 확인
    const hasOriginalItems = originalItems && originalItems.length > 0;

    // 필터 조건이 변경되었을 때 즉시 반영
    if (!hasActiveFilters && selectedCategory === 'All') {
      // 모든 필터가 해제되고 All 카테고리인 경우 NoResult 숨김
      setShowNoResult(false);
      return;
    }

    // 결과가 없고 필터나 카테고리가 활성화된 경우에만 NoResult 표시
    if (items.length === 0 && hasActiveCategoryOrFilters && hasOriginalItems) {
      // 깜빡임 방지를 위한 짧은 지연
      const timer = setTimeout(() => {
        setShowNoResult(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // 결과가 있거나 필터가 없거나 원본 상품이 없는 경우 NoResult 숨김
      setShowNoResult(false);
    }
  }, [
    isLoading,
    items.length,
    originalItems,
    searchQuery,
    selectedColors,
    selectedSizes,
    selectedCategory,
  ]);

  return {
    showNoResult,
  };
};
