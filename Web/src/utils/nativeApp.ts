/**
 * nativeApp 유틸리티 모음
 *
 * 네이티브 앱 연동 시스템을 제공합니다.
 * 웹뷰 환경에서 네이티브 앱과의 통신을 담당하며 iOS WKWebView와 Android WebView 모두를 지원합니다.
 *
 * @description
 * - 네이티브 앱 환경 감지
 * - 상태바 높이 관리
 * - 로그인 정보 동기화
 * - 플랫폼별 메시지 전송
 */

import { setToken, syncTokenWithApp } from '@/utils/auth';

/**
 * 네이티브 앱 타입 선언
 *
 * 웹뷰에서 네이티브 앱의 JavaScript 인터페이스에 접근하기 위한 타입 정의입니다.
 */
declare global {
  interface Window {
    nativeApp?: {
      requestLogin?: () => void; // 로그인 요청
      saveLoginInfo?: (data: Record<string, unknown>) => void; // 로그인 정보 저장
      getStatusBarHeight?: () => number; // 상태바 높이 조회
    };
    ReactNativeWebView?: {
      postMessage: (message: string) => void; // React Native WebView 메시지 전송
    };
    webkit?: {
      messageHandlers?: {
        loginHandler?: {
          postMessage: (message: Record<string, unknown>) => void; // iOS 로그인 핸들러
        };
        statusBarHandler?: {
          postMessage: (message: Record<string, unknown>) => void; // iOS 상태바 핸들러
        };
      };
    };
  }
}

/**
 * isNativeApp 함수
 *
 * 네이티브 앱 환경인지 확인합니다.
 * 웹뷰 환경에서 실행 중인지 판단합니다.
 *
 * @returns 네이티브 앱 환경이면 true, 웹 브라우저면 false
 */
export const isNativeApp = (): boolean => {
  return !!(
    typeof window !== 'undefined' &&
    (window.nativeApp ||
      window.ReactNativeWebView ||
      window.webkit?.messageHandlers?.loginHandler)
  );
};

/**
 * isAndroidApp 함수
 *
 * 안드로이드 앱 환경인지 확인합니다.
 * React Native WebView나 Android UserAgent를 통해 판단합니다.
 *
 * @returns 안드로이드 앱 환경이면 true, 그렇지 않으면 false
 */
export const isAndroidApp = (): boolean => {
  return !!(
    typeof window !== 'undefined' &&
    (window.ReactNativeWebView ||
      (window.nativeApp && /Android/i.test(navigator.userAgent)))
  );
};

/**
 * isIOSApp 함수
 *
 * iOS 앱 환경인지 확인합니다.
 * WKWebView의 messageHandlers를 통해 판단합니다.
 *
 * @returns iOS 앱 환경이면 true, 그렇지 않으면 false
 */
export const isIOSApp = (): boolean => {
  return !!(
    typeof window !== 'undefined' &&
    window.webkit?.messageHandlers?.loginHandler
  );
};

/**
 * getStatusBarHeight 함수
 *
 * 상태바 높이를 가져옵니다.
 * 네이티브 앱 환경에서 상태바 높이를 조회합니다.
 * CSS 변수, 네이티브 인터페이스, 메시지 전송을 통해 높이를 확인합니다.
 *
 * @returns 상태바 높이 (픽셀 단위)
 */
export const getStatusBarHeight = (): number => {
  // 기본값 (대부분의 안드로이드 기기)
  const defaultHeight = 24;

  if (typeof window !== 'undefined') {
    // CSS 변수에서 상태바 높이 확인
    const cssHeight = getComputedStyle(document.documentElement)
      .getPropertyValue('--status-bar-height')
      .replace('px', '');

    if (cssHeight && !isNaN(Number(cssHeight))) {
      return Number(cssHeight);
    }

    // 네이티브 앱에서 상태바 높이를 제공하는 경우
    if (window.nativeApp?.getStatusBarHeight) {
      return window.nativeApp.getStatusBarHeight();
    }

    // React Native WebView에서 상태바 높이 요청
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'GET_STATUS_BAR_HEIGHT',
        })
      );
    }

    // iOS WebKit에서 상태바 높이 요청
    if (window.webkit?.messageHandlers?.statusBarHandler) {
      window.webkit.messageHandlers.statusBarHandler.postMessage({
        type: 'GET_STATUS_BAR_HEIGHT',
      });
    }
  }

  return defaultHeight;
};

