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
      const lcpTime = lastEntry.startTime;

      console.log('🚀 LCP 측정:', lcpTime, 'ms');

      // LCP 성능 분석 및 제안
      if (lcpTime > 2500) {
        // LCP 요소가 이미지인 경우 최적화 제안
        const lcpEntry = lastEntry as PerformanceEntry & { element?: Element };
        if (lcpEntry.element && lcpEntry.element instanceof HTMLImageElement) {
          console.log('🎯 LCP 요소:', lcpEntry.element);
          console.log('📸 LCP 이미지 src:', lcpEntry.element.src);
          console.log(
            '📏 이미지 크기:',
            lcpEntry.element.naturalWidth,
            'x',
            lcpEntry.element.naturalHeight
          );
          console.log(
            '🖼️ 표시 크기:',
            lcpEntry.element.width,
            'x',
            lcpEntry.element.height
          );

          // 이미지 로딩 상태 확인
          console.log('✅ 이미지 완전히 로드됨:', lcpEntry.element.complete);
          console.log(
            '⏱️ 이미지 로딩 시간:',
            performance.now() - lcpEntry.startTime,
            'ms'
          );

          console.log('🔧 이미지 최적화 제안:');
          console.log('- loading="eager" 속성 추가');
          console.log('- decoding="sync" 속성 추가');
          console.log('- 이미지 크기 최적화');
          console.log('- WebP/AVIF 포맷 사용');
          console.log('- 이미지 프리로드 추가');
          console.log('- 이미지 서버 응답 시간 최적화');
          console.log('- CDN 사용 고려');

          // 구체적인 최적화 제안
          const imgSrc = lcpEntry.element.src;
          if (imgSrc.includes('.jpg') || imgSrc.includes('.jpeg')) {
            console.log('- JPEG 이미지를 WebP로 변환 고려');
          }
          if (imgSrc.includes('.png')) {
            console.log('- PNG 이미지를 WebP로 변환 고려');
          }

          // 이미지 크기 분석
          const img = lcpEntry.element;
          if (img.naturalWidth > 800 || img.naturalHeight > 800) {
            console.log('- 이미지 크기가 큽니다. 적절한 크기로 리사이징 고려');
          }
        }
      } else if (lcpTime > 4000) {
        console.error('❌ LCP가 4초를 초과했습니다. 즉시 최적화가 필요합니다.');
      } else {
        console.log('✅ LCP 성능이 양호합니다.');
      }
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
      console.log('📐 CLS:', clsValue);

      if (clsValue > 0.1) {
        console.warn(
          '⚠️ CLS가 0.1을 초과했습니다. 레이아웃 안정성을 개선해야 합니다.'
        );
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const firstInputEntry = entry as PerformanceEntry & {
          processingStart?: number;
        };
        if (firstInputEntry.processingStart) {
          const fidTime = firstInputEntry.processingStart - entry.startTime;
          console.log('⚡ FID:', fidTime, 'ms');

          if (fidTime > 100) {
            console.warn(
              '⚠️ FID가 100ms를 초과했습니다. 메인 스레드 블로킹을 줄여야 합니다.'
            );
          }
        }
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // 이미지 로딩 성능 모니터링
    const imageObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource' && entry.name.includes('image')) {
          const resourceEntry = entry as PerformanceEntry & {
            transferSize?: number;
            encodedBodySize?: number;
          };

          console.log(`🖼️ 이미지 로딩: ${entry.name}`, {
            duration: Math.round(entry.duration),
            transferSize: resourceEntry.transferSize
              ? Math.round(resourceEntry.transferSize / 1024) + 'KB'
              : 'N/A',
            encodedBodySize: resourceEntry.encodedBodySize
              ? Math.round(resourceEntry.encodedBodySize / 1024) + 'KB'
              : 'N/A',
          });

          // 큰 이미지 경고
          if (
            resourceEntry.transferSize &&
            resourceEntry.transferSize > 500000
          ) {
            console.warn(
              `⚠️ 큰 이미지 감지: ${entry.name} (${Math.round(resourceEntry.transferSize / 1024)}KB)`
            );
          }

          // 느린 이미지 로딩 경고
          if (entry.duration > 2000) {
            console.warn(
              `⚠️ 느린 이미지 로딩: ${entry.name} (${Math.round(entry.duration)}ms)`
            );
          }
        }
      }
    });
    imageObserver.observe({ entryTypes: ['resource'] });
  }
};

/**
 * 이미지 로딩 성능 분석
 */
export const analyzeImagePerformance = () => {
  const images = document.querySelectorAll('img');
  const imageLoadTimes: Array<{ src: string; loadTime: number }> = [];

  images.forEach((img) => {
    const startTime = performance.now();

    if (img.complete) {
      // 이미 로드된 이미지
      imageLoadTimes.push({ src: img.src, loadTime: 0 });
    } else {
      // 로딩 중인 이미지
      img.addEventListener('load', () => {
        const loadTime = performance.now() - startTime;
        imageLoadTimes.push({ src: img.src, loadTime });

        if (loadTime > 1000) {
          console.warn(
            `⚠️ 이미지 로딩이 느립니다: ${img.src} (${loadTime.toFixed(0)}ms)`
          );
        }
      });
    }
  });

  return imageLoadTimes;
};

/**
 * 성능 최적화 제안
 */
export const getPerformanceRecommendations = () => {
  const recommendations = [];

  // 이미지 최적화 제안
  const images = document.querySelectorAll('img');
  const largeImages = Array.from(images).filter((img) => {
    const rect = img.getBoundingClientRect();
    return rect.width > 300 || rect.height > 300;
  });

  if (largeImages.length > 0) {
    recommendations.push({
      category: '이미지 최적화',
      suggestions: [
        '큰 이미지에 loading="lazy" 적용',
        'WebP/AVIF 포맷 사용',
        '적절한 이미지 크기로 리사이징',
        '이미지 압축 최적화',
      ],
    });
  }

  // 폰트 최적화 제안
  const fonts = document.querySelectorAll('link[rel="preload"][as="font"]');
  if (fonts.length === 0) {
    recommendations.push({
      category: '폰트 최적화',
      suggestions: [
        '중요한 폰트에 preload 적용',
        'font-display: swap 사용',
        '폰트 서브셋 최적화',
      ],
    });
  }

  return recommendations;
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
