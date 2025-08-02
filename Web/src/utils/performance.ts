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

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
}

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

// 성능 경고 시스템
interface PerformanceWarning {
  type: 'warning' | 'error' | 'info';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
}

const performanceWarnings: PerformanceWarning[] = [];

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
    performanceData.firstPaint =
      navigation.responseStart - navigation.requestStart;
    performanceData.firstContentfulPaint =
      navigation.responseEnd - navigation.requestStart;
  }

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
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded:
      navigation.domContentLoadedEventEnd -
      navigation.domContentLoadedEventStart,
    firstPaint: navigation.responseStart - navigation.requestStart,
    firstContentfulPaint: navigation.responseEnd - navigation.requestStart,
    largestContentfulPaint: performanceData.largestContentfulPaint || 0,
    cumulativeLayoutShift: performanceData.cumulativeLayoutShift || 0,
    firstInputDelay: performanceData.firstInputDelay || 0,
    timeToInteractive: performanceData.timeToInteractive || 0,
    totalBlockingTime: performanceData.totalBlockingTime || 0,
    speedIndex: performanceData.speedIndex || 0,
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
    warnings: performanceWarnings,
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

          // 성능 경고 추가
          addPerformanceWarning(
            'warning',
            'LCP 이미지 최적화 필요',
            'lcp',
            lcpTime,
            2500
          );
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
        addPerformanceWarning(
          'error',
          'CLS 성능 개선 필요',
          'cls',
          clsValue,
          0.1
        );
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
          console.log('- 긴 작업 분할하기');
          console.log('- 메인 스레드 블로킹 방지');
          addPerformanceWarning(
            'warning',
            'FID 성능 개선 필요',
            'fid',
            fid,
            100
          );
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
        const blockingTime = Math.max(0, entry.duration - 50);
        totalBlockingTime += blockingTime;
      }

      performanceData.totalBlockingTime = totalBlockingTime;

      if (totalBlockingTime > 300) {
        console.warn('⚠️ TBT가 높습니다:', totalBlockingTime, 'ms');
        console.log('🔧 TBT 최적화 제안:');
        console.log('- 긴 JavaScript 작업 분할');
        console.log('- Web Workers 사용');
        console.log('- 코드 스플리팅 적용');
        addPerformanceWarning(
          'error',
          'TBT 성능 개선 필요',
          'tbt',
          totalBlockingTime,
          300
        );
      } else {
        console.log('✅ TBT 성능이 양호합니다:', totalBlockingTime, 'ms');
      }
    });
    tbtObserver.observe({ entryTypes: ['longtask'] });
  }
};

/**
 * 성능 경고 추가
 */
const addPerformanceWarning = (
  type: 'warning' | 'error' | 'info',
  message: string,
  metric: string,
  value: number,
  threshold: number
) => {
  performanceWarnings.push({
    type,
    message,
    metric,
    value,
    threshold,
    timestamp: Date.now(),
  });
};

interface ImageAnalysis {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  displayWidth: number;
  displayHeight: number;
  loading: string | null;
  decoding: string | null;
  complete: boolean;
  fileSize: number;
  suggestions: string[];
}

/**
 * 이미지 성능 분석
 */
export const analyzeImagePerformance = (): ImageAnalysis[] => {
  const images = document.querySelectorAll('img');
  const imageAnalysis: ImageAnalysis[] = [];

  images.forEach((img) => {
    const analysis: ImageAnalysis = {
      src: img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth: img.width,
      displayHeight: img.height,
      loading: img.loading,
      decoding: img.decoding,
      complete: img.complete,
      fileSize: 0, // 실제 파일 크기는 네트워크 탭에서 확인 필요
      suggestions: [],
    };

    // 이미지 최적화 제안
    if (img.naturalWidth > 800 || img.naturalHeight > 800) {
      analysis.suggestions.push('이미지 크기 최적화 필요');
    }

    if (!img.loading || img.loading === 'lazy') {
      if (img === document.querySelector('img[loading="eager"]')) {
        analysis.suggestions.push('LCP 이미지에 eager 로딩 적용됨');
      } else {
        analysis.suggestions.push('lazy 로딩 적용됨');
      }
    }

    if (
      img.src.includes('.jpg') ||
      img.src.includes('.jpeg') ||
      img.src.includes('.png')
    ) {
      analysis.suggestions.push('WebP 포맷 변환 고려');
    }

    imageAnalysis.push(analysis);
  });

  return imageAnalysis;
};

