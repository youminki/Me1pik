# LoginManager 개선사항 📱

## 🎯 개선 목표

로그 분석에서 발견된 안정성 및 효율성 문제들을 해결하여 더욱 매끄러운 자동 로그인 경험을 제공합니다.

## ✅ 해결된 문제점

### 1. **중복 토큰 갱신 호출 방지**

- **문제**: `didBecomeActive` + `initializeInstagramLoginStatus` + `syncTokenWithWebView`가 동시에 갱신 유도
- **해결**:
  - `refreshInFlight` 플래그로 싱글플라이트 가드 구현
  - 5초 디바운스로 중복 갱신 방지
  - `defer`를 사용하여 플래그 해제 보장

### 2. **WKWebView 보안 에러 완화**

- **문제**: `WKErrorDomain Code=4 "SecurityError: The operation is insecure"`
- **해결**:
  - `document.readyState === 'complete'` 확인 후 JS 실행
  - 보안 에러 시 500ms 후 자동 재시도
  - `try-catch`로 JavaScript 오류 처리 강화

### 3. **autoLogin 플래그 불일치 해결**

- **문제**: refresh 요청에 `autoLogin: false` 전송 vs 웹에는 `autoLoginEnabled: true`
- **해결**: 모든 토큰 갱신 요청에 `autoLogin: true` 설정

### 4. **expiresAt 타이밍 이슈 해결**

- **문제**: `checkTokenStatus`는 유효로 보이지만 `syncTokenWithWebView`에서 "No expiresAt found" 발생
- **해결**: `expiresAt` 설정 완료 후에만 웹뷰 동기화 실행

### 5. **중복 초기화 방지**

- **문제**: LoginManager 초기화가 연속으로 발생
- **해결**:
  - `observersAdded` 플래그로 중복 옵저버 등록 방지
  - `isInitializing` 플래그로 초기화 상태 관리

### 6. **웹뷰 동기화 최적화**

- **문제**: 웹뷰 토큰 동기화가 너무 빈번하게 발생
- **해결**: 3초 디바운스로 중복 동기화 방지

## 🔧 구현된 개선사항

### **싱글플라이트 가드 + 디바운스**

```swift
// 토큰 갱신 중복 방지
private var refreshInFlight = false
private var lastRefreshAttempt: Date = Date.distantPast

func refreshAccessToken() {
    guard !refreshInFlight else { return }
    guard Date().timeIntervalSince(lastRefreshAttempt) >= 5.0 else { return }

    refreshInFlight = true
    lastRefreshAttempt = Date()

    defer {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.refreshInFlight = false
        }
    }
    // ... 갱신 로직
}
```

### **WKWebView 보안 에러 완화**

```swift
let script = """
(function() {
    try {
        // readyState 확인으로 보안 에러 방지
        if (document.readyState !== 'complete') {
            console.log('Document not ready, skipping...');
            return;
        }
        // ... 안전한 JS 실행
    } catch (error) {
        console.error('Error:', error);
    }
})();
"""
```

### **자동 재시도 로직**

```swift
webView.evaluateJavaScript(script) { result, error in
    if let error = error as? WKError, wkError.code == .javaScriptExceptionOccurred {
        print("⚠️ JavaScript 보안 에러 감지 - 500ms 후 재시도")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.retryFunction(webView: webView)
        }
    }
}
```

## 📊 개선 효과

### **성능 향상**

- 중복 API 호출 감소로 네트워크 트래픽 최적화
- 배터리 소모 감소
- 앱 응답성 향상

### **안정성 향상**

- WKWebView 보안 에러 발생률 감소
- 토큰 동기화 실패 시 자동 복구
- 초기화 중복으로 인한 예상치 못한 동작 방지

### **사용자 경험 향상**

- 더 빠른 자동 로그인
- 로그인 상태 불일치 현상 감소
- 앱 크래시 가능성 감소

## 🧪 테스트 권장사항

### **자동 로그인 테스트**

1. 앱 백그라운드 → 포그라운드 전환
2. 앱 완전 종료 → 재시작
3. 네트워크 불안정 상황에서의 토큰 갱신

### **웹뷰 동기화 테스트**

1. 웹뷰 로딩 직후 토큰 전달
2. 보안 에러 발생 시 재시도 동작
3. 토큰 갱신 후 웹뷰 동기화

### **에러 복구 테스트**

1. 토큰 저장 실패 시 자동 복구
2. 네트워크 오류 시 재시도
3. 앱 생명주기 변화 시 토큰 보존

## 📝 추가 개선 제안

### **향후 고려사항**

1. **토큰 갱신 실패 시 지수 백오프** 구현
2. **네트워크 상태 모니터링**으로 토큰 갱신 최적화
3. **토큰 만료 시간 예측**으로 사전 갱신
4. **멀티 디바이스 토큰 동기화** 구현

### **모니터링 강화**

1. **토큰 갱신 성공률** 추적
2. **WKWebView 오류 발생률** 모니터링
3. **자동 로그인 성공률** 통계 수집

---

**개선 완료일**: 2025년 8월 25일  
**개선 버전**: v1.1.2  
**개발자**: 유민기
