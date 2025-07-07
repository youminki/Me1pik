# 인스타그램 방식 완전 연동 로그인 경험 구현

## 📋 개요

이 프로젝트는 인스타그램과 같은 완전 연동된 로그인 경험을 제공하는 하이브리드(iOS 웹뷰) 앱을 위한 웹 구현입니다.

### 🎯 핵심 목표

- **앱에서 로그인** → 웹뷰 자동 로그인
- **웹뷰에서 로그인** → 앱 자동 로그인
- **토큰 만료 시 자동 갱신** → 앱/웹뷰 동시 갱신
- **로그아웃 시 동기화** → 앱/웹뷰 동시 로그아웃
- **로그인 상태 유지** → 브라우저 닫아도 로그인 상태 유지

---

## 🏗️ 아키텍처

### 1. 토큰 관리 시스템

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   iOS 앱        │    │   웹뷰          │    │   서버          │
│                 │    │                 │    │                 │
│ • Keychain      │◄──►│ • localStorage  │◄──►│ • JWT 토큰      │
│ • UserDefaults  │    │ • sessionStorage│    │ • Refresh 토큰  │
│ • 메모리        │    │ • Cookies       │    │ • 만료 관리      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2. 로그인 상태 유지 시스템

```
┌─────────────────┐    ┌─────────────────┐
│   로그인 상태   │    │   세션 유지     │
│   유지          │    │                 │
│                 │    │                 │
│ • localStorage  │    │ • sessionStorage│
│ • 영구 보관     │    │ • 브라우저 닫으면│
│ • 설정 저장     │    │   삭제          │
└─────────────────┘    └─────────────────┘
```

### 2. 통신 플로우

#### 앱 → 웹뷰 통신

```swift
// Swift에서 웹뷰로 토큰 전달
let js = """
window.dispatchEvent(new CustomEvent('loginInfoReceived', {
  detail: {
    isLoggedIn: true,
    userInfo: {
      token: '\(accessToken)',
      refreshToken: '\(refreshToken)',
      email: '\(email)'
    }
  }
}));
"""
webView.evaluateJavaScript(js, completionHandler: nil)
```

#### 웹뷰 → 앱 통신

```javascript
// 웹에서 앱으로 로그인 정보 전달
window.webkit.messageHandlers.loginHandler.postMessage({
  type: 'login',
  token: accessToken,
  refreshToken: refreshToken,
  email: userEmail,
});
```

---

## 🔧 구현된 기능

### 1. 토큰 관리 (`src/utils/auth.ts`)

#### ✅ 다중 저장소 지원

- **localStorage**: 영구 저장
- **sessionStorage**: 세션 저장
- **Cookies**: 웹뷰 호환성
- **Keychain**: iOS 앱 (Swift에서 구현)

#### ✅ 자동 토큰 갱신

```typescript
// 토큰 만료 5분 전 자동 갱신
const setupTokenRefreshTimer = (token: string): void => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const refreshTime = (payload.exp - currentTime - 300) * 1000;

  tokenRefreshTimer = setTimeout(async () => {
    await refreshToken();
  }, refreshTime);
};
```

#### ✅ 앱-웹뷰 동기화

```typescript
// 앱에 로그인 이벤트 전달
const notifyAppLogin = (accessToken: string, refreshToken?: string): void => {
  if (window.webkit?.messageHandlers?.loginHandler) {
    window.webkit.messageHandlers.loginHandler.postMessage({
      type: 'login',
      token: accessToken,
      refreshToken: refreshToken,
    });
  }
};
```

#### ✅ 인스타그램 방식 로그인 상태 유지

```typescript
// 로그인 상태 유지 토큰 저장
export const saveTokensWithKeepLogin = (
  accessToken: string,
  refreshToken?: string,
  keepLogin: boolean = false
): void => {
  // 로그인 상태 유지 설정 저장
  saveKeepLoginSetting(keepLogin);

  if (keepLogin) {
    // localStorage에 저장 (영구 보관)
    localStorage.setItem('accessToken', accessToken);
  } else {
    // sessionStorage에 저장 (브라우저 닫으면 삭제)
    sessionStorage.setItem('accessToken', accessToken);
  }
};
```

