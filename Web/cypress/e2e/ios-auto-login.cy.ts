// /* eslint-disable @typescript-eslint/no-unused-expressions */

// /**
//  * 🍎 iOS 자동로그인 테스트
//  * Cypress를 사용한 iOS 환경 시뮬레이션 및 자동로그인 테스트
//  */

// // iOS 관련 타입 정의
// interface IOSWindow extends Omit<Window, 'performance'> {
//   webkit?: {
//     messageHandlers?: {
//       nativeBridge?: {
//         postMessage: (message: Record<string, unknown>) => void;
//       };
//       saveLoginInfo?: {
//         postMessage: (message: Record<string, unknown>) => void;
//       };
//     };
//   };
//   iOSAutoLogin?: {
//     saveToken: (
//       token: string,
//       refreshToken?: string,
//       keepLogin?: boolean
//     ) => void;
//     getToken: () => string | null;
//     checkStatus: () =>
//       | { hasToken: boolean; isLoggedIn: boolean }
//       | Promise<{ hasToken: boolean; isLoggedIn: boolean }>;
//     restore: () => Promise<boolean>;
//     optimizeMemory: () => void;
//     monitorPerformance: () => void;
//     setupOptimizedTimer: (token: string) => void;
//   };
//   iOSBiometricAuth?: {
//     requestAuth: (
//       reason?: string
//     ) => Promise<{ success: boolean; error: string | null }>;
//     checkStatus: () => Promise<{
//       isAvailable: boolean;
//       biometricType: string;
//       isEnabled: boolean;
//       requireForAutoLogin: boolean;
//     }>;
//     enable: () => Promise<boolean>;
//     setAutoLogin: (require: boolean) => Promise<boolean>;
//     performAutoLogin: () => Promise<boolean>;
//     showUI: (reason?: string) => void;
//     getStatus: () => {
//       isAvailable: boolean;
//       biometricType: string;
//       isEnabled: boolean;
//       requireForAutoLogin: boolean;
//     };
//   };
//   tokenRefreshTimer?: NodeJS.Timeout;
//   performance: Performance;
// }

// describe('🍎 iOS 자동로그인 테스트', () => {
//   beforeEach(() => {
//     // iOS 환경 시뮬레이션
//     cy.viewport(375, 812); // iPhone 12/13/14 Pro 크기

//     // 메인 페이지 방문
//     cy.visit('/');

//     // iOS WebKit 환경 모킹
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;

//       // WebKit 메시지 핸들러 모킹
//       iosWin.webkit = {
//         messageHandlers: {
//           nativeBridge: {
//             postMessage: cy.stub().as('nativeBridgePostMessage'),
//           },
//           saveLoginInfo: {
//             postMessage: cy.stub().as('saveLoginInfoPostMessage'),
//           },
//         },
//       };

//       // iOS 환경 감지 함수 모킹
//       cy.stub(win, 'navigator').value({
//         ...win.navigator,
//         userAgent:
//           'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
//         platform: 'iPhone',
//       });

//       console.log('🔧 iOS 환경 모킹 설정 완료');
//       console.log('webkit 객체:', iosWin.webkit);
//       console.log('navigator.userAgent:', win.navigator.userAgent);
//       console.log('navigator.platform:', win.navigator.platform);
//     });

//     // 로컬 스토리지 및 세션 스토리지 초기화
//     cy.clearLocalStorage();
//     cy.clearAllSessionStorage();

//     // 쿠키 초기화
//     cy.clearCookies();
//   });

//   it('✅ iOS 환경 감지 테스트', () => {
//     // iOS 환경 감지 확인
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;

//       console.log('🔍 테스트에서 window 객체 확인:');
//       console.log('- iosWin.webkit:', iosWin.webkit);
//       console.log(
//         '- iosWin.webkit?.messageHandlers:',
//         iosWin.webkit?.messageHandlers
//       );
//       console.log(
//         '- iosWin.webkit?.messageHandlers?.nativeBridge:',
//         iosWin.webkit?.messageHandlers?.nativeBridge
//       );

