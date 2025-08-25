# 🍎 iOS 자동로그인 문제 해결 가이드

## 🔍 문제 상황

iOS에서 자동로그인이 동작하지 않는 문제가 발생하고 있습니다.

### 주요 원인들:

1. **iOS Safari ITP (Intelligent Tracking Prevention)**: localStorage/sessionStorage 제한
2. **웹뷰 환경**: 네이티브 앱과 웹뷰 간 토큰 동기화 문제
3. **토큰 저장소 우선순위**: iOS에서 안정적인 저장소 선택 필요
4. **자동로그인 로직**: iOS 환경에 최적화되지 않은 로직

## 🛠️ 해결 방안

### 1. iOS 환경 감지 및 최적화

```typescript
// iOS 환경 감지 함수
const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;

  // iOS 웹뷰 감지
  if (window.webkit?.messageHandlers) return true;

  // iOS Safari 감지
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) || /ipad/.test(navigator.platform);
};
```

### 2. iOS 최적화된 토큰 저장소 우선순위

```typescript
// iOS 환경에서는 쿠키를 우선으로 사용 (ITP 대응)
export const getCurrentToken = (): string | null => {
  const isIOSEnvironment = isIOS();

  if (isIOSEnvironment) {
    // 1. 쿠키 (iOS ITP 대응)
    const cookieToken = Cookies.get('accessToken');
    if (cookieToken?.trim()) return cookieToken.trim();

    // 2. sessionStorage (iOS에서 안정적)
    const sessionToken = sessionStorage.getItem('accessToken');
    if (sessionToken?.trim()) return sessionToken.trim();

    // 3. localStorage (마지막 선택)
    const localToken = localStorage.getItem('accessToken');
    if (localToken?.trim()) return localToken.trim();
  }

  // 일반 환경: 기존 로직
  // ...
};
```

### 3. iOS 전용 토큰 저장 함수

```typescript
export const saveTokenForIOS = (
  token: string,
  refreshToken?: string,
  keepLogin: boolean = true
): void => {
  // 1. 쿠키에 우선 저장 (iOS ITP 대응)
  const cookieOptions = {
    path: '/',
    secure: window.location.protocol === 'https:',
    sameSite: 'strict' as const,
    expires: keepLogin ? 30 : 1,
  };

  Cookies.set('accessToken', token, cookieOptions);
  if (refreshToken) {
    Cookies.set('refreshToken', refreshToken, cookieOptions);
  }

  // 2. sessionStorage에 저장 (iOS에서 안정적)
  sessionStorage.setItem('accessToken', token);
  // ...

  // 3. iOS 앱에 토큰 동기화 요청
  if (window.webkit?.messageHandlers?.nativeBridge) {
    window.webkit.messageHandlers.nativeBridge.postMessage({
      action: 'syncToken',
      token: token,
      refreshToken: refreshToken,
      keepLogin: keepLogin,
    });
  }
};
```

### 4. iOS 최적화된 자동로그인 복원

```typescript
export const restorePersistentLogin = async (): Promise<boolean> => {
  const isIOSEnvironment = isIOS();

  if (isIOSEnvironment) {
    // iOS 환경에서는 네이티브 앱에 토큰 요청
    if (!accessToken && !currentRefreshToken) {
      if (window.webkit?.messageHandlers?.nativeBridge) {
        window.webkit.messageHandlers.nativeBridge.postMessage({
          action: 'requestLoginInfo',
        });

        // 잠시 대기 후 다시 확인
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const retryToken = getCurrentToken();
        if (retryToken) return true;
      }
    }

    // iOS 환경에서는 더 적극적인 재시도
    const maxRetries = isIOSEnvironment ? 3 : 2;
    const delay = isIOSEnvironment ? retryCount * 2 : retryCount;
  }

  // ... 기존 로직
};
```

### 5. iOS 전용 웹뷰 통합 스크립트

```javascript
// public/ios_webview_integration.js
(function () {
  'use strict';

  // iOS 환경 감지
  const isIOS = () => {
    if (window.webkit?.messageHandlers) return true;
    const userAgent = navigator.userAgent.toLowerCase();
    return (
      /iphone|ipad|ipod/.test(userAgent) || /ipad/.test(navigator.platform)
    );
  };

  if (!isIOS()) return;

  // iOS에서 안정적인 토큰 저장
  const saveTokenForIOS = (token, refreshToken, keepLogin = true) => {
    // 1. 쿠키에 우선 저장 (iOS ITP 대응)
    document.cookie = `accessToken=${token}; path=/; max-age=${keepLogin ? 30 * 24 * 60 * 60 : 24 * 60 * 60}`;

    // 2. sessionStorage에 저장 (iOS에서 안정적)
    sessionStorage.setItem('accessToken', token);

    // 3. localStorage에도 저장 (백업)
    if (keepLogin) {
      localStorage.setItem('accessToken', token);
    }

    // 4. iOS 앱에 토큰 동기화 요청
    if (window.webkit?.messageHandlers?.nativeBridge) {
      window.webkit.messageHandlers.nativeBridge.postMessage({
        action: 'syncToken',
        token: token,
        refreshToken: refreshToken,
        keepLogin: keepLogin,
      });
    }
  };

  // 전역 함수로 노출
  window.iOSAutoLogin = {
    saveToken: saveTokenForIOS,
    getToken: getTokenForIOS,
    checkStatus: checkLoginStatusForIOS,
    restore: restoreAutoLoginForIOS,
    setup: setupAutoLoginForIOS,
  };

  // 자동 설정 시작
  setupAutoLoginForIOS();
})();
```