/**
 * setStatusBarHeight 함수
 *
 * 네이티브 앱에서 상태바 높이를 설정합니다.
 *
 * @param height - 설정할 상태바 높이
 */
export const setStatusBarHeight = (height: number): void => {
  if (typeof window !== 'undefined') {
    // CSS 변수로 상태바 높이 설정
    document.documentElement.style.setProperty(
      '--status-bar-height',
      `${height}px`
    );
    document.documentElement.style.setProperty(
      '--safe-area-top',
      `${height}px`
    );

    // 안드로이드 앱의 경우 추가적인 스타일 설정
    if (isAndroidApp()) {
      document.body.style.paddingTop = `${height}px`;
    }
  }
};

/**
 * setupStatusBarHeightListener 함수
 *
 * 네이티브 앱에서 상태바 높이 이벤트 리스너를 설정합니다.
 */
export const setupStatusBarHeightListener = (): void => {
  if (typeof window !== 'undefined') {
    // 네이티브 앱에서 상태바 높이 변경 이벤트 수신
    window.addEventListener('statusBarHeightChanged', ((event: CustomEvent) => {
      const { height } = event.detail;
      setStatusBarHeight(height);
    }) as EventListener);

    // 안드로이드 앱에서 상태바 높이 요청
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'REQUEST_STATUS_BAR_HEIGHT',
        })
      );
    }

    // iOS 앱에서 상태바 높이 요청
    if (window.webkit?.messageHandlers?.statusBarHandler) {
      window.webkit.messageHandlers.statusBarHandler.postMessage({
        type: 'REQUEST_STATUS_BAR_HEIGHT',
      });
    }

    // 안드로이드 앱의 경우 초기 상태바 높이 설정
    if (isAndroidApp()) {
      const initialHeight = getStatusBarHeight();
      setStatusBarHeight(initialHeight);
    }
  }
};

/**
 * requestNativeLogin 함수
 *
 * 네이티브 앱에 로그인 요청을 전송합니다.
 */
export const requestNativeLogin = (): void => {
  if (typeof window !== 'undefined' && window.nativeApp?.requestLogin) {
    window.nativeApp.requestLogin();
  } else if (typeof window !== 'undefined' && window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'REQUEST_LOGIN',
      })
    );
  } else if (
    typeof window !== 'undefined' &&
    window.webkit?.messageHandlers?.loginHandler
  ) {
    window.webkit.messageHandlers.loginHandler.postMessage({
      type: 'REQUEST_LOGIN',
    });
  }
};

/**
 * saveNativeLoginInfo 함수
 *
 * 네이티브 앱에서 로그인 정보를 저장합니다 (앱에서는 항상 영구 저장).
 *
 * @param loginInfo - 저장할 로그인 정보
 * @param loginInfo.id - 사용자 ID
 * @param loginInfo.email - 사용자 이메일
 * @param loginInfo.name - 사용자 이름
 * @param loginInfo.token - 액세스 토큰
 * @param loginInfo.refreshToken - 리프레시 토큰
 * @param loginInfo.expiresAt - 토큰 만료 시간
 */
export const saveNativeLoginInfo = (loginInfo: {
  id: string;
  email: string;
  name: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
}): void => {
  try {
    setToken(loginInfo.token, loginInfo.refreshToken);
    localStorage.setItem('userId', loginInfo.id);
    localStorage.setItem('userEmail', loginInfo.email);
    localStorage.setItem('userName', loginInfo.name);
    localStorage.setItem('tokenExpiresAt', loginInfo.expiresAt);
    syncTokenWithApp(loginInfo.token, loginInfo.refreshToken);
    console.log('네이티브 앱에 로그인 정보 영구 저장 완료');
  } catch (error) {
    console.error('네이티브 앱 로그인 정보 저장 실패:', error);
  }
};