### 2. 웹뷰 통신 스크립트 (`public/webview_integration.js`)

#### ✅ 네이티브 앱 감지

```javascript
function detectNativeApp() {
  isNativeApp = !!(
    window.webkit?.messageHandlers ||
    window.nativeApp ||
    window.ReactNativeWebView
  );
}
```

#### ✅ 양방향 통신

```javascript
// 앱에 로그인 정보 전달
function notifyAppLogin(loginInfo) {
  loginHandler.postMessage({
    type: 'login',
    token: loginInfo.token,
    refreshToken: loginInfo.refreshToken,
    email: loginInfo.email,
  });
}

// 앱에서 받은 로그인 정보 처리
function handleAppLogin(loginInfo) {
  // 다중 저장소에 토큰 저장
  localStorage.setItem('accessToken', loginInfo.token);
  sessionStorage.setItem('accessToken', loginInfo.token);
  // ...
}
```

#### ✅ 인스타그램 방식 로그인 상태 유지

```javascript
// 로그인 상태 유지 확인
function checkInstagramLoginStatus() {
  const localToken = localStorage.getItem('accessToken');
  const sessionToken = sessionStorage.getItem('accessToken');
  const token = localToken || sessionToken;

  if (!token) return false;

  // 토큰 유효성 검사
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp && payload.exp > Date.now() / 1000;
}
```

### 3. 로그인 페이지 (`src/pages/Login.tsx`)

#### ✅ 웹뷰 통신 연동

```typescript
// 로그인 성공 시 앱에 정보 전달
if ((window as any).handleWebLoginSuccess) {
  (window as any).handleWebLoginSuccess({
    token: accessToken,
    refreshToken: refreshToken,
    email: data.email,
    userId: data.email,
    name: '',
    keepLogin: keepLogin, // 인스타그램 방식 로그인 상태 유지 설정
  });
}
```

#### ✅ 로그인 상태 유지 UI

```typescript
// 이전 설정 복원
const [keepLogin, setKeepLogin] = useState(() => getKeepLoginSetting());

// 로그인 상태 유지 토큰 저장
saveTokensWithKeepLogin(accessToken, refreshToken, keepLogin);
```

### 4. 로그아웃 기능 (`src/components/MypageModal.tsx`)

#### ✅ 동기화된 로그아웃

```typescript
// 로그아웃 시 앱에 알림
if ((window as any).handleWebLogout) {
  (window as any).handleWebLogout();
}
await logout();
```

---

## 🚀 사용법

### 1. 앱에서 로그인 성공 시

```swift
// Swift에서 웹뷰에 토큰 전달
let js = """
window.dispatchEvent(new CustomEvent('loginInfoReceived', {
  detail: {
    isLoggedIn: true,
    userInfo: {
      token: '\(accessToken)',
      refreshToken: '\(refreshToken)',
      email: '\(email)'
    }
  }
}));
"""
webView.evaluateJavaScript(js, completionHandler: nil)
```

### 2. 웹뷰에서 로그인 성공 시

```javascript
// 웹에서 로그인 성공 시 자동으로 앱에 전달
handleWebLoginSuccess({
  token: 'access_token',
  refreshToken: 'refresh_token',
  email: 'user@email.com',
  keepLogin: true, // 인스타그램 방식 로그인 상태 유지
});
```

### 3. 로그아웃 시

```typescript
// 웹에서 로그아웃
handleWebLogout();

// 앱에서 로그아웃
// Swift에서 웹뷰에 로그아웃 이벤트 전달
```

### 4. 로그인 상태 유지 확인

```javascript
// 브라우저 콘솔에서 확인
window.checkInstagramLoginStatus();

// 설정 확인
window.getKeepLoginSetting();
```

---

## 🔒 보안 고려사항

### 1. 토큰 저장

- **앱**: Keychain 사용 (iOS)
- **웹**: httpOnly cookie 권장, localStorage는 편의성
- **HTTPS**: 모든 통신에서 HTTPS 사용

### 2. 토큰 갱신

- **자동 갱신**: 만료 5분 전 자동 갱신
- **실패 처리**: 갱신 실패 시 자동 로그아웃
- **백그라운드**: 앱이 백그라운드에서도 갱신 처리

