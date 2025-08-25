// iOS 관련 전역 타입 정의
declare global {
  interface Window {
    // iOS 자동로그인 관련
    iOSAutoLogin?: {
      saveToken: (
        token: string,
        refreshToken?: string,
        keepLogin?: boolean
      ) => void;
      getToken: () => string | null;
      checkStatus: () => { hasToken: boolean; isLoggedIn: boolean };
      restore: () => Promise<boolean>;
      optimizeMemory: () => void;
      monitorPerformance: () => void;
      setupOptimizedTimer: (token: string) => void;
    };

    // iOS Biometric 인증 관련
    iOSBiometricAuth?: {
      requestAuth: (
        reason?: string
      ) => Promise<{ success: boolean; error: string | null }>;
      checkStatus: () => Promise<{
        isAvailable: boolean;
        biometricType: string;
        isEnabled: boolean;
        requireForAutoLogin: boolean;
      }>;
      enable: () => Promise<boolean>;
      setAutoLogin: (require: boolean) => Promise<boolean>;
      performAutoLogin: () => Promise<boolean>;
      showUI: (reason?: string) => void;
      getStatus: () => {
        isAvailable: boolean;
        biometricType: string;
        isEnabled: boolean;
        requireForAutoLogin: boolean;
      };
    };

    // iOS WebKit 관련
    webkit?: {
      messageHandlers?: {
        [key: string]: {
          postMessage: (message: unknown) => void;
        };
      };
    };

    // 토큰 갱신 타이머 관련
    tokenRefreshTimer?: NodeJS.Timeout;
    tokenRefreshTime?: Date;

    // 가비지 컬렉션 (개발 환경에서만 사용)
    gc?: () => void;
  }

  // Performance API 확장
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

export {};
