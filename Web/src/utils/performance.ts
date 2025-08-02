/**
 * 성능 측정 및 최적화 유틸리티 (performance.ts)
 *
 * 웹 애플리케이션의 성능을 종합적으로 측정하고 최적화하는 도구들을 제공합니다.
 * Core Web Vitals 및 기타 성능 지표를 실시간으로 수집하고 분석하여
 * 사용자 경험 개선을 위한 인사이트를 제공합니다.
 *
 * @description
 * - Core Web Vitals 측정 (LCP, CLS, FID, TBT)
 * - 메모리 사용량 및 네트워크 상태 모니터링
 * - 이미지/폰트 성능 분석 및 최적화 권장
 * - 실시간 성능 모니터링 및 알림
 * - 성능 데이터 수집 및 분석 리포트 생성
 */

/**
 * 네트워크 연결 정보 인터페이스
 *
 * Network Information API를 통해 제공되는 네트워크 상태 정보를 정의합니다.
 * 사용자의 네트워크 환경을 파악하여 성능 최적화에 활용합니다.
 *
 * @property effectiveType - 연결 타입 (4g, 3g, 2g 등)
 * @property downlink - 다운로드 속도 (Mbps 단위)
 * @property rtt - 왕복 시간 (Round Trip Time, ms 단위)
 * @property saveData - 데이터 절약 모드 활성화 여부
 */
interface NetworkConnection {
  effectiveType: string; // 연결 타입 (4g, 3g 등)
  downlink: number; // 다운로드 속도 (Mbps)
  rtt: number; // 왕복 시간 (ms)
  saveData: boolean; // 데이터 절약 모드 여부
}

/**
 * 네트워크 정보를 포함한 Navigator 인터페이스
 *
 * 표준 Navigator 인터페이스를 확장하여 네트워크 연결 정보에 접근할 수 있도록 합니다.
 * 브라우저 호환성을 고려하여 선택적 속성으로 정의합니다.
 *
 * @property connection - 네트워크 연결 정보 (브라우저 지원 여부에 따라 선택적)
 */
interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection; // 네트워크 연결 정보
}

/**
 * 요소 정보를 포함한 성능 엔트리 인터페이스
 *
 * 표준 PerformanceEntry를 확장하여 DOM 요소와 관련된 추가 정보를 포함합니다.
 * 레이아웃 변화나 사용자 입력과 관련된 성능 측정에 활용됩니다.
 *
 * @property element - 성능 측정과 관련된 DOM 요소
 * @property hadRecentInput - 최근 사용자 입력 발생 여부
 * @property value - 측정된 성능 값
 * @property processingStart - 이벤트 처리 시작 시간
 */
interface PerformanceEntryWithElement extends PerformanceEntry {
  element?: Element; // 관련 DOM 요소
  hadRecentInput?: boolean; // 최근 사용자 입력 여부
  value?: number; // 성능 값
  processingStart?: number; // 처리 시작 시간
}

/**
 * 웹 성능 측정 지표 인터페이스
 *
 * Google에서 정의한 Core Web Vitals 및 기타 주요 성능 지표들을 정의합니다.
 * 사용자 경험을 정량적으로 평가하고 성능 최적화를 위한 기준으로 활용됩니다.
 *
 * @property loadTime - 페이지 완전 로드 시간 (ms)
 * @property domContentLoaded - DOM 콘텐츠 로드 완료 시간 (ms)
 * @property firstPaint - 첫 번째 픽셀 렌더링 시간 (ms)
 * @property firstContentfulPaint - 첫 번째 콘텐츠 렌더링 시간 (ms)
 * @property largestContentfulPaint - 가장 큰 콘텐츠 렌더링 시간 (ms)
 * @property cumulativeLayoutShift - 누적 레이아웃 변화량 (점수)
 * @property firstInputDelay - 첫 번째 사용자 입력 지연 시간 (ms)
 * @property timeToInteractive - 상호작용 가능 시간 (ms)
 * @property totalBlockingTime - 총 차단 시간 (ms)
 * @property speedIndex - 속도 지수 (점수)
 */