interface FontAnalysis {
  family: string;
  weight: string;
  style: string;
  status: string;
  loaded: Promise<FontFace>;
}

/**
 * 폰트 성능 분석
 */
export const analyzeFontPerformance = (): FontAnalysis[] => {
  const fontAnalysis: FontAnalysis[] = [];

  // 폰트 로딩 상태 확인
  if ('fonts' in document) {
    document.fonts.ready.then(() => {
      const loadedFonts = Array.from(document.fonts);

      loadedFonts.forEach((font) => {
        const analysis: FontAnalysis = {
          family: font.family,
          weight: font.weight,
          style: font.style,
          status: font.status,
          loaded: font.loaded,
        };

        if (font.status === 'loading') {
          addPerformanceWarning('warning', '폰트 로딩 지연', 'font', 0, 0);
        }

        fontAnalysis.push(analysis);
      });
    });
  }

  return fontAnalysis;
};

interface UnusedPreload {
  href: string | null;
  as: string | null;
  reason: string;
}

/**
 * 리소스 프리로딩 최적화
 */
export const optimizeResourcePreloading = (): UnusedPreload[] => {
  const preloadLinks = document.querySelectorAll('link[rel="preload"]');
  const unusedPreloads: UnusedPreload[] = [];

  preloadLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const as = link.getAttribute('as');

    // 프리로드된 리소스가 실제로 사용되었는지 확인
    if (as === 'font') {
      const fontFamily = href
        ?.split('/')
        .pop()
        ?.replace('.woff2', '')
        .replace('.otf', '');
      const isUsed = document.fonts.check(`12px ${fontFamily}`);

      if (!isUsed) {
        unusedPreloads.push({ href, as, reason: '폰트 미사용' });
      }
    } else if (as === 'image') {
      const img = document.querySelector(`img[src="${href}"]`);
      if (!img) {
        unusedPreloads.push({ href, as, reason: '이미지 미사용' });
      }
    }
  });

  if (unusedPreloads.length > 0) {
    console.warn('⚠️ 사용되지 않는 프리로드 리소스:', unusedPreloads);
    addPerformanceWarning(
      'info',
      '사용되지 않는 프리로드 리소스 발견',
      'preload',
      unusedPreloads.length,
      0
    );
  }

  return unusedPreloads;
};

/**
 * 성능 권장사항 생성
 */
export const getPerformanceRecommendations = () => {
  const recommendations = [];
  const metrics = measurePageLoadPerformance();

  // LCP 최적화
  if (metrics.largestContentfulPaint > 2500) {
    recommendations.push({
      priority: 'high',
      category: 'lcp',
      title: 'LCP 최적화',
      description: 'Largest Contentful Paint를 2.5초 이하로 개선하세요',
      actions: [
        '이미지 최적화 (WebP 변환, 적절한 크기)',
        '중요한 이미지에 loading="eager" 적용',
        '이미지 프리로딩',
        'CDN 사용',
      ],
    });
  }

  // CLS 최적화
  if (metrics.cumulativeLayoutShift > 0.1) {
    recommendations.push({
      priority: 'high',
      category: 'cls',
      title: 'CLS 최적화',
      description: 'Cumulative Layout Shift를 0.1 이하로 개선하세요',
      actions: [
        '이미지에 width/height 속성 추가',
        '광고/임베드 요소에 고정 크기 설정',
        '동적 콘텐츠 로딩 시 레이아웃 시프트 방지',
      ],
    });
  }

  // TBT 최적화
  if (metrics.totalBlockingTime > 300) {
    recommendations.push({
      priority: 'medium',
      category: 'tbt',
      title: 'TBT 최적화',
      description: 'Total Blocking Time을 300ms 이하로 개선하세요',
      actions: [
        '긴 JavaScript 작업 분할',
        'Web Workers 사용',
        '코드 스플리팅 적용',
        '번들 크기 최적화',
      ],
    });
  }

  return recommendations;
};

