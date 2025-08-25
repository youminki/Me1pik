/**
 * 🧬 iOS Biometric 인증 연동 스크립트
 * 지문/FaceID 기반 로그인 및 자동로그인 연동
 */

(function () {
  'use strict';

  console.log('🧬 iOS Biometric 인증 연동 스크립트 로드됨');

  // iOS 환경 감지
  const isIOS = () => {
    if (window.webkit?.messageHandlers) return true;
    const userAgent = navigator.userAgent.toLowerCase();
    return (
      /iphone|ipad|ipod/.test(userAgent) || /ipad/.test(navigator.platform)
    );
  };

  // iOS 환경이 아니면 스크립트 종료
  if (!isIOS()) {
    console.log('🧬 iOS 환경이 아님 - 스크립트 종료');
    return;
  }

  console.log('🧬 iOS 환경 감지됨 - Biometric 인증 연동 설정');

  // 🧬 Biometric 인증 상태 관리
  let biometricStatus = {
    isAvailable: false,
    biometricType: 'None',
    isEnabled: false,
    requireForAutoLogin: false,
  };

  // 🧬 Biometric 인증 요청 함수
  const requestBiometricAuth = async (
    reason = '로그인을 위해 생체 인증이 필요합니다'
  ) => {
    try {
      console.log('🧬 Biometric 인증 요청 시작:', reason);

      if (!window.webkit?.messageHandlers?.nativeBridge) {
        throw new Error('iOS 네이티브 브릿지가 사용할 수 없습니다');
      }

      // iOS 앱에 Biometric 인증 요청
      window.webkit.messageHandlers.nativeBridge.postMessage({
        action: 'requestBiometricAuth',
        reason: reason,
      });

      // 결과 대기
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Biometric 인증 요청 시간 초과'));
        }, 30000); // 30초 타임아웃

        const handleResult = (event) => {
          clearTimeout(timeout);
          window.removeEventListener('biometricAuthResult', handleResult);

          const { success, error } = event.detail;

          if (success) {
            console.log('✅ Biometric 인증 성공');
            resolve({ success: true, error: null });
          } else {
            console.log('❌ Biometric 인증 실패:', error);
            reject(new Error(error || 'Biometric 인증에 실패했습니다'));
          }
        };

        window.addEventListener('biometricAuthResult', handleResult);
      });
    } catch (error) {
      console.error('🧬 Biometric 인증 요청 중 오류:', error);
      throw error;
    }
  };

  // 🧬 Biometric 상태 확인 함수
  const checkBiometricStatus = async () => {
    try {
      console.log('🧬 Biometric 상태 확인 시작');

      if (!window.webkit?.messageHandlers?.nativeBridge) {
        console.log('🧬 iOS 네이티브 브릿지가 없음 - 웹 환경에서 정상');
        return {
          isAvailable: false,
          biometricType: null,
          isEnabled: false,
          requireForAutoLogin: false,
        };
      }

      // iOS 앱에 Biometric 상태 확인 요청
      window.webkit.messageHandlers.nativeBridge.postMessage({
        action: 'checkBiometricStatus',
      });

      // 결과 대기
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Biometric 상태 확인 시간 초과'));
        }, 10000); // 10초 타임아웃

        const handleResult = (event) => {
          clearTimeout(timeout);
          window.removeEventListener('biometricStatusResult', handleResult);

          const { isAvailable, biometricType, isEnabled, requireForAutoLogin } =
            event.detail;

          biometricStatus = {
            isAvailable,
            biometricType,
            isEnabled,
            requireForAutoLogin,
          };

          console.log('🧬 Biometric 상태 확인 완료:', biometricStatus);
          resolve(biometricStatus);
        };

        window.addEventListener('biometricStatusResult', handleResult);
      });
    } catch (error) {
      console.error('🧬 Biometric 상태 확인 중 오류:', error);
      throw error;
    }
  };

  // 🧬 Biometric 인증 활성화 함수
  const enableBiometricAuth = async () => {
    try {
      console.log('🧬 Biometric 인증 활성화 시작');

      if (!window.webkit?.messageHandlers?.nativeBridge) {
        console.log('🧬 iOS 네이티브 브릿지가 없음 - 웹 환경에서 정상');
        return false;
      }

      // iOS 앱에 Biometric 인증 활성화 요청
      window.webkit.messageHandlers.nativeBridge.postMessage({
        action: 'enableBiometricAuth',
      });

      // 결과 대기
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Biometric 인증 활성화 시간 초과'));
        }, 30000); // 30초 타임아웃

        const handleResult = (event) => {
          clearTimeout(timeout);
          window.removeEventListener('biometricAuthEnabled', handleResult);

          const { success } = event.detail;

          if (success) {
            console.log('✅ Biometric 인증 활성화 성공');
            biometricStatus.isEnabled = true;
            resolve(true);
          } else {
            console.log('❌ Biometric 인증 활성화 실패');
            resolve(false);
          }
        };

        window.addEventListener('biometricAuthEnabled', handleResult);
      });
    } catch (error) {
      console.error('🧬 Biometric 인증 활성화 중 오류:', error);
      throw error;
    }
  };

  // 🧬 Biometric 자동로그인 설정 함수
  const setBiometricAutoLogin = async (require = true) => {
    try {
      console.log('🧬 Biometric 자동로그인 설정 시작:', require);

      if (!window.webkit?.messageHandlers?.nativeBridge) {
        console.log('🧬 iOS 네이티브 브릿지가 없음 - 웹 환경에서 정상');
        return false;
      }

      // iOS 앱에 Biometric 자동로그인 설정 요청
      window.webkit.messageHandlers.nativeBridge.postMessage({
        action: 'setBiometricAutoLogin',
        require: require,
      });

      // 결과 대기
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Biometric 자동로그인 설정 시간 초과'));
        }, 10000); // 10초 타임아웃

        const handleResult = (event) => {
          clearTimeout(timeout);
          window.removeEventListener(
            'biometricAutoLoginSettingChanged',
            handleResult
          );

          const { require: newRequire } = event.detail;

          console.log('✅ Biometric 자동로그인 설정 완료:', newRequire);
          biometricStatus.requireForAutoLogin = newRequire;
          resolve(newRequire);
        };

        window.addEventListener(
          'biometricAutoLoginSettingChanged',
          handleResult
        );
      });
    } catch (error) {
      console.error('🧬 Biometric 자동로그인 설정 중 오류:', error);
      throw error;
    }
  };

  // 🧬 Biometric 인증이 필요한 자동로그인 함수
  const performBiometricAutoLogin = async () => {
    try {
      console.log('🧬 Biometric 인증이 필요한 자동로그인 시작');

      // 1. Biometric 상태 확인
      const status = await checkBiometricStatus();

      if (!status.isAvailable) {
        throw new Error('Biometric 인증을 사용할 수 없습니다');
      }

      if (!status.isEnabled) {
        throw new Error('Biometric 인증이 활성화되지 않았습니다');
      }

      if (!status.requireForAutoLogin) {
        console.log('🧬 Biometric 인증이 필요하지 않음 - 일반 자동로그인 진행');
        return true;
      }

      // 2. Biometric 인증 수행
      console.log('🧬 Biometric 인증 수행:', status.biometricType);
      const authResult = await requestBiometricAuth(
        '자동 로그인을 위해 생체 인증이 필요합니다'
      );

      if (authResult.success) {
        console.log('✅ Biometric 인증 성공 - 자동로그인 계속');
        return true;
      } else {
        throw new Error('Biometric 인증에 실패했습니다');
      }
    } catch (error) {
      console.error('🧬 Biometric 자동로그인 중 오류:', error);
      throw error;
    }
  };

  // 🧬 Biometric 인증 UI 표시 함수
  const showBiometricAuthUI = (
    reason = '로그인을 위해 생체 인증이 필요합니다'
  ) => {
    try {
      console.log('🧬 Biometric 인증 UI 표시:', reason);

      // 사용자 친화적인 UI 표시
      const authEvent = new CustomEvent('showBiometricAuth', {
        detail: {
          reason: reason,
          biometricType: biometricStatus.biometricType,
          timestamp: new Date().toLocaleString(),
        },
      });

      window.dispatchEvent(authEvent);
    } catch (error) {
      console.error('🧬 Biometric 인증 UI 표시 중 오류:', error);
    }
  };

  // 🧬 전역 함수로 노출
  window.iOSBiometricAuth = {
    requestAuth: requestBiometricAuth,
    checkStatus: checkBiometricStatus,
    enable: enableBiometricAuth,
    setAutoLogin: setBiometricAutoLogin,
    performAutoLogin: performBiometricAutoLogin,
    showUI: showBiometricAuthUI,
    getStatus: () => biometricStatus,
  };

  // 🧬 자동 설정 시작
  const setupBiometricAuth = async () => {
    try {
      console.log('🧬 Biometric 인증 자동 설정 시작');

      // 초기 상태 확인
      await checkBiometricStatus();

      console.log('✅ Biometric 인증 자동 설정 완료');
    } catch (error) {
      console.error('🧬 Biometric 인증 자동 설정 중 오류:', error);
      // 에러가 발생해도 계속 진행 (웹 환경에서는 정상)
    }
  };

  // 페이지 로드 완료 후 자동 설정
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupBiometricAuth);
  } else {
    setupBiometricAuth();
  }

  console.log('🧬 iOS Biometric 인증 연동 스크립트 설정 완료');
})();
