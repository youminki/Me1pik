import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 375,
    viewportHeight: 812, // iPhone 12/13/14 Pro 크기
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',

    setupNodeEvents(on, config) {
      // iOS 환경 시뮬레이션을 위한 플러그인 설정
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          // iOS Safari 시뮬레이션
          launchOptions.args.push(
            '--user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
          );
          launchOptions.args.push('--touch-events=enabled');
          launchOptions.args.push(
            '--enable-features=TouchEventFeatureDetection'
          );
        }
        return launchOptions;
      });
    },

    // iOS 자동로그인 테스트를 위한 환경 변수
    env: {
      isIOS: true,
      isWebView: true,
      hasBiometric: true,
      testTimeout: 30000,
      retryAttempts: 3,
    },

    // 테스트 재시도 설정
    retries: {
      runMode: 2,
      openMode: 1,
    },

    // 타임아웃 설정
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // 비디오 및 스크린샷 설정
    video: true,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