/**
 * 성능 리포트 생성
 */
export const generatePerformanceReport = () => {
  const metrics = measurePageLoadPerformance();
  const memoryInfo = getMemoryUsage();
  const networkInfo = getNetworkInfo();
  const imageAnalysis = analyzeImagePerformance();
  const fontAnalysis = analyzeFontPerformance();
  const unusedPreloads = optimizeResourcePreloading();
  const recommendations = getPerformanceRecommendations();

  return {
    timestamp: new Date().toISOString(),
    metrics,
    memory: memoryInfo,
    network: networkInfo,
    images: imageAnalysis,
    fonts: fontAnalysis,
    unusedPreloads,
    recommendations,
    warnings: performanceWarnings,
    score: calculatePerformanceScore(metrics),
  };
};

/**
 * 성능 점수 계산
 */
const calculatePerformanceScore = (metrics: PerformanceMetrics): number => {
  let score = 100;

  // LCP 점수 (40% 가중치)
  if (metrics.largestContentfulPaint > 4000) score -= 40;
  else if (metrics.largestContentfulPaint > 2500) score -= 20;
  else if (metrics.largestContentfulPaint > 1500) score -= 10;

  // CLS 점수 (30% 가중치)
  if (metrics.cumulativeLayoutShift > 0.25) score -= 30;
  else if (metrics.cumulativeLayoutShift > 0.1) score -= 15;
  else if (metrics.cumulativeLayoutShift > 0.05) score -= 5;

  // TBT 점수 (20% 가중치)
  if (metrics.totalBlockingTime > 600) score -= 20;
  else if (metrics.totalBlockingTime > 300) score -= 10;
  else if (metrics.totalBlockingTime > 150) score -= 5;

  // FID 점수 (10% 가중치)
  if (metrics.firstInputDelay > 300) score -= 10;
  else if (metrics.firstInputDelay > 100) score -= 5;

  return Math.max(0, score);
};

/**
 * 성능 데이터 수집 및 전송
 */
export const collectAndSendPerformanceData = async (endpoint: string) => {
  try {
    const report = generatePerformanceReport();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ 성능 데이터 전송 완료');
    return await response.json();
  } catch (error) {
    console.error('❌ 성능 데이터 전송 실패:', error);
    throw error;
  }
};

/**
 * 실시간 성능 모니터링 시작
 */
export const startPerformanceMonitoring = () => {
  // 초기 성능 데이터 수집
  collectPerformanceMetrics();

  // 성능 관찰자 설정
  setupPerformanceObservers();

  // 주기적 성능 체크
  setInterval(() => {
    const memoryInfo = getMemoryUsage();
    if (
      memoryInfo &&
      memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.8
    ) {
      addPerformanceWarning(
        'error',
        '메모리 사용량 높음',
        'memory',
        memoryInfo.usedJSHeapSize,
        memoryInfo.jsHeapSizeLimit * 0.8
      );
    }
  }, 10000); // 10초마다 체크

  console.log('🚀 성능 모니터링 시작됨');
};

/**
 * 성능 최적화 자동 적용
 */
export const applyPerformanceOptimizations = () => {
  // 이미지 최적화
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    // LCP 이미지에 eager 로딩 적용
    if (img === document.querySelector('img[loading="eager"]')) {
      img.loading = 'eager';
      img.decoding = 'sync';
    } else {
      // 나머지 이미지는 lazy 로딩
      if (!img.loading) {
        img.loading = 'lazy';
      }
    }
  });

  // 폰트 최적화
  const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
  fontLinks.forEach((link) => {
    link.setAttribute('crossorigin', 'anonymous');
  });

  console.log('🔧 성능 최적화 자동 적용 완료');
};
