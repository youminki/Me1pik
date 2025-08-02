import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
}

interface UseIntersectionObserverReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Intersection Observer 훅
 * @param options Intersection Observer 옵션
 * @returns { ref, isIntersecting, entry }
 */
export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const callback = useCallback(([entry]: IntersectionObserverEntry[]) => {
    setIsIntersecting(entry.isIntersecting);
    setEntry(entry);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(callback, {
      threshold: options.threshold || 0,
      rootMargin: options.rootMargin || '0px',
      root: options.root || null,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [callback, options.threshold, options.rootMargin, options.root]);

  return { ref, isIntersecting, entry };
};

/**
 * 무한 스크롤 훅
 * @param onLoadMore 더 로드할 콜백 함수
 * @param hasMore 더 로드할 데이터가 있는지 여부
 * @param options Intersection Observer 옵션
 * @returns { ref, isIntersecting }
 */
export const useInfiniteScroll = (
  onLoadMore: () => void,
  hasMore: boolean,
  options: UseIntersectionObserverOptions = {}
) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    ...options,
  });

  useEffect(() => {
    if (isIntersecting && hasMore) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, onLoadMore]);

  return { ref, isIntersecting };
};

/**
 * 지연 로딩 훅
 * @param options Intersection Observer 옵션
 * @returns { ref, shouldLoad }
 */
export const useLazyLoad = (options: UseIntersectionObserverOptions = {}) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    ...options,
  });

  return { ref, shouldLoad: isIntersecting };
};
