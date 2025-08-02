/**
 * 애플리케이션 로깅 시스템 (logger.ts)
 *
 * 개발 및 프로덕션 환경에서 일관된 로깅을 제공하는 시스템입니다.
 * 로그 레벨 관리, 성능 추적, 에러 처리, 사용자 액션 추적 기능을 포함하며,
 * 메모리 효율성을 고려한 로그 관리 시스템을 제공합니다.
 */

/**
 * 로그 레벨 열거형
 *
 * 로그의 중요도와 우선순위에 따라 분류되는 레벨을 정의합니다:
 * - DEBUG: 개발용 상세 정보 (가장 낮은 우선순위)
 * - INFO: 일반 정보 및 상태 변경
 * - WARN: 경고 및 잠재적 문제
 * - ERROR: 오류 및 예외 상황 (가장 높은 우선순위)
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 로그 엔트리 인터페이스
 *
 * 각 로그 항목의 구조와 메타데이터를 정의합니다.
 * 로그 분석과 디버깅을 위한 충분한 정보를 포함합니다.
 */
interface LogEntry {
  timestamp: number; // 로그 생성 시간
  level: LogLevel; // 로그 레벨
  message: string; // 로그 메시지
  data?: unknown; // 추가 데이터 (선택사항)
  error?: Error; // 에러 객체 (선택사항)
  context?: Record<string, unknown>; // 컨텍스트 정보 (선택사항)
}

/**
 * 로거 클래스
 *
 * 로그 수집, 저장, 출력을 담당하는 메인 클래스입니다.
 * 메모리 효율성을 위해 최대 로그 개수를 제한하며,
 * 환경별 로그 레벨 관리와 성능 최적화를 제공합니다.
 */
class Logger {
  private logs: LogEntry[] = []; // 로그 저장 배열
  private maxLogs = 1000; // 최대 로그 개수
  private currentLevel = LogLevel.INFO; // 현재 로그 레벨

  constructor(level: LogLevel = LogLevel.INFO) {
    this.currentLevel = level;
  }

  /**
   * 로그 레벨 설정
   *
   * @param level - 설정할 로그 레벨
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * 로그 추가 (내부 메서드)
   *
   * @param level - 로그 레벨
   * @param message - 로그 메시지
   * @param data - 추가 데이터 (선택사항)
   * @param error - 에러 객체 (선택사항)
   * @param context - 컨텍스트 정보 (선택사항)
   */
  private addLog(
    level: LogLevel,
    message: string,
    data?: unknown,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    if (level < this.currentLevel) return;

    const logEntry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
      error,
      context,
    };

    this.logs.push(logEntry);

    // 최대 로그 개수 제한
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 콘솔 출력
    this.outputToConsole(logEntry);
  }

  /**
   * 콘솔 출력
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelName = LogLevel[entry.level];

    const logData: Record<string, unknown> = {
      timestamp,
      level: levelName,
      message: entry.message,
    };

    if (entry.data) {
      logData.data = entry.data;
    }
    if (entry.error) {
      logData.error = entry.error;
    }
    if (entry.context) {
      logData.context = entry.context;
    }

    // switch (entry.level) {
    //   case LogLevel.DEBUG:
    //     console.debug(logData);
    //     break;
    //   case LogLevel.INFO:
    //     console.info(logData);
    //     break;
    //   case LogLevel.WARN:
    //     console.warn(logData);
    //     break;
    //   case LogLevel.ERROR:
    //     console.error(logData);
    //     break;
    // }
  }

  /**
   * 디버그 로그
   */
  debug(
    message: string,
    data?: unknown,
    context?: Record<string, unknown>
  ): void {
    this.addLog(LogLevel.DEBUG, message, data, undefined, context);
  }

  /**
   * 정보 로그
   */
  info(
    message: string,
    data?: unknown,
    context?: Record<string, unknown>
  ): void {
    this.addLog(LogLevel.INFO, message, data, undefined, context);
  }

  /**
   * 경고 로그
   */
  warn(
    message: string,
    data?: unknown,
    context?: Record<string, unknown>
  ): void {
    this.addLog(LogLevel.WARN, message, data, undefined, context);
  }

  /**
   * 에러 로그
   */
  error(
    message: string,
    error?: Error,
    data?: unknown,
    context?: Record<string, unknown>
  ): void {
    this.addLog(LogLevel.ERROR, message, data, error, context);
  }

  /**
   * 로그 내보내기
   */
  exportLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 로그 초기화
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * 로그 필터링
   */
  filterLogs(level?: LogLevel, searchTerm?: string): LogEntry[] {
    return this.logs.filter((log) => {
      if (level !== undefined && log.level !== level) return false;
      if (
        searchTerm &&
        !log.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }
}

// 전역 로거 인스턴스
export const logger = new Logger(
  import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO
);

/**
 * 성능 로깅 데코레이터
 */
export const logPerformance = <T extends (...args: unknown[]) => unknown>(
  target: T,
  name: string
): T => {
  return ((...args: unknown[]) => {
    const start = performance.now();
    const result = target(...args);
    const end = performance.now();
    const executionTime = end - start;

    logger.debug(`${name} 실행 시간`, {
      executionTime: `${executionTime.toFixed(2)}ms`,
    });

    return result;
  }) as T;
};

/**
 * 에러 로깅 데코레이터
 */
export const logErrorDecorator = <T extends (...args: unknown[]) => unknown>(
  target: T,
  name: string
): T => {
  return ((...args: unknown[]) => {
    try {
      return target(...args);
    } catch (error) {
      logger.error(`${name} 실행 중 오류 발생`, error as Error, { args });
      throw error;
    }
  }) as T;
};

/**
 * API 호출 로깅
 */
export const logApiCall = (url: string, method: string, data?: unknown) => {
  logger.info('API 호출', {
    url,
    method,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * 사용자 액션 로깅
 */
export const logUserAction = (action: string, data?: unknown) => {
  logger.info('사용자 액션', {
    action,
    data,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  });
};

/**
 * 애플리케이션 에러 로깅
 */
export const logApplicationError = (
  error: Error,
  context?: Record<string, unknown>
) => {
  logger.error('애플리케이션 오류', error, undefined, {
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...context,
  });
};

/**
 * 로깅 유틸리티
 */

// 환경별 로깅 설정
const isDevelopment = import.meta.env.DEV;

/**
 * 개발 환경에서만 로그 출력
 */
export const devLog = (...args: unknown[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

/**
 * 개발 환경에서만 에러 로그 출력
 */
export const devError = (...args: unknown[]) => {
  if (isDevelopment) {
    console.error(...args);
  }
};

/**
 * 개발 환경에서만 경고 로그 출력
 */
export const devWarn = (...args: unknown[]) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

/**
 * 프로덕션에서도 출력할 중요한 로그
 */
export const prodLog = (...args: unknown[]) => {
  console.log(...args);
};

/**
 * 프로덕션에서도 출력할 중요한 에러
 */
export const prodError = (...args: unknown[]) => {
  console.error(...args);
};
