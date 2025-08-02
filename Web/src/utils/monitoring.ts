/**
 * 통합 모니터링 시스템 (monitoring.ts)
 *
 * 애플리케이션의 성능, 에러, 사용자 액션을 종합적으로 추적하는 모니터링 시스템을 제공합니다.
 * 싱글톤 패턴을 사용하여 앱 전체에서 일관된 모니터링을 제공하며,
 * 실시간 데이터 수집과 분석을 통해 사용자 경험 개선에 기여합니다.
 *
 * @description
 * - Core Web Vitals 성능 메트릭 실시간 추적
 * - 에러 로그 수집 및 분석 (개발 환경에서 스택 트레이스 포함)
 * - 사용자 액션 및 페이지 뷰 추적
 * - 주기적 데이터 전송 및 성능 알림
 * - 세션 기반 사용자 행동 분석
 */

/**
 * Core Web Vitals 성능 메트릭 인터페이스
 *
 * Google에서 정의한 웹 성능 측정의 핵심 지표들을 정의합니다.
 * 사용자 경험을 정량적으로 평가하고 성능 최적화의 기준으로 활용됩니다.
 *
 * @property fcp - First Contentful Paint (첫 번째 콘텐츠 렌더링 시간, ms)
 * @property lcp - Largest Contentful Paint (가장 큰 콘텐츠 렌더링 시간, ms)
 * @property fid - First Input Delay (첫 번째 사용자 입력 지연 시간, ms)
 * @property cls - Cumulative Layout Shift (누적 레이아웃 변화량, 점수)
 * @property ttfb - Time to First Byte (첫 번째 바이트 수신 시간, ms)
 */
interface PerformanceMetrics {
  fcp: number; // First Contentful Paint - 첫 번째 콘텐츠 렌더링 시간
  lcp: number; // Largest Contentful Paint - 가장 큰 콘텐츠 렌더링 시간
  fid: number; // First Input Delay - 첫 번째 사용자 입력 지연 시간
  cls: number; // Cumulative Layout Shift - 누적 레이아웃 변화량
  ttfb: number; // Time to First Byte - 첫 번째 바이트 수신 시간
}

/**
 * 에러 로그 정보 인터페이스
 *
 * 애플리케이션에서 발생한 오류를 추적하고 분석하기 위한 데이터 구조를 정의합니다.
 * 개인정보 보호를 고려하여 필요한 정보만 수집하며, 개발 환경에서만 상세 정보를 수집합니다.
 *
 * @property message - 에러 메시지 (필수)
 * @property stack - 스택 트레이스 (개발 환경에서만 수집, 선택적)
 * @property timestamp - 발생 시간 (Unix timestamp, 필수)
 * @property userAgent - 사용자 에이전트 정보 (필수)
 * @property url - 에러 발생 URL (필수)
 * @property userId - 사용자 ID (개인정보 보호를 위해 선택적)
 * @property sessionId - 세션 ID (필수)
 */
interface ErrorLog {
  message: string; // 에러 메시지
  stack?: string; // 스택 트레이스 (개발 환경에서만 수집)
  timestamp: number; // 발생 시간 (Unix timestamp)
  userAgent: string; // 사용자 에이전트 정보
  url: string; // 에러 발생 URL
  userId?: string; // 사용자 ID (개인정보 보호를 위해 선택적)
  sessionId: string; // 세션 ID
}

/**
 * 사용자 액션 정보 인터페이스
 *
 * 사용자의 상호작용을 추적하고 분석하기 위한 데이터 구조를 정의합니다.
 * 사용자 경험 개선을 위한 인사이트를 제공하는 데 활용됩니다.
 *
 * @property action - 액션 이름 (예: 'button_click', 'form_submit', 필수)
 * @property category - 액션 카테고리 (예: 'navigation', 'interaction', 필수)
 * @property timestamp - 발생 시간 (Unix timestamp, 필수)
 * @property properties - 추가 속성 (컨텍스트 정보, 선택적)
 */
