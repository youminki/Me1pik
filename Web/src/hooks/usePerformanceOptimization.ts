import { useEffect, useRef, useCallback, useState, useMemo } from 'react';

interface PerformanceOptimizationOptions {
  debounceMs?: number;
  throttleMs?: number;
  enableIntersectionObserver?: boolean;
  enableResizeObserver?: boolean;
  enableMemoryMonitoring?: boolean;
  enableNetworkMonitoring?: boolean;
  enableBatteryMonitoring?: boolean;
  enableVirtualization?: boolean;
  enableCaching?: boolean;
  cacheSize?: number;
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
  networkInfo?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
  batteryInfo?: {
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
  };
  fps?: number;
  domNodes?: number;
}

// Performance API의 memory 속성을 위한 타입 확장
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// 네트워크 정보 타입 (사용하지 않는 인터페이스 제거)
interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
  mozConnection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
  webkitConnection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
  getBattery?: () => Promise<{
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    addEventListener: (event: string, handler: () => void) => void;
    removeEventListener: (event: string, handler: () => void) => void;
  }>;
}

// 캐시 인터페이스
interface CacheItem<T> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
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
    enableNetworkMonitoring = true,
    enableBatteryMonitoring = true,
    enableVirtualization = false,
    enableCaching = false,
    cacheSize = 100,
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
  const fpsTimer = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastTime = useRef<number>(0);

  // 캐시 시스템
  const cache = useMemo(() => {
    if (!enableCaching) return null;

    const cacheMap = new Map<string, CacheItem<unknown>>();

    return {
      get: <T>(key: string): T | null => {
        const item = cacheMap.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > item.ttl) {
          cacheMap.delete(key);
          return null;
        }

        return item.value as T;
      },
      set: <T>(key: string, value: T, ttl: number = 60000): void => {
        if (cacheMap.size >= cacheSize) {
          const firstKey = cacheMap.keys().next().value;
          if (firstKey) {
            cacheMap.delete(firstKey);
          }
        }

        cacheMap.set(key, {
          key,
          value,
          timestamp: Date.now(),
          ttl,
        });
      },
      clear: (): void => {
        cacheMap.clear();
      },
    };
  }, [enableCaching, cacheSize]);

  // 렌더링 시간 측정
  const startRenderTimer = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRenderTimer = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    setMetrics((prev) => ({ ...prev, renderTime }));
  }, []);

  // FPS 측정
  const measureFPS = useCallback(() => {
    const now = performance.now();
    frameCount.current++;

    if (now - lastTime.current >= 1000) {
      const fps = Math.round(
        (frameCount.current * 1000) / (now - lastTime.current)
      );
      setMetrics((prev) => ({ ...prev, fps }));
      frameCount.current = 0;
      lastTime.current = now;
    }

    fpsTimer.current = requestAnimationFrame(measureFPS);
  }, []);

  // DOM 노드 수 측정
  const measureDOMNodes = useCallback(() => {
    if (!elementRef.current) return;

    const count = elementRef.current.querySelectorAll('*').length;
    setMetrics((prev) => ({ ...prev, domNodes: count }));
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

  // 네트워크 상태 모니터링
  useEffect(() => {
    if (!enableNetworkMonitoring) return;

    const updateNetworkInfo = () => {
      const nav = navigator as NavigatorWithConnection;
      const connection =
        nav.connection || nav.mozConnection || nav.webkitConnection;

      if (connection) {
        setMetrics((prev) => ({
          ...prev,
          networkInfo: {
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink || 0,
            rtt: connection.rtt || 0,
            saveData: connection.saveData || false,
          },
        }));
      }
    };

    updateNetworkInfo();

    const nav = navigator as NavigatorWithConnection;
    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection;
    if (connection && 'addEventListener' in connection) {
      (connection as unknown as EventTarget).addEventListener(
        'change',
        updateNetworkInfo
      );
      return () =>
        (connection as unknown as EventTarget).removeEventListener(
          'change',
          updateNetworkInfo
        );
    }
  }, [enableNetworkMonitoring]);

  // 배터리 상태 모니터링
  useEffect(() => {
    if (!enableBatteryMonitoring) return;

    const updateBatteryInfo = async () => {
      try {
        const nav = navigator as NavigatorWithConnection;
        if (!nav.getBattery) {
          console.warn('Battery API not supported');
          return;
        }

        const battery = await nav.getBattery();

        const updateBattery = () => {
          setMetrics((prev) => ({
            ...prev,
            batteryInfo: {
              level: battery.level,
              charging: battery.charging,
              chargingTime: battery.chargingTime,
              dischargingTime: battery.dischargingTime,
            },
          }));
        };

        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
        battery.addEventListener('chargingtimechange', updateBattery);
        battery.addEventListener('dischargingtimechange', updateBattery);

        return () => {
          battery.removeEventListener('levelchange', updateBattery);
          battery.removeEventListener('chargingchange', updateBattery);
          battery.removeEventListener('chargingtimechange', updateBattery);
          battery.removeEventListener('dischargingtimechange', updateBattery);
        };
      } catch (error) {
        console.warn('Battery API not supported:', error);
      }
    };

    updateBatteryInfo();
  }, [enableBatteryMonitoring]);

  // FPS 모니터링 시작
  useEffect(() => {
    if (enableVirtualization) {
      fpsTimer.current = requestAnimationFrame(measureFPS);

      return () => {
        if (fpsTimer.current) {
          cancelAnimationFrame(fpsTimer.current);
        }
      };
    }
  }, [enableVirtualization, measureFPS]);

  // DOM 노드 수 측정
  useEffect(() => {
    if (enableVirtualization) {
      const interval = setInterval(measureDOMNodes, 2000);
      return () => clearInterval(interval);
    }
  }, [enableVirtualization, measureDOMNodes]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
      if (fpsTimer.current) {
        cancelAnimationFrame(fpsTimer.current);
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
    cache,
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

/**
 * 가상화 훅 (대용량 리스트 최적화)
 *
 * 대용량 리스트를 렌더링할 때 성능을 최적화하기 위한 가상화 기능을 제공합니다.
 * 화면에 보이는 항목만 렌더링하여 메모리 사용량을 줄입니다.
 *
 * @param items - 렌더링할 아이템 배열
 * @param itemHeight - 각 아이템의 높이 (픽셀)
 * @param containerHeight - 컨테이너의 높이 (픽셀)
 * @param overscan - 화면 밖에 미리 렌더링할 아이템 수 (기본값: 5)
 * @returns 가상화된 아이템 정보와 스크롤 핸들러
 */
export const useVirtualization = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  // 화면에 보이는 아이템 범위 계산
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + overscan, items.length);
    const startIndex = Math.max(0, start - overscan);

    return { start: startIndex, end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // 화면에 보이는 아이템들만 필터링하여 렌더링
  const visibleItems = useMemo(() => {
    return items
      .slice(visibleRange.start, visibleRange.end)
      .map((item, index) => ({
        item,
        index: visibleRange.start + index,
        style: {
          position: 'absolute' as const,
          top: (visibleRange.start + index) * itemHeight,
          height: itemHeight,
          width: '100%',
        },
      }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
  };
};

/**
 * 웹 워커 훅 (무거운 계산 최적화)
 *
 * CPU 집약적인 작업을 별도 스레드에서 실행하여 메인 스레드 블로킹을 방지합니다.
 *
 * @param workerFunction - 워커에서 실행할 함수
 * @param options - 워커 설정 옵션
 * @param options.enableWorker - 워커 사용 여부 (기본값: true)
 * @param options.timeout - 작업 타임아웃 (밀리초, 기본값: 30000)
 * @returns 워커 실행 결과와 상태
 */
export const useWebWorker = <T, R>(
  workerFunction: (data: T) => R,
  options: {
    enableWorker?: boolean;
    timeout?: number;
  } = {}
) => {
  const { enableWorker = true, timeout = 30000 } = options;
  const [result, setResult] = useState<R | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // 워커에서 작업 실행
  const executeTask = useCallback(
    (data: T): Promise<R> => {
      return new Promise((resolve, reject) => {
        if (!enableWorker) {
          // 워커가 비활성화된 경우 메인 스레드에서 실행
          try {
            const result = workerFunction(data);
            resolve(result);
          } catch (err) {
            reject(err);
          }
          return;
        }

        setIsLoading(true);
        setError(null);

        // 워커 생성 및 코드 주입
        const workerCode = `
          self.onmessage = function(e) {
            try {
              const result = (${workerFunction.toString()})(e.data);
              self.postMessage({ type: 'success', result });
            } catch (error) {
              self.postMessage({ type: 'error', error: error.message });
            }
          };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        workerRef.current = worker;

        // 타임아웃 설정
        const timeoutId = setTimeout(() => {
          worker.terminate();
          reject(new Error('Worker timeout'));
        }, timeout);

        worker.onmessage = (e) => {
          clearTimeout(timeoutId);
          worker.terminate();

          if (e.data.type === 'success') {
            setResult(e.data.result);
            resolve(e.data.result);
          } else {
            const error = new Error(e.data.error);
            setError(error);
            reject(error);
          }

          setIsLoading(false);
        };

        worker.onerror = () => {
          clearTimeout(timeoutId);
          worker.terminate();
          const error = new Error('Worker error');
          setError(error);
          setIsLoading(false);
          reject(error);
        };

        worker.postMessage(data);
      });
    },
    [workerFunction, enableWorker, timeout]
  );

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  return {
    executeTask,
    result,
    isLoading,
    error,
  };
};

/**
 * 메모이제이션 훅 (계산 결과 캐싱)
 */
export const useMemoization = <T, R>(
  computeFunction: (input: T) => R,
  options: {
    maxSize?: number;
    ttl?: number;
  } = {}
) => {
  const { maxSize = 100, ttl = 60000 } = options;
  const cache = useRef(new Map<string, { value: R; timestamp: number }>());

  const memoizedCompute = useCallback(
    (input: T): R => {
      const key = JSON.stringify(input);
      const cached = cache.current.get(key);

      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }

      const result = computeFunction(input);

      // 캐시 크기 제한
      if (cache.current.size >= maxSize) {
        const firstKey = cache.current.keys().next().value;
        if (firstKey) {
          cache.current.delete(firstKey);
        }
      }

      cache.current.set(key, {
        value: result,
        timestamp: Date.now(),
      });

      return result;
    },
    [computeFunction, maxSize, ttl]
  );

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return {
    compute: memoizedCompute,
    clearCache,
    cacheSize: cache.current.size,
  };
};
