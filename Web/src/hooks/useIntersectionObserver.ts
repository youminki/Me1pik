import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useIntersectionObserver 훅 모음
 *
 * Intersection Observer API를 활용한 다양한 기능을 제공하는 커스텀 훅 집합입니다.
 * - useIntersectionObserver: 기본 Intersection Observer
 * - useInfiniteScroll: 무한 스크롤 구현
 * - useLazyLoad: 지연 로딩 구현
 */

/**
 * UseIntersectionObserverOptions 인터페이스
 *
 * @property threshold - 교차 임계값 (0~1)
 * @property rootMargin - 루트 마진
 * @property root - 관찰 대상 루트 요소
 */
interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
}

/**
 * UseIntersectionObserverReturn 인터페이스
 *
 * @property ref - 관찰할 요소의 ref
 * @property isIntersecting - 교차 상태
 * @property entry - Intersection Observer 엔트리
 */
interface UseIntersectionObserverReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * useIntersectionObserver 훅
 *
 * 특정 요소가 뷰포트에 진입/이탈하는지 관찰할 수 있는 훅입니다.
 *
 * @param options - Intersection Observer 옵션
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
 * useInfiniteScroll 훅
 *
 * Intersection Observer를 활용한 무한 스크롤 구현 훅입니다.
 *
 * @param onLoadMore - 더 로드할 콜백 함수
 * @param hasMore - 더 로드할 데이터가 있는지 여부
 * @param options - Intersection Observer 옵션
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
 * useLazyLoad 훅
 *
 * Intersection Observer를 활용한 Lazy Load 구현 훅입니다.
 *
 * @param options - Intersection Observer 옵션
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