interface PerformanceMetrics {
  loadTime: number; // 페이지 로드 시간
  domContentLoaded: number; // DOM 콘텐츠 로드 완료 시간
  firstPaint: number; // 첫 번째 페인트 시간
  firstContentfulPaint: number; // 첫 번째 콘텐츠 페인트 시간
  largestContentfulPaint: number; // 가장 큰 콘텐츠 페인트 시간
  cumulativeLayoutShift: number; // 누적 레이아웃 변화량
  firstInputDelay: number; // 첫 번째 입력 지연 시간
  timeToInteractive: number; // 상호작용 가능 시간
  totalBlockingTime: number; // 총 차단 시간
  speedIndex: number; // 속도 지수
}

/**
 * JavaScript 힙 메모리 정보 인터페이스
 *
 * 브라우저의 JavaScript 힙 메모리 사용량을 추적하기 위한 정보를 정의합니다.
 * 메모리 누수 감지 및 성능 최적화에 활용됩니다.
 *
 * @property usedJSHeapSize - 현재 사용 중인 힙 메모리 크기 (bytes)
 * @property totalJSHeapSize - 할당된 총 힙 메모리 크기 (bytes)
 * @property jsHeapSizeLimit - 힙 메모리 최대 제한 크기 (bytes)
 */
interface MemoryInfo {
  usedJSHeapSize: number; // 사용 중인 힙 메모리
  totalJSHeapSize: number; // 총 힙 메모리
  jsHeapSizeLimit: number; // 힙 메모리 제한
}

/**
 * PerformanceWithMemory 인터페이스
 *
 * 메모리 정보를 포함한 Performance 인터페이스입니다.
 *
 * @property memory - 메모리 사용량 정보
 */
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number; // 사용 중인 힙 메모리
    totalJSHeapSize: number; // 총 힙 메모리
    jsHeapSizeLimit: number; // 힙 메모리 제한
  };
}

/**
 * performanceData 변수
 *
 * 측정된 성능 메트릭을 임시로 저장하는 객체입니다.
 */
const performanceData: Record<string, number> = {};

/**
 * PerformanceWarning 인터페이스
 *
 * 성능 임계값을 초과했을 때 생성되는 경고 정보입니다.
 *
 * @property type - 경고 유형
 * @property message - 경고 메시지
 * @property metric - 관련 메트릭
 * @property value - 측정된 값
 * @property threshold - 임계값
 * @property timestamp - 경고 발생 시간
 */
interface PerformanceWarning {
  type: 'warning' | 'error' | 'info'; // 경고 유형
  message: string; // 경고 메시지
  metric: string; // 관련 메트릭
  value: number; // 측정된 값
  threshold: number; // 임계값
  timestamp: number; // 경고 발생 시간
}

/**
 * performanceWarnings 변수
 *
 * 발생한 성능 경고들을 저장하는 배열입니다.
 */
const performanceWarnings: PerformanceWarning[] = [];

/**
 * collectPerformanceMetrics 함수
 *
 * Navigation Timing API를 사용하여 페이지 로드 성능을 측정하고
 * 내부 저장소에 저장합니다.
 *
 * @returns 수집된 성능 데이터 객체
 */
export const collectPerformanceMetrics = () => {
  const navigation = performance.getEntriesByType(
    'navigation'
  )[0] as PerformanceNavigationTiming;

  if (navigation) {
    // 페이지 로드 시간 측정
    performanceData.loadTime =
      navigation.loadEventEnd - navigation.loadEventStart;

    // DOM 콘텐츠 로드 완료 시간 측정
    performanceData.domContentLoaded =
      navigation.domContentLoadedEventEnd -
      navigation.domContentLoadedEventStart;

    // 첫 번째 페인트 시간 측정
    performanceData.firstPaint =
      navigation.responseStart - navigation.requestStart;

    // 첫 번째 콘텐츠 페인트 시간 측정
    performanceData.firstContentfulPaint =
      navigation.responseEnd - navigation.requestStart;
  }

  return performanceData;
};

