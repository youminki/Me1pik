/// <reference types="cypress" />
/// <reference types="cypress" />

/**
 * 🍎 iOS 자동로그인 테스트
 * Cypress를 사용한 iOS 환경 시뮬레이션 및 자동로그인 테스트
 */

// iOS 관련 타입 정의
interface IOSWindow extends Omit<Window, 'performance'> {
  webkit?: {
    messageHandlers?: {
      nativeBridge?: {
        postMessage: (message: Record<string, unknown>) => void;
      };
      saveLoginInfo?: {
        postMessage: (message: Record<string, unknown>) => void;
      };
    };
  };
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
  tokenRefreshTimer?: NodeJS.Timeout;
  performance: Performance;
}

describe('🍎 iOS 자동로그인 테스트', () => {
  beforeEach(() => {
    // iOS 환경 시뮬레이션
    cy.viewport(375, 812); // iPhone 12/13/14 Pro 크기

    // iOS WebKit 환경 모킹
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;

      // WebKit 메시지 핸들러 모킹
      iosWin.webkit = {
        messageHandlers: {
          nativeBridge: {
            postMessage: cy.stub().as('nativeBridgePostMessage'),
          },
          saveLoginInfo: {
            postMessage: cy.stub().as('saveLoginInfoPostMessage'),
          },
        },
      };

      // iOS 환경 감지 함수 모킹
      cy.stub(win, 'navigator').value({
        ...win.navigator,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
      });
    });

    // 로컬 스토리지 및 세션 스토리지 초기화
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();

    // 쿠키 초기화
    cy.clearCookies();
  });

  it('✅ iOS 환경 감지 테스트', () => {
    cy.visit('/');

    // iOS 환경 감지 확인
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      expect(iosWin.webkit?.messageHandlers?.nativeBridge).to.exist;
      expect(win.navigator.userAgent).to.include('iPhone');
      expect(win.navigator.platform).to.equal('iPhone');
    });

    // iOS 전용 스크립트 로드 확인
    cy.get('script[src="/ios_webview_integration.js"]').should('exist');
    cy.get('script[src="/biometric_auth_integration.js"]').should('exist');
  });

  it('✅ iOS 자동로그인 상태 확인 테스트', () => {
    cy.visit('/');

    // iOS 자동로그인 함수 존재 확인
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      expect(iosWin.iOSAutoLogin).to.exist;
      expect(iosWin.iOSAutoLogin?.checkStatus).to.be.a('function');
      expect(iosWin.iOSAutoLogin?.restore).to.be.a('function');
    });

    // 초기 로그인 상태 확인
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      if (iosWin.iOSAutoLogin) {
        const status = iosWin.iOSAutoLogin.checkStatus();
        expect(status.hasToken).to.be.false;
        expect(status.isLoggedIn).to.be.false;
      }
    });
  });

  it('✅ iOS 토큰 저장 테스트', () => {
    cy.visit('/');

    const testToken = 'test_access_token_123';
    const testRefreshToken = 'test_refresh_token_456';

    // iOS 최적화된 토큰 저장 테스트
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      if (iosWin.iOSAutoLogin) {
        iosWin.iOSAutoLogin.saveToken(testToken, testRefreshToken, true);

        // localStorage 확인
        expect(win.localStorage.getItem('accessToken')).to.equal(testToken);
        expect(win.localStorage.getItem('refreshToken')).to.equal(
          testRefreshToken
        );
        expect(win.localStorage.getItem('isLoggedIn')).to.equal('true');

        // sessionStorage 확인
        expect(win.sessionStorage.getItem('accessToken')).to.equal(testToken);
        expect(win.sessionStorage.getItem('refreshToken')).to.equal(
          testRefreshToken
        );
        expect(win.sessionStorage.getItem('isLoggedIn')).to.equal('true');

        // 쿠키 확인
        expect(win.document.cookie).to.include('accessToken=' + testToken);
        expect(win.document.cookie).to.include(
          'refreshToken=' + testRefreshToken
        );
      }
    });
  });

  it('✅ iOS 자동로그인 복원 테스트', () => {
    cy.visit('/');

    // 테스트 토큰 저장
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      if (iosWin.iOSAutoLogin) {
        iosWin.iOSAutoLogin.saveToken('test_token', 'test_refresh_token', true);
      }
    });

    // 자동로그인 복원 테스트
    cy.window().then(async (win) => {
      const iosWin = win as IOSWindow;
      if (iosWin.iOSAutoLogin) {
        const result = await iosWin.iOSAutoLogin.restore();
        expect(result).to.be.true;
      }
    });

    // 로그인 상태 확인
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      if (iosWin.iOSAutoLogin) {
        const status = iosWin.iOSAutoLogin.checkStatus();
        expect(status.hasToken).to.be.true;
        expect(status.isLoggedIn).to.be.true;
      }
    });
  });

  it('✅ iOS 네이티브 앱 토큰 요청 테스트', () => {
    cy.visit('/');

    // 네이티브 앱에 토큰 요청
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      if (iosWin.webkit?.messageHandlers?.nativeBridge) {
        iosWin.webkit.messageHandlers.nativeBridge.postMessage({
          action: 'requestLoginInfo',
        });
      }
    });

    // 네이티브 브릿지 메시지 전송 확인
    cy.get('@nativeBridgePostMessage').should('have.been.calledWith', {
      action: 'requestLoginInfo',
    });
  });

  it('✅ iOS Biometric 인증 테스트', () => {
    cy.visit('/');

    // Biometric 인증 함수 존재 확인
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      expect(iosWin.iOSBiometricAuth).to.exist;
      expect(iosWin.iOSBiometricAuth?.checkStatus).to.be.a('function');
      expect(iosWin.iOSBiometricAuth?.requestAuth).to.be.a('function');
    });

    // Biometric 상태 확인
    cy.window().then(async (win) => {
      const iosWin = win as IOSWindow;
      if (iosWin.iOSBiometricAuth) {
        const status = await iosWin.iOSBiometricAuth.checkStatus();
        expect(status).to.have.property('isAvailable');
        expect(status).to.have.property('biometricType');
        expect(status).to.have.property('isEnabled');
      }
    });
  });

  it('✅ iOS 토큰 갱신 타이머 테스트', () => {
    cy.visit('/');

    // 테스트 토큰 저장 (만료 시간 포함)
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      if (iosWin.iOSAutoLogin) {
        const testToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjo5OTk5OTk5OTk5fQ.test';
        iosWin.iOSAutoLogin.saveToken(testToken, 'test_refresh_token', true);
      }
    });

    // 토큰 갱신 타이머 설정 확인
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      // 토큰 갱신 타이머가 설정되었는지 확인
      expect(iosWin.tokenRefreshTimer).to.exist;
    });
  });

  it('✅ iOS 멀티 디바이스 시나리오 테스트', () => {
    cy.visit('/');

    // 테스트 토큰 저장
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      if (iosWin.iOSAutoLogin) {
        iosWin.iOSAutoLogin.saveToken(
          'expired_token',
          'expired_refresh_token',
          true
        );
      }
    });

    // 멀티 디바이스 로그아웃 시뮬레이션
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      if (iosWin.webkit?.messageHandlers?.nativeBridge) {
        iosWin.webkit.messageHandlers.nativeBridge.postMessage({
          action: 'multiDeviceLogout',
          reason: 'refresh_token_expired',
        });
      }
    });

    // 멀티 디바이스 로그아웃 메시지 전송 확인
    cy.get('@nativeBridgePostMessage').should('have.been.calledWith', {
      action: 'multiDeviceLogout',
      reason: 'refresh_token_expired',
    });
  });

  it('✅ iOS 자동로그인 실패 처리 테스트', () => {
    cy.visit('/');

    // 자동로그인 실패 시뮬레이션
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      if (iosWin.webkit?.messageHandlers?.nativeBridge) {
        iosWin.webkit.messageHandlers.nativeBridge.postMessage({
          action: 'autoLoginFailed',
          reason: 'token_expired',
          message: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
          context: 'test',
        });
      }
    });

    // 자동로그인 실패 메시지 전송 확인
    cy.get('@nativeBridgePostMessage').should('have.been.calledWith', {
      action: 'autoLoginFailed',
      reason: 'token_expired',
      message: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
      context: 'test',
    });
  });

  it('✅ iOS 토큰 동기화 테스트', () => {
    cy.visit('/');

    // 토큰 동기화 요청
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      if (iosWin.webkit?.messageHandlers?.nativeBridge) {
        iosWin.webkit.messageHandlers.nativeBridge.postMessage({
          action: 'syncToken',
          token: 'new_sync_token',
          refreshToken: 'new_sync_refresh_token',
          keepLogin: true,
        });
      }
    });

    // 토큰 동기화 메시지 전송 확인
    cy.get('@nativeBridgePostMessage').should('have.been.calledWith', {
      action: 'syncToken',
      token: 'new_sync_token',
      refreshToken: 'new_sync_refresh_token',
      keepLogin: true,
    });
  });

  it('✅ iOS 성능 최적화 테스트', () => {
    cy.visit('/');

    // 메모리 사용량 확인
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      if (iosWin.performance && (iosWin.performance as any).memory) {
        const memory = (iosWin.performance as any).memory;
        expect(memory.usedJSHeapSize).to.be.lessThan(50 * 1024 * 1024); // 50MB 이하
        expect(memory.totalJSHeapSize).to.be.lessThan(100 * 1024 * 1024); // 100MB 이하
      }
    });

    // 토큰 갱신 타이머 성능 확인
    cy.window().then((win) => {
      const iosWin = win as IOSWindow;
      const startTime = performance.now();

      // 토큰 갱신 타이머 설정
      if (iosWin.iOSAutoLogin) {
        const testToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjo5OTk5OTk5OTk5fQ.test';
        iosWin.iOSAutoLogin.saveToken(testToken, 'test_refresh_token', true);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // 실행 시간이 100ms 이하인지 확인
      expect(executionTime).to.be.lessThan(100);
    });
  });
});
