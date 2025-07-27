import { useEffect, useRef, useCallback, useState } from 'react';

interface PerformanceOptimizationOptions {
  debounceMs?: number;
  throttleMs?: number;
  enableIntersectionObserver?: boolean;
  enableResizeObserver?: boolean;
  enableMemoryMonitoring?: boolean;
}

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  isVisible: boolean;
  isInViewport: boolean;
}

// Performance API의 memory 속성을 위한 타입 확장
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

/**
 * 성능 최적화를 위한 커스텀 훅
 */
export const usePerformanceOptimization = (
  options: PerformanceOptimizationOptions = {}
) => {
  const {
    debounceMs = 300,
    throttleMs = 100,
    enableIntersectionObserver = true,
    enableResizeObserver = true,
    enableMemoryMonitoring = true,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    isVisible: true,
    isInViewport: true,
  });

  const elementRef = useRef<HTMLElement | null>(null);
  const renderStartTime = useRef<number>(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const throttleTimer = useRef<NodeJS.Timeout | null>(null);

  // 렌더링 시간 측정
  const startRenderTimer = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRenderTimer = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    setMetrics((prev) => ({ ...prev, renderTime }));
  }, []);

  // 디바운스 함수
  const debounce = useCallback(
    <T extends (...args: unknown[]) => unknown>(func: T): T => {
      return ((...args: Parameters<T>) => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => func(...args), debounceMs);
      }) as T;
    },
    [debounceMs]
  );

  // 쓰로틀 함수
  const throttle = useCallback(
    (func: (...args: unknown[]) => unknown) => {
      return (...args: unknown[]) => {
        if (throttleTimer.current) return;
        throttleTimer.current = setTimeout(() => {
          func(...args);
          throttleTimer.current = null;
        }, throttleMs);
      };
    },
    [throttleMs]
  );

  // Intersection Observer 설정
  useEffect(() => {
    if (!enableIntersectionObserver || !elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setMetrics((prev) => ({
            ...prev,
            isVisible: entry.isIntersecting,
            isInViewport: entry.intersectionRatio > 0,
          }));
        });
      },
      {
        threshold: [0, 0.1, 0.5, 1.0],
        rootMargin: '50px',
      }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [enableIntersectionObserver]);

  // Resize Observer 설정
  useEffect(() => {
    if (!enableResizeObserver || !elementRef.current) return;

    const handleResize = (...args: unknown[]) => {
      const entries = args[0] as ResizeObserverEntry[];
      entries.forEach((entry: ResizeObserverEntry) => {
        // 크기 변경 시 성능 메트릭 업데이트
        console.log('Element resized:', entry.contentRect);
      });
    };

    const throttledHandleResize = throttle(handleResize);

    const observer = new ResizeObserver(throttledHandleResize);

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [enableResizeObserver, throttle]);

  // 메모리 사용량 모니터링
  useEffect(() => {
    if (!enableMemoryMonitoring) return;

    const updateMemoryUsage = () => {
      const perf = performance as PerformanceWithMemory;
      if (perf.memory) {
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: {
            usedJSHeapSize: perf.memory!.usedJSHeapSize,
            totalJSHeapSize: perf.memory!.totalJSHeapSize,
            jsHeapSizeLimit: perf.memory!.jsHeapSizeLimit,
          },
        }));
      }
    };

    const interval = setInterval(updateMemoryUsage, 5000); // 5초마다 체크
    updateMemoryUsage(); // 초기 실행

    return () => clearInterval(interval);
  }, [enableMemoryMonitoring]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
    };
  }, []);

  return {
    elementRef,
    metrics,
    startRenderTimer,
    endRenderTimer,
    debounce,
    throttle,
  };
};

/**
 * 이미지 지연 로딩 훅
 */
export const useLazyImage = (src: string, threshold = 0.1) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [threshold]);

  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.src = src;
  }, [isInView, src]);

  return { imgRef, isLoaded, isInView };
};

/**
 * 스크롤 성능 최적화 훅
 */
export const useScrollOptimization = (
  options: {
    enablePassive?: boolean;
    enableThrottle?: boolean;
    throttleMs?: number;
  } = {}
) => {
  const { enablePassive = true, enableThrottle = true } = options;

  const handleScroll = useCallback(() => {
    // 스크롤 이벤트 처리
    // 여기에 스크롤 관련 로직 추가
  }, []);

  useEffect(() => {
    const options: AddEventListenerOptions = {
      passive: enablePassive,
    };

    if (enableThrottle) {
      let ticking = false;
      const throttledHandler = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', throttledHandler, options);
      return () => window.removeEventListener('scroll', throttledHandler);
    } else {
      window.addEventListener('scroll', handleScroll, options);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, enablePassive, enableThrottle]);
};
