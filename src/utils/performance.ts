/**
 * 성능 측정 유틸리티
 */

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface NetworkConnection {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface PerformanceWithMemory extends Performance {
  memory?: MemoryInfo;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
}

/**
 * 페이지 로드 성능 측정
 * @returns 성능 메트릭
 */
export const measurePageLoadPerformance = (): PerformanceMetrics => {
  const navigation = performance.getEntriesByType(
    'navigation'
  )[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  const firstPaint =
    paint.find((entry) => entry.name === 'first-paint')?.startTime || 0;
  const firstContentfulPaint =
    paint.find((entry) => entry.name === 'first-contentful-paint')?.startTime ||
    0;

  return {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded:
      navigation.domContentLoadedEventEnd -
      navigation.domContentLoadedEventStart,
    firstPaint,
    firstContentfulPaint,
    largestContentfulPaint: 0, // LCP는 별도로 측정 필요
    cumulativeLayoutShift: 0, // CLS는 별도로 측정 필요
    firstInputDelay: 0, // FID는 별도로 측정 필요
  };
};

/**
 * 함수 실행 시간 측정
 * @param fn 측정할 함수
 * @param name 함수 이름
 * @returns 실행 결과와 시간
 */
export const measureExecutionTime = async <T>(
  fn: () => Promise<T> | T,
  name: string
): Promise<{ result: T; executionTime: number }> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const executionTime = end - start;

  console.log(`${name} 실행 시간: ${executionTime.toFixed(2)}ms`);

  return { result, executionTime };
};

/**
 * 메모리 사용량 측정
 * @returns 메모리 정보
 */
export const getMemoryUsage = (): MemoryInfo | null => {
  const perf = performance as PerformanceWithMemory;
  if (perf.memory) {
    return {
      usedJSHeapSize: perf.memory.usedJSHeapSize,
      totalJSHeapSize: perf.memory.totalJSHeapSize,
      jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
    };
  }
  return null;
};

/**
 * 네트워크 정보 측정
 * @returns 네트워크 정보
 */
export const getNetworkInfo = (): NetworkConnection | null => {
  const nav = navigator as NavigatorWithConnection;
  if (nav.connection) {
    return {
      effectiveType: nav.connection.effectiveType,
      downlink: nav.connection.downlink,
      rtt: nav.connection.rtt,
      saveData: nav.connection.saveData,
    };
  }
  return null;
};

/**
 * 성능 관찰자 설정
 */
export const setupPerformanceObservers = () => {
  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value || 0;
        }
      }
      console.log('CLS:', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const firstInputEntry = entry as PerformanceEntry & {
          processingStart?: number;
        };
        if (firstInputEntry.processingStart) {
          console.log(
            'FID:',
            firstInputEntry.processingStart - entry.startTime
          );
        }
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
  }
};

/**
 * 성능 데이터 수집 및 전송
 * @param endpoint 전송할 엔드포인트
 */
export const collectAndSendPerformanceData = async (endpoint: string) => {
  try {
    const metrics = measurePageLoadPerformance();
    const memory = getMemoryUsage();
    const network = getNetworkInfo();

    const performanceData = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics,
      memory,
      network,
    };

    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(performanceData),
    });
  } catch (error) {
    console.error('성능 데이터 전송 실패:', error);
  }
};