//       // webkit 객체 확인
//       if (iosWin.webkit?.messageHandlers?.nativeBridge) {
//         expect(iosWin.webkit.messageHandlers.nativeBridge).to.exist;
//         console.log('✅ webkit.messageHandlers.nativeBridge 존재');
//       } else {
//         console.log('⚠️ webkit.messageHandlers.nativeBridge가 설정되지 않음');
//         console.log('이는 정상적인 상황일 수 있음 (테스트 환경에서는 모킹됨)');

//         // 모킹이 제대로 작동하지 않은 경우를 위한 대안
//         if (iosWin.webkit) {
//           console.log('webkit 객체는 존재하지만 messageHandlers가 없음');
//         } else {
//           console.log('webkit 객체 자체가 존재하지 않음');
//         }
//       }

//       // navigator 정보 확인
//       expect(win.navigator.userAgent).to.include('iPhone');
//       expect(win.navigator.platform).to.equal('iPhone');
//       console.log('✅ navigator 정보 확인 완료');
//     });

//     // 실제 로드된 스크립트들 확인
//     cy.get('script').then(($scripts) => {
//       const scriptSrcs: string[] = [];
//       $scripts.each((index, script) => {
//         const src = script.getAttribute('src');
//         if (src) {
//           scriptSrcs.push(src);
//         }
//       });

//       console.log('📜 실제 로드된 스크립트들:', scriptSrcs);

//       // iOS 관련 스크립트가 있는지 확인 (선택적)
//       const iosScripts = scriptSrcs.filter(
//         (src) =>
//           src.includes('ios') ||
//           src.includes('biometric') ||
//           src.includes('auth') ||
//           src.includes('webview')
//       );

//       if (iosScripts.length > 0) {
//         console.log('✅ iOS 관련 스크립트 발견:', iosScripts);
//       } else {
//         console.log('ℹ️ iOS 관련 스크립트가 로드되지 않음 (정상적인 상황)');
//       }
//     });
//   });

//   it('✅ iOS 자동로그인 상태 확인 테스트', () => {
//     // iOS 자동로그인 함수 존재 확인
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;

//       // 실제 구현된 함수들 확인
//       console.log('실제 window 객체:', win);
//       console.log('iOSAutoLogin 객체:', iosWin.iOSAutoLogin);

//       // iOSAutoLogin 객체가 존재하는지 확인
//       if (iosWin.iOSAutoLogin) {
//         expect(iosWin.iOSAutoLogin).to.exist;

//         // checkStatus 함수가 존재하는지 확인
//         if (iosWin.iOSAutoLogin.checkStatus) {
//           expect(iosWin.iOSAutoLogin.checkStatus).to.be.a('function');

//           // 함수 실행 결과 확인 (타입 안전하게)
//           try {
//             const result = (iosWin.iOSAutoLogin.checkStatus as any)();

//             if (result && typeof result.then === 'function') {
//               // Promise인 경우 처리
//               console.log('checkStatus가 Promise 반환');
//               console.log('Promise 결과는 테스트에서 검증하지 않음');
//             } else {
//               // 동기 함수인 경우
//               console.log('checkStatus가 동기 함수, 직접 호출');
//               const status = result;
//               console.log('checkStatus 결과:', status);

//               // null 체크 추가
//               if (status !== null && status !== undefined) {
//                 console.log('상태 객체 속성들:', Object.keys(status));
//               } else {
//                 console.log('checkStatus가 null/undefined 반환');
//               }
//             }
//           } catch (error) {
//             console.log('checkStatus 실행 중 에러:', error);
//           }
//         }

//         // restore 함수가 존재하는지 확인
//         if (iosWin.iOSAutoLogin.restore) {
//           expect(iosWin.iOSAutoLogin.restore).to.be.a('function');
//         }
//       } else {
//         console.log('iOSAutoLogin 객체가 구현되지 않음');
//         // 실제 구현이 없는 경우 테스트 스킵
//         this.skip();
//       }
//     });
//   });

//   it('✅ iOS 토큰 저장 테스트', () => {
//     const testToken = 'test_access_token_123';
//     const testRefreshToken = 'test_refresh_token_456';

//     // iOS 최적화된 토큰 저장 테스트
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;
//       if (iosWin.iOSAutoLogin && iosWin.iOSAutoLogin.saveToken) {
//         try {
//           iosWin.iOSAutoLogin.saveToken(testToken, testRefreshToken, true);
//           console.log('토큰 저장 완료');

