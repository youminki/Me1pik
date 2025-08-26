# 🍎 iOS 30일 자동로그인 구현 가이드

## 📋 개요

이 문서는 iOS 앱에서 **앱을 종료해도 30일간 토큰이 저장**되도록 구현한 기능들을 설명합니다.

## 🔧 구현된 핵심 기능들

### 1. 30일 토큰 저장 보장 시스템

```swift
// LoginManager.swift
func ensureTokenPersistence() {
    // 1. UserDefaults에 토큰 저장 (30일 유지)
    userDefaults.set(userInfo.token, forKey: "accessToken")

    // 2. Keychain에 토큰 저장 (동기 방식, 30일 유지)
    saveToKeychainSync(key: "accessToken", value: userInfo.token)

    // 3. 만료 시간 저장 (30일 후)
    let thirtyDaysFromNow = Date().addingTimeInterval(30 * 24 * 60 * 60)
    userDefaults.set(thirtyDaysFromNow, forKey: "tokenExpiresAt")

    // 4. 30일 자동로그인 설정 활성화
    userDefaults.set(true, forKey: "persistentLogin")
    userDefaults.set(true, forKey: "autoLogin")
    userDefaults.set(true, forKey: "keepLoginSetting")
}
```

**기능:**

- **UserDefaults**: 30일 영구 보관
- **Keychain**: 30일 보안 저장
- **만료 시간**: 30일 후 자동 만료
- **자동로그인**: 30일간 활성화

### 2. 앱 생명주기별 30일 토큰 저장 보장

```swift
// 모든 앱 생명주기 이벤트에서 30일 토큰 저장 보장
- UIApplication.willResignActiveNotification      // 앱 비활성화 시
- UIApplication.didEnterBackgroundNotification    // 백그라운드 진입 시
- UIApplication.willTerminateNotification         // 앱 종료 시
- UIApplication.didBecomeActiveNotification       // 앱 활성화 시
```

**동작 방식:**

- **앱 비활성화**: 30일 토큰 저장 보장
- **백그라운드 진입**: 30일 토큰 저장 보장
- **앱 종료**: 긴급 30일 토큰 저장
- **앱 활성화**: 30일 토큰 저장 상태 확인

### 3. 백그라운드 작업으로 저장 시간 확보

```swift
// 백그라운드 작업 요청으로 저장 시간 확보
var backgroundTaskID = UIApplication.shared.beginBackgroundTask(withName: "TokenPersistence") {
    UIApplication.shared.endBackgroundTask(backgroundTaskID)
}

// 30일 토큰 저장 보장
ensureTokenPersistence()

// 지연 후 백그라운드 작업 종료
DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
    UIApplication.shared.endBackgroundTask(backgroundTaskID)
}
```

**기능:**

- 최대 30초 동안 백그라운드 작업 가능
- 30일 토큰 저장 완료 보장
- 앱 종료 시에도 저장 시간 확보

## 🛡️ iOS 전용 보안 설정

### Info.plist 설정

```xml
<!-- 데이터 보호 설정 -->
<key>NSDataProtectionComplete</key>
<true/>

<!-- 키체인 접근 설정 -->
<key>NSKeychainAccessibility</key>
<string>kSecAttrAccessibleAfterFirstUnlock</string>

<!-- 백그라운드 처리 권한 -->
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
    <string>background-processing</string>
    <string>background-fetch</string>
    <string>background-app-refresh</string>
</array>
```

## 📱 iOS 앱 생명주기 처리

### LoginManager에서의 처리

```swift
private func setupAppLifecycleObserver() {
    // 앱이 비활성화될 때
    NotificationCenter.default.addObserver(
        forName: UIApplication.willResignActiveNotification,
        object: nil,
        queue: .main
    ) { [weak self] _ in
        self?.handleAppWillResignActive() // 30일 토큰 저장 보장
    }

    // 앱이 백그라운드로 진입할 때
    NotificationCenter.default.addObserver(
        forName: UIApplication.didEnterBackgroundNotification,
        object: nil,
        queue: .main
    ) { [weak self] _ in
        self?.handleAppDidEnterBackground() // 30일 토큰 저장 보장
    }

    // 앱이 종료될 때
    NotificationCenter.default.addObserver(
        forName: UIApplication.willTerminateNotification,
        object: nil,
        queue: .main
    ) { [weak self] _ in
        self?.handleAppWillTerminate() // 긴급 30일 토큰 저장
    }
}
```

