// 성능 모니터링 유틸리티

interface PerformanceMetrics {
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  fid: number | null;
  ttfb: number | null;
  fcp: number | null;
  fmp: number | null;
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
  network: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null;
}

interface PerformanceObserver {
  observe: (options: { entryTypes: string[] }) => void;
  disconnect: () => void;
}

interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
}

interface LargestContentfulPaintEntry extends PerformanceEntry {
  size: number;
  id: string;
  url: string;
}

interface PerformanceObserverEntryList {
  getEntries(): PerformanceEntry[];
}

interface WindowWithPerformanceObserver extends Window {
  PerformanceObserver: new (
    callback: (list: PerformanceObserverEntryList) => void
  ) => PerformanceObserver;
}

interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    lcp: null,
    cls: null,
    inp: null,
    fid: null,
    ttfb: null,
    fcp: null,
    fmp: null,
    memory: null,
    network: null,
  };

  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor() {
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    // 기본 네비게이션 메트릭 수집
    this.collectNavigationMetrics();

    // 네트워크 정보 수집
    this.collectNetworkInfo();

    // 메모리 정보 수집
    this.collectMemoryInfo();
  }

  public startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('🚀 성능 모니터링 시작');

    // LCP (Largest Contentful Paint) 모니터링
    this.observeLCP();

    // CLS (Cumulative Layout Shift) 모니터링
    this.observeCLS();

    // FID (First Input Delay) 모니터링
    this.observeFID();

    // INP (Interaction to Next Paint) 모니터링
    this.observeINP();

    // FCP (First Contentful Paint) 모니터링
    this.observeFCP();

    // FMP (First Meaningful Paint) 모니터링
    this.observeFMP();
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    console.log('⏹️ 성능 모니터링 중지');
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getMetricsReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: this.getMetricsSummary(),
    };

    return JSON.stringify(report, null, 2);
  }

  private getMetricsSummary(): Record<string, string> {
    const summary: Record<string, string> = {};

    // LCP 평가
    if (this.metrics.lcp !== null) {
      if (this.metrics.lcp <= 2500) summary.lcp = '좋음';
      else if (this.metrics.lcp <= 4000) summary.lcp = '보통';
      else summary.lcp = '나쁨';
    }

    // CLS 평가
    if (this.metrics.cls !== null) {
      if (this.metrics.cls <= 0.1) summary.cls = '좋음';
      else if (this.metrics.cls <= 0.25) summary.cls = '보통';
      else summary.cls = '나쁨';
    }

    // FID 평가
    if (this.metrics.fid !== null) {
      if (this.metrics.fid <= 100) summary.fid = '좋음';
      else if (this.metrics.fid <= 300) summary.fid = '보통';
      else summary.fid = '나쁨';
    }

    // INP 평가
    if (this.metrics.inp !== null) {
      if (this.metrics.inp <= 200) summary.inp = '좋음';
      else if (this.metrics.inp <= 500) summary.inp = '보통';
      else summary.inp = '나쁨';
    }

    return summary;
  }

  private observeLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new (
      window as WindowWithPerformanceObserver
    ).PerformanceObserver((list: PerformanceObserverEntryList) => {
      const entries = list.getEntries();
      const lastEntry = entries[
        entries.length - 1
      ] as LargestContentfulPaintEntry;

      this.metrics.lcp = lastEntry.startTime;
      console.log('📊 LCP 측정:', this.metrics.lcp, 'ms');
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(observer);
  }

  private observeCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    const observer = new (
      window as WindowWithPerformanceObserver
    ).PerformanceObserver((list: PerformanceObserverEntryList) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as LayoutShiftEntry;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
        }
      }
      this.metrics.cls = clsValue;
      console.log('📊 CLS 측정:', this.metrics.cls);
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(observer);
  }

  private observeFID(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new (
      window as WindowWithPerformanceObserver
    ).PerformanceObserver((list: PerformanceObserverEntryList) => {
      const entries = list.getEntries();
      const firstEntry = entries[0] as FirstInputEntry;

      this.metrics.fid = firstEntry.processingStart - firstEntry.startTime;
      console.log('📊 FID 측정:', this.metrics.fid, 'ms');
    });

    observer.observe({ entryTypes: ['first-input'] });
    this.observers.push(observer);
  }

  private observeINP(): void {
    if (!('PerformanceObserver' in window)) return;

    let maxInp = 0;
    const observer = new (
      window as WindowWithPerformanceObserver
    ).PerformanceObserver((list: PerformanceObserverEntryList) => {
      const entries = list.getEntries();

      for (const entry of entries) {
        const firstInputEntry = entry as FirstInputEntry;
        const inp = firstInputEntry.processingStart - firstInputEntry.startTime;
        if (inp > maxInp) maxInp = inp;
      }

      this.metrics.inp = maxInp;
      console.log('📊 INP 측정:', this.metrics.inp, 'ms');
    });

    observer.observe({ entryTypes: ['interaction'] });
    this.observers.push(observer);
  }

  private observeFCP(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new (
      window as WindowWithPerformanceObserver
    ).PerformanceObserver((list: PerformanceObserverEntryList) => {
      const entries = list.getEntries();
      const firstEntry = entries[0];

      this.metrics.fcp = firstEntry.startTime;
      console.log('📊 FCP 측정:', this.metrics.fcp, 'ms');
    });

    observer.observe({ entryTypes: ['paint'] });
    this.observers.push(observer);
  }

  private observeFMP(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new (
      window as WindowWithPerformanceObserver
    ).PerformanceObserver((list: PerformanceObserverEntryList) => {
      const entries = list.getEntries();
      const firstEntry = entries[0];

      this.metrics.fmp = firstEntry.startTime;
      console.log('📊 FMP 측정:', this.metrics.fmp, 'ms');
    });

    observer.observe({ entryTypes: ['measure'] });
    this.observers.push(observer);
  }

  private collectNavigationMetrics(): void {
    const navigationEntry = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      this.metrics.ttfb =
        navigationEntry.responseStart - navigationEntry.requestStart;
      console.log('📊 TTFB 측정:', this.metrics.ttfb, 'ms');
    }
  }

  private collectNetworkInfo(): void {
    const connection = (navigator as NavigatorWithConnection).connection;
    if (connection) {
      this.metrics.network = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      };
      console.log('📊 네트워크 정보:', this.metrics.network);
    }
  }

  private collectMemoryInfo(): void {
    const memory = (performance as PerformanceWithMemory).memory;
    if (memory) {
      this.metrics.memory = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
      console.log('📊 메모리 정보:', this.metrics.memory);
    }
  }

  // 성능 최적화 제안
  public getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];

    if (this.metrics.lcp && this.metrics.lcp > 4000) {
      suggestions.push(
        'LCP가 느립니다. 이미지 최적화와 서버 응답 시간 개선이 필요합니다.'
      );
    }

    if (this.metrics.cls && this.metrics.cls > 0.25) {
      suggestions.push(
        'CLS가 높습니다. 레이아웃 시프트를 줄이기 위해 이미지 크기를 명시하고 광고를 최적화하세요.'
      );
    }

    if (this.metrics.fid && this.metrics.fid > 300) {
      suggestions.push(
        'FID가 느립니다. JavaScript 번들 크기를 줄이고 코드 분할을 적용하세요.'
      );
    }

    if (this.metrics.inp && this.metrics.inp > 500) {
      suggestions.push(
        'INP가 느립니다. 이벤트 핸들러를 최적화하고 긴 작업을 분할하세요.'
      );
    }

    if (this.metrics.ttfb && this.metrics.ttfb > 600) {
      suggestions.push(
        'TTFB가 느립니다. 서버 응답 시간을 개선하고 CDN을 사용하세요.'
      );
    }

    return suggestions;
  }

  // 실시간 모니터링 시작
  public startRealTimeMonitoring(
    callback?: (metrics: PerformanceMetrics) => void
  ): void {
    this.startMonitoring();

    // 5초마다 메트릭 업데이트
    const interval = setInterval(() => {
      if (!this.isMonitoring) {
        clearInterval(interval);
        return;
      }

      if (callback) {
        callback(this.getMetrics());
      }
    }, 5000);
  }
}

// 싱글톤 인스턴스 생성
export const performanceMonitor = new PerformanceMonitor();

// 편의 함수들
export const startPerformanceMonitoring = () =>
  performanceMonitor.startMonitoring();
export const stopPerformanceMonitoring = () =>
  performanceMonitor.stopMonitoring();
export const getPerformanceMetrics = () => performanceMonitor.getMetrics();
export const getPerformanceReport = () => performanceMonitor.getMetricsReport();
export const getOptimizationSuggestions = () =>
  performanceMonitor.getOptimizationSuggestions();
export const startRealTimeMonitoring = (
  callback?: (metrics: PerformanceMetrics) => void
) => performanceMonitor.startRealTimeMonitoring(callback);