/**
 * 네이티브 앱에서 웹뷰로 로그인 정보를 전달하는 방법
 *
 * Android (React Native) 예시:
 * ```javascript
 * // 로그인 성공 후 웹뷰에 이벤트 전달
 * webViewRef.current.postMessage(JSON.stringify({
 *   type: 'loginInfoReceived',
 *   detail: {
 *     isLoggedIn: true,
 *     userInfo: {
 *       token: 'access_token_here',
 *       refreshToken: 'refresh_token_here',
 *       email: 'user@example.com'
 *     }
 *   }
 * }));
 * ```
 *
 * iOS (Swift) 예시:
 * ```swift
 * // 로그인 성공 후 웹뷰에 이벤트 전달
 * let loginInfo = [
 *   "type": "loginInfoReceived",
 *   "detail": [
 *     "isLoggedIn": true,
 *     "userInfo": [
 *       "token": "access_token_here",
 *       "refreshToken": "refresh_token_here",
 *       "email": "user@example.com"
 *     ]
 *   ]
 * ] as [String : Any]
 *
 * webView.evaluateJavaScript("""
 *   window.dispatchEvent(new CustomEvent('loginInfoReceived', {
 *     detail: \(loginInfo)
 *   }));
 * """)
 * ```
 */

/**
 * 네이티브 앱에서 로그인 상태 유지 방법
 *
 * 1. Android (React Native) - AsyncStorage 사용
 * ```javascript
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 *
 * // 로그인 성공 시 토큰 저장
 * const saveLoginInfo = async (loginData) => {
 *   try {
 *     await AsyncStorage.setItem('accessToken', loginData.token);
 *     await AsyncStorage.setItem('refreshToken', loginData.refreshToken);
 *     await AsyncStorage.setItem('userEmail', loginData.email);
 *
 *     // 웹뷰에 토큰 전달
 *     webViewRef.current.postMessage(JSON.stringify({
 *       type: 'loginInfoReceived',
 *       detail: {
 *         isLoggedIn: true,
 *         userInfo: loginData
 *       }
 *     }));
 *   } catch (error) {
 *     console.error('로그인 정보 저장 실패:', error);
 *   }
 * };
 *
 * // 앱 시작 시 토큰 확인
 * const checkLoginStatus = async () => {
 *   try {
 *     const token = await AsyncStorage.getItem('accessToken');
 *     if (token) {
 *       // 웹뷰에 로그인 상태 전달
 *       webViewRef.current.postMessage(JSON.stringify({
 *         type: 'loginInfoReceived',
 *         detail: {
 *           isLoggedIn: true,
 *           userInfo: {
 *             token: token,
 *             refreshToken: await AsyncStorage.getItem('refreshToken'),
 *             email: await AsyncStorage.getItem('userEmail')
 *           }
 *         }
 *       }));
 *     }
 *   } catch (error) {
 *     console.error('로그인 상태 확인 실패:', error);
 *   }
 * };
 * ```
 *
 * 2. iOS (Swift) - UserDefaults 사용
 * ```swift
 * // UserDefaults를 사용하여 토큰 저장
 * func saveLoginInfo(_ loginData: [String: Any]) {
 *     UserDefaults.standard.set(loginData["token"], forKey: "accessToken")
 *     UserDefaults.standard.set(loginData["refreshToken"], forKey: "refreshToken")
 *     UserDefaults.standard.set(loginData["email"], forKey: "userEmail")
 *
 *     // 웹뷰에 로그인 정보 전달
 *     let loginInfo = [
 *         "type": "loginInfoReceived",
 *         "detail": [
 *             "isLoggedIn": true,
 *             "userInfo": loginData
 *         ]
 *     ] as [String : Any]
 *
 *     webView.evaluateJavaScript("""
 *         window.dispatchEvent(new CustomEvent('loginInfoReceived', {
 *             detail: \(loginInfo)
 *         }));
 *     """)
 * }
 *
 * // 앱 시작 시 토큰 확인
 * func checkLoginStatus() {
 *     if let token = UserDefaults.standard.string(forKey: "accessToken") {
 *         let loginInfo = [
 *             "type": "loginInfoReceived",
 *             "detail": [
 *                 "isLoggedIn": true,
 *                 "userInfo": [
 *                     "token": token,
 *                     "refreshToken": UserDefaults.standard.string(forKey: "refreshToken") ?? "",
 *                     "email": UserDefaults.standard.string(forKey: "userEmail") ?? ""
 *                 ]
 *             ]
 *         ] as [String : Any]
 *
 *         webView.evaluateJavaScript("""
 *             window.dispatchEvent(new CustomEvent('loginInfoReceived', {
 *                 detail: \(loginInfo)
 *             }));
 *         """)
 *     }
 * }
 * ```
 *
 * 3. 보안 강화를 위한 추가 방법
 * - Android: EncryptedSharedPreferences 사용
 * - iOS: Keychain 사용
 * - 생체 인증 (지문, 얼굴 인식) 추가
 * - 토큰 만료 시간 설정 및 자동 갱신
 */