### 3. 로그아웃 동기화

- **즉시 동기화**: 앱/웹뷰 동시 로그아웃
- **토큰 삭제**: 모든 저장소에서 토큰 완전 삭제

### 4. 로그인 상태 유지 보안

- **localStorage**: 영구 보관, 브라우저 닫아도 유지
- **sessionStorage**: 세션 유지, 브라우저 닫으면 삭제
- **설정 저장**: 사용자 선택을 localStorage에 저장
- **공용 PC 경고**: 로그인 상태 유지 시 보안 경고 표시

---

## 📝 주의사항

1. **HTTPS 필수**: 프로덕션에서는 반드시 HTTPS 사용
2. **토큰 보안**: 민감한 정보는 안전한 저장소 사용
3. **에러 처리**: 네트워크 오류, 토큰 만료 등 예외 상황 처리
4. **성능**: 토큰 갱신 시 불필요한 API 호출 방지
5. **로그인 상태 유지**: 공용 PC에서는 보안을 위해 사용하지 않도록 안내
6. **설정 저장**: 사용자 선택을 localStorage에 저장하여 다음 로그인 시 복원

---

## 🔄 업데이트 히스토리

- **v1.0.0**: 인스타그램 방식 완전 연동 로그인 경험 구현
- **v1.1.0**: 자동 토큰 갱신 기능 추가
- **v1.2.0**: 다중 저장소 지원 및 보안 강화
- **v1.3.0**: 인스타그램 방식 로그인 상태 유지 기능 추가

---

## 📞 지원

구현 관련 문의사항이나 개선 제안이 있으시면 언제든 연락해 주세요!

---

## 📝 주의사항

1. **HTTPS 필수**: 프로덕션에서는 반드시 HTTPS 사용
2. **토큰 보안**: 민감한 정보는 안전한 저장소 사용
3. **에러 처리**: 네트워크 오류, 토큰 만료 등 예외 상황 처리
4. **성능**: 토큰 갱신 시 불필요한 API 호출 방지
5. **로그인 상태 유지**: 공용 PC에서는 보안을 위해 사용하지 않도록 안내
6. **설정 저장**: 사용자 선택을 localStorage에 저장하여 다음 로그인 시 복원

---

## 🔄 업데이트 히스토리

- **v1.0.0**: 인스타그램 방식 완전 연동 로그인 경험 구현
- **v1.1.0**: 자동 토큰 갱신 기능 추가
- **v1.2.0**: 다중 저장소 지원 및 보안 강화
- **v1.3.0**: 인스타그램 방식 로그인 상태 유지 기능 추가

---

## 📞 지원

구현 관련 문의사항이나 개선 제안이 있으시면 언제든 연락해 주세요!

## 🧪 테스트 방법

### 1. 웹뷰 환경 테스트

```javascript
// 브라우저 콘솔에서 테스트
window.handleWebLoginSuccess({
  token: 'test_token',
  refreshToken: 'test_refresh_token',
  email: 'test@example.com',
  keepLogin: true, // 로그인 상태 유지 테스트
});

// 로그아웃 테스트
window.handleWebLogout();

// 앱에서 로그아웃 이벤트 전달 테스트
window.sendLogoutToWebView();

// 앱에서 토큰 갱신 이벤트 전달 테스트
window.sendTokenRefreshToWebView('new_token', 'new_refresh_token');

// 로그인 상태 유지 테스트
window.checkInstagramLoginStatus();
```

### 2. 앱 환경 테스트

```javascript
// 앱에서 받은 로그인 정보 테스트
window.handleAppLogin({
  token: 'app_token',
  refreshToken: 'app_refresh_token',
  email: 'app@example.com',
});

// 앱에서 받은 로그아웃 이벤트 테스트
window.handleAppLogout();

// 앱에서 받은 토큰 갱신 이벤트 테스트
window.handleAppTokenRefresh({
  token: 'new_app_token',
  refreshToken: 'new_app_refresh_token',
});
```

### 3. 로그인 상태 유지 테스트