/**
 * measurePageLoadPerformance 함수
 *
 * 페이지 로드 성능을 측정합니다.
 *
 * @returns PerformanceMetrics 객체
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
 * measureExecutionTime 함수
 *
 * 함수 실행 시간을 측정합니다.
 *
 * @template T - 함수 반환 타입
 * @param fn - 측정할 함수
 * @param name - 함수 이름
 * @returns 실행 결과와 실행 시간
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
 * getMemoryUsage 함수
 *
 * 메모리 사용량을 측정합니다.
 *
 * @returns MemoryInfo 객체 또는 null
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
 * getNetworkInfo 함수
 *
 * 네트워크 정보를 측정합니다.
 *
 * @returns NetworkConnection 객체 또는 null
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
 * exportPerformanceData 함수
 *
 * 성능 데이터를 내보냅니다.
 *
 * @returns 성능 데이터 객체
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
 * setupPerformanceObservers 함수
 *
 * 성능 관찰자를 설정합니다.
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
 * addPerformanceWarning 함수
 *
 * 성능 경고를 추가합니다.
 *
 * @param type - 경고 유형
 * @param message - 경고 메시지
 * @param metric - 관련 메트릭
 * @param value - 측정된 값
 * @param threshold - 임계값
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

/**
 * ImageAnalysis 인터페이스
 *
 * 이미지 성능 분석 결과를 담는 인터페이스입니다.
 *
 * @property src - 이미지 소스 URL
 * @property naturalWidth - 원본 너비
 * @property naturalHeight - 원본 높이
 * @property displayWidth - 표시 너비
 * @property displayHeight - 표시 높이
 * @property loading - 로딩 속성
 * @property decoding - 디코딩 속성
 * @property complete - 로딩 완료 여부
 * @property fileSize - 파일 크기
 * @property suggestions - 최적화 제안사항
 */
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
 * analyzeImagePerformance 함수
 *
 * 이미지 성능을 분석합니다.
 *
 * @returns ImageAnalysis 배열
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

/**
 * FontAnalysis 인터페이스
 *
 * 폰트 성능 분석 결과를 담는 인터페이스입니다.
 *
 * @property family - 폰트 패밀리
 * @property weight - 폰트 굵기
 * @property style - 폰트 스타일
 * @property status - 폰트 상태
 * @property loaded - 폰트 로딩 Promise
 */
interface FontAnalysis {
  family: string;
  weight: string;
  style: string;
  status: string;
  loaded: Promise<FontFace>;
}

/**
 * analyzeFontPerformance 함수
 *
 * 폰트 성능을 분석합니다.
 *
 * @returns FontAnalysis 배열
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

/**
 * UnusedPreload 인터페이스
 *
 * 사용되지 않는 프리로드 리소스 정보를 담는 인터페이스입니다.
 *
 * @property href - 리소스 URL
 * @property as - 리소스 타입
 * @property reason - 미사용 이유
 */
interface UnusedPreload {
  href: string | null;
  as: string | null;
  reason: string;
}

/**
 * optimizeResourcePreloading 함수
 *
 * 리소스 프리로딩을 최적화합니다.
 *
 * @returns UnusedPreload 배열
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
 * getPerformanceRecommendations 함수
 *
 * 성능 권장사항을 생성합니다.
 *
 * @returns 성능 권장사항 배열
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
 * generatePerformanceReport 함수
 *
 * 성능 리포트를 생성합니다.
 *
 * @returns 성능 리포트 객체
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
 * calculatePerformanceScore 함수
 *
 * 성능 점수를 계산합니다.
 *
 * @param metrics - 성능 메트릭
 * @returns 성능 점수 (0-100)
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
 * collectAndSendPerformanceData 함수
 *
 * 성능 데이터를 수집하고 전송합니다.
 *
 * @param endpoint - 전송할 엔드포인트
 * @returns 전송 결과
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
 * startPerformanceMonitoring 함수
 *
 * 실시간 성능 모니터링을 시작합니다.
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
 * applyPerformanceOptimizations 함수
 *
 * 성능 최적화를 자동으로 적용합니다.
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
