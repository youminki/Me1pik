/**
 * 성능 측정 유틸리티
 */

// 네트워크 연결 타입 정의
interface NetworkConnection {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

// Navigator 확장 타입 정의
interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
}

// PerformanceEntry 확장 타입 정의
interface PerformanceEntryWithElement extends PerformanceEntry {
  element?: Element;
  hadRecentInput?: boolean;
  value?: number;
  processingStart?: number;
}

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  speedIndex: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// 성능 데이터 저장소
const performanceData: Record<string, number> = {};

/**
 * 성능 메트릭 수집 및 저장
 */
export const collectPerformanceMetrics = () => {
  const navigation = performance.getEntriesByType(
    'navigation'
  )[0] as PerformanceNavigationTiming;

  if (navigation) {
    performanceData.loadTime =
      navigation.loadEventEnd - navigation.loadEventStart;
    performanceData.domContentLoaded =
      navigation.domContentLoadedEventEnd -
      navigation.domContentLoadedEventStart;
  }

  // Paint Timing API
  const paintEntries = performance.getEntriesByType('paint');
  paintEntries.forEach((entry) => {
    if (entry.name === 'first-paint') {
      performanceData.firstPaint = entry.startTime;
    }
    if (entry.name === 'first-contentful-paint') {
      performanceData.firstContentfulPaint = entry.startTime;
    }
  });

  return performanceData;
};

/**
 * 페이지 로드 성능 측정
 */
export const measurePageLoadPerformance = (): PerformanceMetrics => {
  const navigation = performance.getEntriesByType(
    'navigation'
  )[0] as PerformanceNavigationTiming;

  return {
    loadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
    domContentLoaded:
      navigation?.domContentLoadedEventEnd -
        navigation?.domContentLoadedEventStart || 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    timeToInteractive: 0,
    totalBlockingTime: 0,
    speedIndex: 0,
  };
};

/**
 * 함수 실행 시간 측정
 */
export const measureExecutionTime = async <T>(
  fn: () => Promise<T> | T,
  name: string
): Promise<{ result: T; executionTime: number }> => {
  const startTime = performance.now();
  const result = await fn();
  const executionTime = performance.now() - startTime;

  performanceData[name] = executionTime;
  return { result, executionTime };
};

/**
 * 메모리 사용량 측정
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
 * 성능 데이터 내보내기
 */
export const exportPerformanceData = () => {
  const memoryInfo = getMemoryUsage();
  const nav = navigator as NavigatorWithConnection;
  return {
    ...performanceData,
    memory: memoryInfo,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    connection: nav.connection?.effectiveType || 'unknown',
  };
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

      // LCP 데이터 저장
      performanceData.largestContentfulPaint = lcpTime;

      // 성능 분석 및 제안
      if (lcpTime > 2500) {
        // LCP 요소가 이미지인 경우 최적화 제안
        const lcpEntry = lastEntry as PerformanceEntryWithElement;
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
      } else {
        console.log('✅ LCP 성능이 양호합니다:', lcpTime, 'ms');
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        const clsEntry = entry as PerformanceEntryWithElement;
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value || 0;
        }
      }

      // CLS 데이터 저장
      performanceData.cumulativeLayoutShift = clsValue;

      if (clsValue > 0.1) {
        console.warn('⚠️ CLS가 높습니다:', clsValue);
        console.log('🔧 CLS 최적화 제안:');
        console.log('- 이미지에 width/height 속성 추가');
        console.log('- 광고/임베드 요소에 고정 크기 설정');
        console.log('- 동적 콘텐츠 로딩 시 레이아웃 시프트 방지');
      } else {
        console.log('✅ CLS 성능이 양호합니다:', clsValue);
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as PerformanceEntryWithElement;
        const fid = (fidEntry.processingStart || 0) - entry.startTime;

        // FID 데이터 저장
        performanceData.firstInputDelay = fid;

        if (fid > 100) {
          console.warn('⚠️ FID가 높습니다:', fid, 'ms');
          console.log('🔧 FID 최적화 제안:');
          console.log('- JavaScript 번들 크기 줄이기');
          console.log('- 코드 스플리팅 적용');
          console.log('- 메인 스레드 블로킹 작업 최소화');
        } else {
          console.log('✅ FID 성능이 양호합니다:', fid, 'ms');
        }
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Total Blocking Time (TBT)
    const tbtObserver = new PerformanceObserver((list) => {
      let totalBlockingTime = 0;
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          totalBlockingTime += entry.duration - 50;
        }
      }

      // TBT 데이터 저장
      performanceData.totalBlockingTime = totalBlockingTime;

      if (totalBlockingTime > 300) {
        console.warn('⚠️ TBT가 높습니다:', totalBlockingTime, 'ms');
        console.log('🔧 TBT 최적화 제안:');
        console.log('- 긴 태스크 분할');
        console.log('- Web Workers 활용');
        console.log('- 비동기 처리 최적화');
      } else {
        console.log('✅ TBT 성능이 양호합니다:', totalBlockingTime, 'ms');
      }
    });
    tbtObserver.observe({ entryTypes: ['longtask'] });
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
 * 성능 최적화 권장사항 생성
 */
export const getPerformanceRecommendations = () => {
  const recommendations: Array<{
    category: string;
    suggestions: string[];
  }> = [];

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
 * 성능 리포트 생성
 */
export const generatePerformanceReport = () => {
  const metrics = collectPerformanceMetrics();
  const memoryInfo = getMemoryUsage();
  const nav = navigator as NavigatorWithConnection;

  const report = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    metrics,
    memory: memoryInfo,
    userAgent: navigator.userAgent,
    connection: nav.connection?.effectiveType || 'unknown',
    recommendations: [] as string[],
  };

  // 성능 권장사항 생성
  if (metrics.largestContentfulPaint > 2500) {
    report.recommendations.push(
      'LCP 최적화 필요: 이미지 최적화, 서버 응답 시간 개선'
    );
  }
  if (metrics.cumulativeLayoutShift > 0.1) {
    report.recommendations.push('CLS 최적화 필요: 레이아웃 시프트 방지');
  }
  if (metrics.firstInputDelay > 100) {
    report.recommendations.push('FID 최적화 필요: JavaScript 최적화');
  }
  if (metrics.totalBlockingTime > 300) {
    report.recommendations.push('TBT 최적화 필요: 긴 태스크 분할');
  }

  return report;
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
