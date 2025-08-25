// 전역 타입 선언
declare global {
  interface Window {
    tokenRefreshTimer?: number;
    tokenRefreshTime?: Date;
    gc?: () => void;

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
  }

  // 커스텀 이벤트 타입 정의 - WindowEventMap (window.dispatchEvent용)
  interface WindowEventMap {
    loginSuccess: CustomEvent<{ message: string; timestamp: string }>;
    logoutSuccess: CustomEvent<{ message: string; timestamp: string }>;
    tokenError: CustomEvent<{
      context: string;
      error: string;
      timestamp: string;
    }>;
    webLoginSuccess: CustomEvent<{ token: string; refreshToken?: string }>;
    webLogout: CustomEvent<undefined>;
  }

  // 커스텀 이벤트 타입 정의 - DocumentEventMap (document.addEventListener용)
  interface DocumentEventMap {
    loginSuccess: CustomEvent<{ message: string; timestamp: string }>;
    logoutSuccess: CustomEvent<{ message: string; timestamp: string }>;
    tokenError: CustomEvent<{
      context: string;
      error: string;
      timestamp: string;
    }>;
    webLoginSuccess: CustomEvent<{ token: string; refreshToken?: string }>;
    webLogout: CustomEvent<undefined>;
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
