import { useState, useEffect, useRef, useMemo } from 'react';

interface UseInfiniteScrollProps<T = unknown> {
  items: T[];
  pageSize?: number;
  threshold?: number;
  resetKey?: string | number; // 카테고리 변경 시 초기화를 위한 키
}

export const useInfiniteScroll = <T = unknown>({
  items,
  pageSize = 40,
  threshold = 0.1,
  resetKey,
}: UseInfiniteScrollProps<T>) => {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // resetKey가 변경되면 visibleCount를 초기화
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [resetKey, pageSize]);

  // 무한스크롤 IntersectionObserver
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const newVisibleCount = Math.min(
            visibleCount + pageSize,
            items.length
          );
          setVisibleCount(newVisibleCount);
        }
      },
      { threshold }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [items.length, pageSize, threshold, visibleCount]);

  const visibleItems = useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]) as T[];

  return {
    visibleItems,
    visibleCount,
    observerRef,
    setVisibleCount,
  };
};