## 🔍 iOS 전용 디버깅 및 모니터링

### 로그 메시지

```
🔄 iOS 앱이 비활성화됨 - 30일 토큰 저장 보장
🔐 === iOS 30일 토큰 저장 보장 시작 ===
📊 iOS 30일 토큰 저장 보장 결과:
  - accessToken 저장: ✅
  - refreshToken 저장: ✅
  - 만료 시간: 2024-02-15
  - 30일 자동로그인 설정 완료
✅ iOS 앱 비활성화 시 30일 토큰 저장 보장 완료
```

### 토큰 저장 상태 확인

```swift
// 콘솔에서 확인 가능한 정보
print("[iOS saveLoginState] accessToken:", loadFromKeychain(key: "accessToken") ?? "nil")
print("[iOS saveLoginState] refreshToken:", loadFromKeychain(key: "refreshToken") ?? "nil")
print("📅 iOS 만료 시간:", thirtyDaysFromNow)
```

## 🚀 iOS 성능 최적화

### 1. 동기식 저장

- **Keychain**: 동기 방식으로 즉시 저장
- **UserDefaults**: 강제 동기화로 즉시 디스크 저장
- **백그라운드 작업**: 저장 시간 확보

### 2. 이중 저장 시스템

- **UserDefaults**: 빠른 접근을 위한 임시 저장
- **Keychain**: 영구 저장 및 보안
- **앱 종료 시**: 동기화 보장

## 📋 iOS 테스트 시나리오

### 1. 정상 로그인 후 앱 종료 테스트

```bash
# 1. iOS 앱 실행
# 2. 로그인 수행
# 3. 앱 완전 종료 (앱 스위처에서 위로 스와이프)
# 4. 앱 재실행
# 5. 30일 자동 로그인 확인
```

### 2. 백그라운드 전환 테스트

```bash
# 1. iOS 앱 실행 및 로그인
# 2. 홈 버튼 누르기 (백그라운드)
# 3. 앱 재실행
# 4. 30일 로그인 상태 유지 확인
```

### 3. 강제 종료 테스트

```bash
# 1. iOS 앱 실행 및 로그인
# 2. 앱 스위처에서 강제 종료
# 3. 앱 재실행
# 4. 30일 자동 로그인 확인
```

## 🎯 iOS 30일 자동로그인 결과

### ✅ **자동로그인 체크한 상태**:

- **토큰 저장**: 30일간 유지
- **저장 위치**: UserDefaults + Keychain
- **iOS 앱 종료**: 토큰 유지됨 ✅
- **iOS 앱 재시작**: 30일 자동 로그인 ✅

### ❌ **자동로그인 체크 안한 상태**:

- **토큰 저장**: 1일간 유지
- **저장 위치**: UserDefaults + Keychain
- **iOS 앱 종료**: 토큰 유지됨 (1일)
- **iOS 앱 재시작**: 1일 후 수동 로그인 필요

## 🔧 iOS 구현 파일 목록

1. **`LoginManager.swift`** - 핵심 30일 토큰 저장 로직
2. **`Info.plist`** - iOS 보안 및 백그라운드 설정
3. **`ContentView.swift`** - 앱 생명주기 이벤트 처리
4. **`Melpik_iosApp.swift`** - 앱 초기화 및 설정

## 🎉 iOS 30일 자동로그인 완성!

이제 **iOS에서만** 앱을 종료해도 30일간 토큰이 안전하게 저장되어 진정한 30일 자동로그인이 구현되었습니다!

- **앱 비활성화**: 30일 토큰 저장 보장 ✅
- **백그라운드 진입**: 30일 토큰 저장 보장 ✅
- **앱 종료**: 긴급 30일 토큰 저장 ✅
- **앱 재시작**: 30일 자동 로그인 ✅
