// 성능 메트릭 타입 정의
interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
}

interface UserAction {
  action: string;
  category: string;
  timestamp: number;
  properties: Record<string, unknown>;
}

class MonitoringService {
  private static instance: MonitoringService;
  private sessionId: string;
  private userId?: string;
  private performanceObserver?: PerformanceObserver;
  private errorLogs: ErrorLog[] = [];
  private userActions: UserAction[] = [];
  private isInitialized = false;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeMonitoring();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMonitoring(): void {
    if (this.isInitialized) return;

    // 성능 모니터링 초기화
    this.initializePerformanceMonitoring();

    // 에러 모니터링 초기화
    this.initializeErrorMonitoring();

    // 사용자 액션 모니터링 초기화
    this.initializeUserActionMonitoring();

    // 주기적 데이터 전송
    this.startPeriodicDataTransmission();

    this.isInitialized = true;
    console.log('🔍 모니터링 시스템 초기화 완료');
  }

  private initializePerformanceMonitoring(): void {
    // LCP (Largest Contentful Paint) 모니터링
    this.performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      if (lastEntry.entryType === 'largest-contentful-paint') {
        this.trackPerformanceMetric('lcp', lastEntry.startTime);
      }
    });

    this.performanceObserver.observe({
      entryTypes: ['largest-contentful-paint'],
    });

    // FID (First Input Delay) 모니터링
    this.performanceObserver.observe({ entryTypes: ['first-input'] });

    // CLS (Cumulative Layout Shift) 모니터링
    this.performanceObserver.observe({ entryTypes: ['layout-shift'] });

    // 네비게이션 타이밍 모니터링
    this.performanceObserver.observe({ entryTypes: ['navigation'] });
  }

  private initializeErrorMonitoring(): void {
    // 전역 에러 핸들러
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.userId,
        sessionId: this.sessionId,
      });
    });

    // Promise 에러 핸들러
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.userId,
        sessionId: this.sessionId,
      });
    });
  }

  private initializeUserActionMonitoring(): void {
    // 클릭 이벤트 모니터링
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target) {
        this.trackUserAction('click', {
          element: target.tagName.toLowerCase(),
          className: target.className,
          id: target.id,
          text: target.textContent?.substring(0, 50),
        });
      }
    });

    // 페이지 뷰 모니터링
    this.trackPageView();
  }

  private trackPerformanceMetric(
    metric: keyof PerformanceMetrics,
    value: number
  ): void {
    const metricData = {
      metric,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId,
    };

    // 로컬 저장소에 임시 저장
    const storedMetrics = JSON.parse(
      localStorage.getItem('performance_metrics') || '[]'
    );
    storedMetrics.push(metricData);
    localStorage.setItem(
      'performance_metrics',
      JSON.stringify(storedMetrics.slice(-100))
    );

    // 임계값 초과 시 즉시 전송
    if (value > this.getPerformanceThreshold(metric)) {
      this.sendPerformanceAlert(metricData);
    }
  }

  private getPerformanceThreshold(metric: keyof PerformanceMetrics): number {
    const thresholds = {
      fcp: 1800, // 1.8초
      lcp: 2500, // 2.5초
      fid: 100, // 100ms
      cls: 0.1, // 0.1
      ttfb: 800, // 800ms
    };
    return thresholds[metric] || 0;
  }

  private trackError(error: ErrorLog): void {
    this.errorLogs.push(error);

    // 에러 로그가 10개 이상이면 즉시 전송
    if (this.errorLogs.length >= 10) {
      this.sendErrorLogs();
    }
  }

  private trackUserAction(
    action: string,
    properties: Record<string, unknown> = {}
  ): void {
    this.userActions.push({
      action,
      category: 'user_interaction',
      timestamp: Date.now(),
      properties: {
        ...properties,
        url: window.location.href,
        userId: this.userId,
        sessionId: this.sessionId,
      },
    });
  }

  private trackPageView(): void {
    this.trackUserAction('page_view', {
      page: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
    });
  }

  private startPeriodicDataTransmission(): void {
    // 30초마다 데이터 전송
    setInterval(() => {
      this.sendMonitoringData();
    }, 30000);

    // 페이지 언로드 시 데이터 전송
    window.addEventListener('beforeunload', () => {
      this.sendMonitoringData();
    });
  }

  private async sendMonitoringData(): Promise<void> {
    try {
      const data = {
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        performanceMetrics: this.getPerformanceMetrics(),
        errorLogs: [...this.errorLogs],
        userActions: [...this.userActions],
      };

      // 개발 환경에서만 콘솔에 로깅
      if (import.meta.env.DEV) {
        console.log('📊 모니터링 데이터:', data);
      }

      // 실제 API 엔드포인트가 준비되면 주석 해제
      // await Axios.post('/api/monitoring/logs', data);

      // 전송 후 로그 초기화
      this.errorLogs = [];
      this.userActions = [];
    } catch (error) {
      console.error('모니터링 데이터 전송 실패:', error);
    }
  }

  private async sendPerformanceAlert(
    metricData: Record<string, unknown>
  ): Promise<void> {
    try {
      // 개발 환경에서만 콘솔에 로깅
      if (import.meta.env.DEV) {
        console.log('⚠️ 성능 알림:', metricData);
      }

      // 실제 API 엔드포인트가 준비되면 주석 해제
      // await Axios.post('/api/monitoring/alerts', {
      //   type: 'performance_alert',
      //   data: metricData,
      // });
    } catch (error) {
      console.error('성능 알림 전송 실패:', error);
    }
  }

  private async sendErrorLogs(): Promise<void> {
    try {
      // 개발 환경에서만 콘솔에 로깅
      if (import.meta.env.DEV) {
        console.log('❌ 에러 로그:', this.errorLogs);
      }

      // 실제 API 엔드포인트가 준비되면 주석 해제
      // await Axios.post('/api/monitoring/errors', {
      //   errors: [...this.errorLogs],
      // });
      this.errorLogs = [];
    } catch (error) {
      console.error('에러 로그 전송 실패:', error);
    }
  }

  private getPerformanceMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    return {
      fcp: 0, // FCP는 별도 측정 필요
      lcp: 0, // LCP는 별도 측정 필요
      fid: 0, // FID는 별도 측정 필요
      cls: 0, // CLS는 별도 측정 필요
      ttfb: navigation ? navigation.responseStart - navigation.requestStart : 0,
    };
  }

  // 공개 메서드들
  setUserId(userId: string): void {
    this.userId = userId;
  }

  trackCustomEvent(
    eventName: string,
    properties: Record<string, unknown> = {}
  ): void {
    this.trackUserAction(eventName, properties);
  }

  trackApiCall(
    endpoint: string,
    method: string,
    duration: number,
    status: number
  ): void {
    this.trackUserAction('api_call', {
      endpoint,
      method,
      duration,
      status,
    });
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

// 싱글톤 인스턴스 내보내기
export const monitoringService = MonitoringService.getInstance();

// 편의 함수들
export const trackEvent = (
  eventName: string,
  properties: Record<string, unknown> = {}
) => {
  monitoringService.trackCustomEvent(eventName, properties);
};

export const trackApiCall = (
  endpoint: string,
  method: string,
  duration: number,
  status: number
) => {
  monitoringService.trackApiCall(endpoint, method, duration, status);
};

export const setUserId = (userId: string) => {
  monitoringService.setUserId(userId);
};