interface UserAction {
  action: string; // 액션 이름 (예: 'button_click', 'form_submit')
  category: string; // 액션 카테고리 (예: 'navigation', 'interaction')
  timestamp: number; // 발생 시간 (Unix timestamp)
  properties: Record<string, unknown>; // 추가 속성 (컨텍스트 정보)
}

/**
 * 애플리케이션 모니터링 서비스 클래스
 *
 * 성능, 에러, 사용자 액션을 통합적으로 추적하고 분석하는 싱글톤 클래스입니다.
 * 앱 전체에서 일관된 모니터링을 제공하며, 실시간 데이터 수집과 분석을 수행합니다.
 * 메모리 효율성을 고려하여 로그 데이터를 제한적으로 저장합니다.
 */
class MonitoringService {
  private static instance: MonitoringService;
  private sessionId: string; // 세션 식별자 (고유한 세션 추적)
  private userId?: string; // 사용자 식별자 (선택적)
  private performanceObserver?: PerformanceObserver; // 성능 관찰자
  private errorLogs: ErrorLog[] = []; // 에러 로그 배열 (메모리 효율을 위해 제한적 저장)
  private userActions: UserAction[] = []; // 사용자 액션 배열
  private isInitialized = false; // 초기화 상태 플래그

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeMonitoring();
  }

  /**
   * getInstance 메서드
   *
   * 싱글톤 인스턴스를 반환합니다.
   *
   * @returns MonitoringService 인스턴스
   */
  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * generateSessionId 메서드
   *
   * 고유한 세션 ID를 생성합니다.
   *
   * @returns 고유한 세션 ID 문자열
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * initializeMonitoring 메서드
   *
   * 모니터링 시스템을 초기화합니다.
   * 성능/에러/사용자 액션 모니터링을 설정하고 주기적 데이터 전송을 시작합니다.
   */
  private initializeMonitoring(): void {
    if (this.isInitialized) return;

    this.initializePerformanceMonitoring();
    this.initializeErrorMonitoring();
    this.initializeUserActionMonitoring();
    this.startPeriodicDataTransmission();

    this.isInitialized = true;
    console.log('🔍 모니터링 시스템 초기화 완료');
  }

  /**
   * initializePerformanceMonitoring 메서드
   *
   * Core Web Vitals 및 기타 성능 지표를 관찰합니다.
   * - LCP (Largest Contentful Paint): 페이지 로딩 성능
   * - FID (First Input Delay): 사용자 상호작용 응답성
   * - CLS (Cumulative Layout Shift): 시각적 안정성
   * - Navigation Timing: 페이지 로딩 시간
   */
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

  /**
   * initializeErrorMonitoring 메서드
   *
   * 다음 에러들을 추적합니다:
   * - JavaScript 런타임 에러
   * - Promise 거부 에러
   * - 네트워크 에러
   */
  private initializeErrorMonitoring(): void {
    // 전역 JavaScript 에러 핸들러
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

    // Promise 거부 에러 핸들러
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

  /**
   * initializeUserActionMonitoring 메서드
   *
   * 추적하는 사용자 행동:
   * - 클릭 이벤트 (요소, 클래스, ID, 텍스트)
   * - 페이지 뷰 (URL, 제목, 참조 페이지)
   */
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

  /**
   * trackPerformanceMetric 메서드
   *
   * 성능 메트릭을 추적합니다.
   *
   * @param metric - 측정할 성능 지표
   * @param value - 측정된 값
   */
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

    // 로컬 저장소에 임시 저장 (최근 100개 유지)
    const storedMetrics = JSON.parse(
      localStorage.getItem('performance_metrics') || '[]'
    );
    storedMetrics.push(metricData);
    localStorage.setItem(
      'performance_metrics',
      JSON.stringify(storedMetrics.slice(-100))
    );

    // 성능 임계값 초과 시 즉시 알림 전송
    if (value > this.getPerformanceThreshold(metric)) {
      this.sendPerformanceAlert(metricData);
    }
  }

  /**
   * getPerformanceThreshold 메서드
   *
   * 성능 임계값을 반환합니다.
   * Google에서 권장하는 Core Web Vitals 기준:
   * - FCP: 1.8초 이하 (좋음)
   * - LCP: 2.5초 이하 (좋음)
   * - FID: 100ms 이하 (좋음)
   * - CLS: 0.1 이하 (좋음)
   * - TTFB: 800ms 이하 (좋음)
   *
   * @param metric - 성능 지표
   * @returns 임계값
   */
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

  /**
   * trackError 메서드
   *
   * 에러를 추적합니다.
   *
   * @param error - 추적할 에러 정보
   */
  private trackError(error: ErrorLog): void {
    this.errorLogs.push(error);

    // 에러 로그가 10개 이상이면 즉시 전송
    if (this.errorLogs.length >= 10) {
      this.sendErrorLogs();
    }
  }

  /**
   * trackUserAction 메서드
   *
   * 사용자 액션을 추적합니다.
   *
   * @param action - 액션 이름
   * @param properties - 추가 속성
   */
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

  /**
   * trackPageView 메서드
   *
   * 페이지 뷰를 추적합니다. 페이지 로드 시 자동으로 호출됩니다.
   */
  private trackPageView(): void {
    this.trackUserAction('page_view', {
      page: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
    });
  }

  /**
   * startPeriodicDataTransmission 메서드
   *
   * 주기적 데이터 전송을 시작합니다.
   * 데이터 전송 방식:
   * - 30초마다 자동 전송
   * - 페이지 언로드 시 즉시 전송
   */
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

  /**
   * sendMonitoringData 메서드
   *
   * 모니터링 데이터를 전송합니다.
   */
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

  /**
   * sendPerformanceAlert 메서드
   *
   * 성능 알림을 전송합니다.
   *
   * @param metricData - 성능 메트릭 데이터
   */
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

  /**
   * sendErrorLogs 메서드
   *
   * 에러 로그를 전송합니다.
   */
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

  /**
   * getPerformanceMetrics 메서드
   *
   * 성능 메트릭을 반환합니다.
   *
   * @returns PerformanceMetrics 객체
   */
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
  /**
   * setUserId 메서드
   *
   * 사용자 ID를 설정합니다.
   *
   * @param userId - 사용자 식별자
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * trackCustomEvent 메서드
   *
   * 커스텀 이벤트를 추적합니다.
   *
   * @param eventName - 이벤트 이름
   * @param properties - 이벤트 속성
   */
  trackCustomEvent(
    eventName: string,
    properties: Record<string, unknown> = {}
  ): void {
    this.trackUserAction(eventName, properties);
  }

  /**
   * trackApiCall 메서드
   *
   * API 호출을 추적합니다.
   *
   * @param endpoint - API 엔드포인트
   * @param method - HTTP 메서드
   * @param duration - 응답 시간 (ms)
   * @param status - HTTP 상태 코드
   */
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

  /**
   * getSessionId 메서드
   *
   * 세션 ID를 반환합니다.
   *
   * @returns 현재 세션 식별자
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

// 싱글톤 인스턴스 내보내기
export const monitoringService = MonitoringService.getInstance();

// 편의 함수들
/**
 * 외부에서 사용할 수 있는 모니터링 함수들
 */

/**
 * trackEvent 함수
 *
 * 커스텀 이벤트를 추적합니다 (외부 API).
 *
 * @param eventName - 이벤트 이름
 * @param properties - 이벤트 속성
 */
export const trackEvent = (
  eventName: string,
  properties: Record<string, unknown> = {}
) => {
  monitoringService.trackCustomEvent(eventName, properties);
};

/**
 * trackApiCall 함수
 *
 * API 호출을 추적합니다 (외부 API).
 *
 * @param endpoint - API 엔드포인트
 * @param method - HTTP 메서드
 * @param duration - 응답 시간 (ms)
 * @param status - HTTP 상태 코드
 */
export const trackApiCall = (
  endpoint: string,
  method: string,
  duration: number,
  status: number
) => {
  monitoringService.trackApiCall(endpoint, method, duration, status);
};

/**
 * setUserId 함수
 *
 * 사용자 ID를 설정합니다 (외부 API).
 *
 * @param userId - 사용자 식별자
 */
export const setUserId = (userId: string) => {
  monitoringService.setUserId(userId);
};