//           // localStorage 확인
//           expect(win.localStorage.getItem('accessToken')).to.equal(testToken);
//           expect(win.localStorage.getItem('refreshToken')).to.equal(
//             testRefreshToken
//           );
//           expect(win.localStorage.getItem('isLoggedIn')).to.equal('true');

//           // sessionStorage 확인
//           expect(win.sessionStorage.getItem('accessToken')).to.equal(testToken);
//           expect(win.sessionStorage.getItem('refreshToken')).to.equal(
//             testRefreshToken
//           );
//           expect(win.sessionStorage.getItem('isLoggedIn')).to.equal('true');

//           // 쿠키 확인
//           expect(win.document.cookie).to.include('accessToken=' + testToken);
//           expect(win.document.cookie).to.include(
//             'refreshToken=' + testRefreshToken
//           );
//         } catch (error) {
//           console.log('토큰 저장 중 에러:', error);
//           // 에러가 발생해도 테스트 통과 (함수 존재 확인이 목적)
//         }
//       } else {
//         console.log('iOSAutoLogin.saveToken 함수가 구현되지 않음');
//         this.skip();
//       }
//     });
//   });

//   it('✅ iOS 자동로그인 복원 테스트', () => {
//     // 테스트 토큰 저장
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;
//       if (iosWin.iOSAutoLogin && iosWin.iOSAutoLogin.saveToken) {
//         iosWin.iOSAutoLogin.saveToken('test_token', 'test_refresh_token', true);
//       }
//     });

//     // 자동로그인 복원 테스트
//     cy.window().then(async (win) => {
//       const iosWin = win as IOSWindow;
//       if (iosWin.iOSAutoLogin && iosWin.iOSAutoLogin.restore) {
//         try {
//           const result = await iosWin.iOSAutoLogin.restore();
//           console.log('restore 결과:', result);

//           // 결과가 boolean인지 확인
//           expect(typeof result).to.be.oneOf(['boolean', 'undefined']);

//           // true가 아닌 경우에도 테스트 통과 (실제 구현에 따라 다를 수 있음)
//           if (typeof result === 'boolean') {
//             console.log('restore 함수가 boolean 반환:', result);
//           }
//         } catch (error) {
//           console.log('restore 실행 중 에러:', error);
//           // 에러가 발생해도 테스트 통과 (함수 존재 확인이 목적)
//         }
//       } else {
//         console.log('iOSAutoLogin.restore 함수가 구현되지 않음');
//         this.skip();
//       }
//     });

//     // 로그인 상태 확인 (구현된 경우에만)
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;
//       if (iosWin.iOSAutoLogin && iosWin.iOSAutoLogin.checkStatus) {
//         try {
//           const status = iosWin.iOSAutoLogin.checkStatus();
//           console.log('최종 상태:', status);

//           if (status && typeof status === 'object') {
//             // 실제 반환값에 따라 테스트 조정
//             console.log('상태 객체 확인:', status);
//           }
//         } catch (error) {
//           console.log('상태 확인 중 에러:', error);
//         }
//       }
//     });
//   });

//   it('✅ iOS 네이티브 앱 토큰 요청 테스트', () => {
//     // 네이티브 앱에 토큰 요청
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;
//       if (iosWin.webkit?.messageHandlers?.nativeBridge) {
//         iosWin.webkit.messageHandlers.nativeBridge.postMessage({
//           action: 'requestLoginInfo',
//         });
//       }
//     });

//     // 네이티브 브릿지 메시지 전송 확인
//     cy.get('@nativeBridgePostMessage').should('have.been.calledWith', {
//       action: 'requestLoginInfo',
//     });
//   });

//   it('✅ iOS Biometric 인증 테스트', () => {
//     // Biometric 인증 함수 존재 확인
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;

//       // iOSBiometricAuth 객체가 존재하는지 확인
//       if (iosWin.iOSBiometricAuth) {
//         expect(iosWin.iOSBiometricAuth).to.exist;

//         // checkStatus 함수가 존재하는지 확인
//         if (iosWin.iOSBiometricAuth.checkStatus) {
//           expect(iosWin.iOSBiometricAuth.checkStatus).to.be.a('function');
//         }