```javascript
// 1. 로그인 상태 유지로 로그인
window.handleWebLoginSuccess({
  token: 'test_token',
  keepLogin: true,
});

// 2. 브라우저 새로고침 후 상태 확인
window.checkInstagramLoginStatus(); // true 반환

// 3. 세션 유지로 로그인
window.handleWebLoginSuccess({
  token: 'test_token',
  keepLogin: false,
});

// 4. 브라우저 새로고침 후 상태 확인
window.checkInstagramLoginStatus(); // false 반환 (sessionStorage는 유지)
```

### 4. 앱-웹뷰 로그아웃 동기화 테스트

```javascript
// 1. 웹에서 로그인
window.handleWebLoginSuccess({
  token: 'test_token',
  email: 'test@example.com',
});

// 2. 앱에서 로그아웃 이벤트 전달 (Swift에서 호출)
window.sendLogoutToWebView();

// 3. 웹뷰에서 로그아웃 처리 확인
// - 모든 저장소에서 토큰 삭제
// - 로그인 페이지로 리다이렉트
// - 로그인 상태 false로 변경

// 4. 앱에서 토큰 갱신 이벤트 전달 테스트
window.sendTokenRefreshToWebView('new_token', 'new_refresh_token');

// 5. 웹뷰에서 토큰 갱신 처리 확인
// - 새로운 토큰으로 업데이트
// - 토큰 갱신 타이머 재설정
```

## 📱 iOS 앱 연동 가이드

### 1. Swift에서 웹뷰 설정

```swift
import WebKit

class ViewController: UIViewController, WKScriptMessageHandler {
    var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
    }

    func setupWebView() {
        let config = WKWebViewConfiguration()
        let userContentController = WKUserContentController()

        // 웹뷰에서 받을 메시지 핸들러 등록
        userContentController.add(self, name: "loginHandler")
        userContentController.add(self, name: "logoutHandler")

        config.userContentController = userContentController
        webView = WKWebView(frame: view.bounds, configuration: config)
        view.addSubview(webView)
    }

    // 웹뷰에서 받은 메시지 처리
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        switch message.name {
        case "loginHandler":
            handleWebLogin(message.body as? [String: Any])
        case "logoutHandler":
            handleWebLogout()
        default:
            break
        }
    }
}
```

### 2. 하이브리드 앱에서 melpik 링크 로드

```swift
import WebKit

class MelpikWebViewController: UIViewController, WKScriptMessageHandler {
    var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
        loadMelpikWeb()
    }

    func setupWebView() {
        let config = WKWebViewConfiguration()
        let userContentController = WKUserContentController()

        // 웹뷰에서 받을 메시지 핸들러 등록
        userContentController.add(self, name: "loginHandler")
        userContentController.add(self, name: "logoutHandler")

        config.userContentController = userContentController
        webView = WKWebView(frame: view.bounds, configuration: config)
        view.addSubview(webView)
    }

    func loadMelpikWeb() {
        // melpik 링크로 웹뷰 로드
        if let url = URL(string: "https://your-melpik-domain.com") {
            let request = URLRequest(url: url)
            webView.load(request)
        }
    }

    // 웹뷰에서 받은 메시지 처리
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        switch message.name {
        case "loginHandler":
            handleWebLogin(message.body as? [String: Any])
        case "logoutHandler":
            handleWebLogout()
        default:
            break
        }
    }

    // 웹에서 받은 로그인 처리
    func handleWebLogin(_ loginInfo: [String: Any]?) {
        guard let loginInfo = loginInfo else { return }

        // 앱에 로그인 정보 저장
        if let token = loginInfo["token"] as? String {
            saveTokenToKeychain(token)
        }

        if let refreshToken = loginInfo["refreshToken"] as? String {
            saveRefreshTokenToKeychain(refreshToken)
        }

        print("웹에서 로그인 성공")
    }

    // 웹에서 받은 로그아웃 처리
    func handleWebLogout() {
        // 앱에서 로그아웃 처리
        clearTokensFromKeychain()
        print("웹에서 로그아웃 성공")
    }

    // 앱에서 로그아웃 시 웹뷰에 알림
    func appLogout() {
        // 앱에서 로그아웃 처리
        clearTokensFromKeychain()

        // 웹뷰에 로그아웃 이벤트 전달
        sendLogoutToWebView()

        print("앱에서 로그아웃 완료")
    }

    // 앱에서 토큰 갱신 시 웹뷰에 알림
    func appTokenRefresh(newToken: String, newRefreshToken: String) {
        // 앱에서 토큰 갱신 처리
        saveTokenToKeychain(newToken)
        saveRefreshTokenToKeychain(newRefreshToken)

        // 웹뷰에 토큰 갱신 이벤트 전달
        sendTokenRefreshToWebView(newToken: newToken, newRefreshToken: newRefreshToken)

        print("앱에서 토큰 갱신 완료")
    }

    // Keychain 관련 함수들
    func saveTokenToKeychain(_ token: String) {
        // Keychain에 토큰 저장 구현
    }

    func saveRefreshTokenToKeychain(_ token: String) {
        // Keychain에 refresh 토큰 저장 구현
    }

    func clearTokensFromKeychain() {
        // Keychain에서 토큰 삭제 구현
    }
}
```

