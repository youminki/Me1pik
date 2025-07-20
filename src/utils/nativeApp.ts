import { setToken, syncTokenWithApp } from './auth';

// 네이티브 앱 타입 선언
declare global {
  interface Window {
    nativeApp?: {
      requestLogin?: () => void;
      saveLoginInfo?: (data: Record<string, unknown>) => void;
    };
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    webkit?: {
      messageHandlers?: {
        loginHandler?: {
          postMessage: (message: Record<string, unknown>) => void;
        };
      };
    };
  }
}

/**
 * 네이티브 앱 환경인지 확인합니다
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
 * 네이티브 앱에 로그인 요청 전송
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
 * 네이티브 앱에서 로그인 정보를 저장합니다 (앱에서는 항상 영구 저장)
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