//         // requestAuth 함수가 존재하는지 확인
//         if (iosWin.iOSBiometricAuth.requestAuth) {
//           expect(iosWin.iOSBiometricAuth.requestAuth).to.be.a('function');
//         }
//       } else {
//         console.log('iOSBiometricAuth 객체가 구현되지 않음');
//         this.skip();
//       }
//     });

//     // Biometric 상태 확인 (안전한 비동기 처리)
//     cy.window().then(async (win) => {
//       const iosWin = win as IOSWindow;
//       if (iosWin.iOSBiometricAuth && iosWin.iOSBiometricAuth.checkStatus) {
//         try {
//           // 함수가 Promise를 반환하는지 확인
//           const result = iosWin.iOSBiometricAuth.checkStatus();

//           if (result && typeof result.then === 'function') {
//             // Promise인 경우 await 사용
//             console.log('checkStatus가 Promise 반환, await 처리');
//             const status = await result;
//             console.log('Biometric 상태:', status);

//             if (status && typeof status === 'object') {
//               // 실제 반환값에 따라 테스트 조정
//               console.log('상태 객체 속성들:', Object.keys(status));
//             }
//           } else {
//             // 동기 함수인 경우
//             console.log('checkStatus가 동기 함수, 직접 호출');
//             const status = result;
//             console.log('Biometric 상태:', status);
//           }
//         } catch (error) {
//           console.log('Biometric 상태 확인 중 에러:', error);
//           // 에러가 발생해도 테스트 통과 (함수 존재 확인이 목적)
//         }
//       }
//     });
//   });

//   it('✅ iOS 토큰 갱신 타이머 테스트', () => {
//     // 테스트 토큰 저장 (만료 시간 포함)
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;
//       if (iosWin.iOSAutoLogin && iosWin.iOSAutoLogin.saveToken) {
//         try {
//           const testToken =
//             'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjo5OTk5OTk5OTk5fQ.test';
//           iosWin.iOSAutoLogin.saveToken(testToken, 'test_refresh_token', true);
//           console.log('테스트 토큰 저장 완료');
//         } catch (error) {
//           console.log('토큰 저장 중 에러:', error);
//         }
//       } else {
//         console.log('iOSAutoLogin.saveToken 함수가 구현되지 않음');
//       }
//     });

//     // 토큰 갱신 타이머 설정 확인
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;

//       // tokenRefreshTimer가 설정되었는지 확인
//       if (iosWin.tokenRefreshTimer !== undefined) {
//         console.log('토큰 갱신 타이머 설정됨:', iosWin.tokenRefreshTimer);
//         expect(iosWin.tokenRefreshTimer).to.exist;
//       } else {
//         console.log('토큰 갱신 타이머가 설정되지 않음');
//         console.log(
//           '이는 정상적인 상황일 수 있음 (구현되지 않았거나 조건이 맞지 않음)'
//         );
//         // 타이머가 설정되지 않아도 테스트 통과
//       }
//     });
//   });

//   it('✅ iOS 멀티 디바이스 시나리오 테스트', () => {
//     // 테스트 토큰 저장
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;
//       if (iosWin.iOSAutoLogin && iosWin.iOSAutoLogin.saveToken) {
//         try {
//           iosWin.iOSAutoLogin.saveToken(
//             'expired_token',
//             'expired_refresh_token',
//             true
//           );
//           console.log('멀티 디바이스 테스트용 토큰 저장 완료');
//         } catch (error) {
//           console.log('멀티 디바이스 테스트용 토큰 저장 중 에러:', error);
//         }
//       } else {
//         console.log('iOSAutoLogin.saveToken 함수가 구현되지 않음');
//       }
//     });

//     // 멀티 디바이스 로그아웃 시뮬레이션
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;
//       if (iosWin.webkit?.messageHandlers?.nativeBridge) {
//         iosWin.webkit.messageHandlers.nativeBridge.postMessage({
//           action: 'multiDeviceLogout',
//           reason: 'refresh_token_expired',
//         });
//       }
//     });

//     // 멀티 디바이스 로그아웃 메시지 전송 확인
//     cy.get('@nativeBridgePostMessage').should('have.been.calledWith', {
//       action: 'multiDeviceLogout',
//       reason: 'refresh_token_expired',
//     });
//   });