### 3. 앱에서 웹뷰로 이벤트 전달하는 함수들

```swift
extension MelpikWebViewController {

    // 앱에서 웹뷰로 로그아웃 이벤트 전달
    func sendLogoutToWebView() {
        let js = """
        if (window.sendLogoutToWebView) {
            window.sendLogoutToWebView();
        } else {
            // 웹뷰 통신 스크립트가 로드되지 않은 경우 직접 처리
            window.dispatchEvent(new CustomEvent('appLogoutRequest', {
                detail: {
                    source: 'native',
                    timestamp: Date.now()
                }
            }));
        }
        """
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    // 앱에서 웹뷰로 토큰 갱신 이벤트 전달
    func sendTokenRefreshToWebView(newToken: String, newRefreshToken: String) {
        let js = """
        if (window.sendTokenRefreshToWebView) {
            window.sendTokenRefreshToWebView('\(newToken)', '\(newRefreshToken)');
        } else {
            // 웹뷰 통신 스크립트가 로드되지 않은 경우 직접 처리
            window.dispatchEvent(new CustomEvent('appTokenRefresh', {
                detail: {
                    token: '\(newToken)',
                    refreshToken: '\(newRefreshToken)',
                    source: 'native',
                    timestamp: Date.now()
                }
            }));
        }
        """
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    // 앱에서 웹뷰로 로그인 정보 전달
    func sendLoginToWebView(accessToken: String, refreshToken: String, email: String) {
        let js = """
        window.dispatchEvent(new CustomEvent('loginInfoReceived', {
          detail: {
            isLoggedIn: true,
            userInfo: {
              token: '\(accessToken)',
              refreshToken: '\(refreshToken)',
              email: '\(email)'
            }
          }
        }));
        """
        webView.evaluateJavaScript(js, completionHandler: nil)
    }
}
```

### 4. 실제 사용 예제

```swift
class AppDelegate: UIResponder, UIApplicationDelegate {

    var melpikWebViewController: MelpikWebViewController?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        // 메인 윈도우 설정
        window = UIWindow(frame: UIScreen.main.bounds)

        // Melpik 웹뷰 컨트롤러 생성
        melpikWebViewController = MelpikWebViewController()

        // 네비게이션 컨트롤러로 감싸기
        let navigationController = UINavigationController(rootViewController: melpikWebViewController!)

        window?.rootViewController = navigationController
        window?.makeKeyAndVisible()

        return true
    }

    // 앱에서 로그아웃 시 웹뷰에도 알림
    func appLogout() {
        // 앱에서 로그아웃 처리
        clearTokensFromKeychain()

        // 웹뷰에 로그아웃 이벤트 전달
        melpikWebViewController?.sendLogoutToWebView()

        print("앱에서 로그아웃 완료")
    }

    // 앱에서 토큰 갱신 시 웹뷰에도 알림
    func appTokenRefresh(newToken: String, newRefreshToken: String) {
        // 앱에서 토큰 갱신 처리
        saveTokenToKeychain(newToken)
        saveRefreshTokenToKeychain(newRefreshToken)

        // 웹뷰에 토큰 갱신 이벤트 전달
        melpikWebViewController?.sendTokenRefreshToWebView(newToken: newToken, newRefreshToken: newRefreshToken)

        print("앱에서 토큰 갱신 완료")
    }
}
```

```

```