## 📱 iOS 앱 연동 가이드

### 1. Swift에서 웹뷰 설정

```swift
// ContentView.swift
func setupWebView() {
    let script = """
    // iOS 앱에서 로그인 정보 수신 이벤트 리스너
    window.addEventListener('loginInfoReceived', function(e) {
        const { userInfo, keepLogin } = e.detail;
        if (userInfo && userInfo.token) {
            // iOS 최적화된 토큰 저장
            if (window.iOSAutoLogin && window.iOSAutoLogin.saveToken) {
                window.iOSAutoLogin.saveToken(userInfo.token, userInfo.refreshToken, keepLogin);
            }
        }
    });
    """

    let userScript = WKUserScript(source: script, injectionTime: .atDocumentEnd, forMainFrameOnly: false)
    contentController.addUserScript(userScript)
}
```

### 2. iOS 앱에서 웹뷰로 토큰 전달

```swift
// LoginManager.swift
func sendLoginInfoToWeb(webView: WKWebView) {
    let script = """
    window.dispatchEvent(new CustomEvent('loginInfoReceived', {
        detail: {
            userInfo: {
                token: '\(accessToken)',
                refreshToken: '\(refreshToken)',
                email: '\(userEmail)',
                name: '\(userName)'
            },
            keepLogin: \(keepLogin)
        }
    }));
    """

    webView.evaluateJavaScript(script)
}
```

## 🔧 디버깅 방법

### 1. 브라우저 콘솔에서 확인

```javascript
// iOS 환경 감지
console.log(
  'iOS 환경:',
  /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
);

// iOS 자동로그인 함수 확인
console.log('iOSAutoLogin 함수:', window.iOSAutoLogin);

// 토큰 상태 확인
console.log('쿠키 토큰:', document.cookie.includes('accessToken'));
console.log('세션 토큰:', sessionStorage.getItem('accessToken'));
console.log('로컬 토큰:', localStorage.getItem('accessToken'));
```

### 2. iOS 전용 디버깅 함수 사용

```typescript
// auth.ts에서 제공하는 함수
debugIOSAutoLogin();
```

### 3. 네트워크 탭에서 확인

- 쿠키가 제대로 설정되는지 확인
- iOS 앱과의 통신이 정상적인지 확인

## 🚀 테스트 방법

### 1. iOS 시뮬레이터에서 테스트

```bash
# iOS 시뮬레이터 실행
xcrun simctl boot "iPhone 15"
open -a Simulator
```

### 2. 실제 iOS 기기에서 테스트

- Safari에서 테스트
- iOS 앱의 웹뷰에서 테스트
- Private Browsing 모드에서 테스트 (ITP 테스트)

### 3. 자동로그인 테스트

```javascript
// 브라우저 콘솔에서
window.iOSAutoLogin.restore(); // 자동로그인 복원 테스트
window.iOSAutoLogin.checkStatus(); // 로그인 상태 확인
```

## 📋 체크리스트

### ✅ 구현 완료 항목

- [x] iOS 환경 감지 함수
- [x] iOS 최적화된 토큰 저장소 우선순위
- [x] iOS 전용 토큰 저장 함수
- [x] iOS 최적화된 자동로그인 복원
- [x] iOS 전용 웹뷰 통합 스크립트
- [x] HTML에 iOS 스크립트 추가
- [x] iOS 환경에 최적화된 로그인 처리
- [x] iOS 전용 디버깅 함수

### 🔄 추가 개선 필요 항목

- [ ] iOS 앱에서 웹뷰로의 토큰 동기화 강화
- [ ] iOS Safari ITP 우회 방법 추가
- [ ] iOS 웹뷰에서의 토큰 갱신 자동화
- [ ] iOS 환경에서의 오프라인 지원

## 🎯 예상 결과

이 수정사항들을 적용하면 iOS에서 다음과 같은 개선을 기대할 수 있습니다:

1. **자동로그인 안정성 향상**: 쿠키 우선 저장으로 ITP 대응
2. **토큰 동기화 개선**: iOS 앱과 웹뷰 간 원활한 토큰 공유
3. **사용자 경험 향상**: iOS 환경에 최적화된 자동로그인 로직
4. **디버깅 용이성**: iOS 전용 디버깅 함수로 문제 해결 속도 향상

## 📞 문제 해결이 안 될 경우

1. **브라우저 콘솔 확인**: `debugIOSAutoLogin()` 실행
2. **iOS 앱 로그 확인**: Xcode 콘솔에서 웹뷰 통신 로그 확인
3. **네트워크 탭 확인**: 쿠키 설정 및 API 호출 상태 확인
4. **iOS 버전 확인**: iOS 14+ 에서 ITP 정책이 더 엄격함