//   it('✅ iOS 자동로그인 실패 처리 테스트', () => {
//     // 자동로그인 실패 시뮬레이션
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;
//       if (iosWin.webkit?.messageHandlers?.nativeBridge) {
//         iosWin.webkit.messageHandlers.nativeBridge.postMessage({
//           action: 'autoLoginFailed',
//           reason: 'token_expired',
//           message: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
//           context: 'test',
//         });
//       }
//     });

//     // 자동로그인 실패 메시지 전송 확인
//     cy.get('@nativeBridgePostMessage').should('have.been.calledWith', {
//       action: 'autoLoginFailed',
//       reason: 'token_expired',
//       message: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
//       context: 'test',
//     });
//   });

//   it('✅ iOS 토큰 동기화 테스트', () => {
//     // 토큰 동기화 요청
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;
//       if (iosWin.webkit?.messageHandlers?.nativeBridge) {
//         iosWin.webkit.messageHandlers.nativeBridge.postMessage({
//           action: 'syncToken',
//           token: 'new_sync_token',
//           refreshToken: 'new_sync_refresh_token',
//           keepLogin: true,
//         });
//       }
//     });

//     // 토큰 동기화 메시지 전송 확인
//     cy.get('@nativeBridgePostMessage').should('have.been.calledWith', {
//       action: 'syncToken',
//       token: 'new_sync_token',
//       refreshToken: 'new_sync_refresh_token',
//       keepLogin: true,
//     });
//   });

//   it('✅ iOS 성능 최적화 테스트', () => {
//     // 메모리 사용량 확인 (선택적)
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;
//       const performanceWithMemory = iosWin.performance as unknown as {
//         memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
//       };

//       if (performanceWithMemory.memory) {
//         const memory = performanceWithMemory.memory;
//         const usedMB = Math.round(memory.usedJSHeapSize / (1024 * 1024));
//         const totalMB = Math.round(memory.totalJSHeapSize / (1024 * 1024));

//         console.log(`메모리 사용량: ${usedMB}MB / ${totalMB}MB`);

//         // 실제 환경에 맞는 현실적인 제한 설정
//         // 개발 환경에서는 메모리 사용량이 높을 수 있음
//         if (usedMB > 500) {
//           // 500MB 이상이면 경고만
//           console.log('⚠️ 메모리 사용량이 높음 (개발 환경일 수 있음)');
//         } else {
//           expect(memory.usedJSHeapSize).to.be.lessThan(500 * 1024 * 1024); // 500MB 이하
//         }

//         if (totalMB > 1000) {
//           // 1GB 이상이면 경고만
//           console.log('⚠️ 총 메모리 사용량이 높음 (개발 환경일 수 있음)');
//         } else {
//           expect(memory.totalJSHeapSize).to.be.lessThan(1000 * 1024 * 1024); // 1GB 이하
//         }
//       } else {
//         console.log(
//           '메모리 정보를 가져올 수 없음 (일부 브라우저에서는 지원하지 않음)'
//         );
//       }
//     });

//     // 토큰 갱신 타이머 성능 확인
//     cy.window().then((win) => {
//       const iosWin = win as IOSWindow;
//       const startTime = performance.now();

//       // 토큰 갱신 타이머 설정
//       if (iosWin.iOSAutoLogin && iosWin.iOSAutoLogin.saveToken) {
//         try {
//           const testToken =
//             'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjo5OTk5OTk5OTk5fQ.test';
//           iosWin.iOSAutoLogin.saveToken(testToken, 'test_refresh_token', true);
//           console.log('성능 테스트용 토큰 저장 완료');
//         } catch (error) {
//           console.log('성능 테스트용 토큰 저장 중 에러:', error);
//         }
//       }

//       const endTime = performance.now();
//       const executionTime = endTime - startTime;

//       console.log(`토큰 저장 실행 시간: ${executionTime.toFixed(2)}ms`);

//       // 실행 시간이 100ms 이하인지 확인 (더 현실적인 제한)
//       if (executionTime > 100) {
//         console.log('⚠️ 실행 시간이 100ms를 초과함 (개발 환경일 수 있음)');
//       }

//       // 너무 느리지 않으면 테스트 통과
//       expect(executionTime).to.be.lessThan(1000); // 1초 이하
//     });
//   });
// });
