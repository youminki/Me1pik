# iOS 토큰 지속성 디버깅 가이드

## 🔍 문제 진단

### 1. 앱 종료 후 로그인 상태가 유지되지 않는 문제

**증상:**
- 앱을 완전히 종료한 후 재시작 시 로그인 상태가 사라짐
- 백그라운드에서 포그라운드로 돌아올 때는 정상 동작

**원인 분석:**
1. 앱 생명주기 이벤트 처리 부족
2. Keychain 접근성 설정 문제
3. 토큰 저장 타이밍 문제
4. UserDefaults와 Keychain 간 동기화 문제

## 🛠️ 구현된 해결책

### 1. 강화된 앱 생명주기 처리

```swift
// 모든 앱 생명주기 이벤트 감지
- UIApplication.willResignActiveNotification
- UIApplication.didEnterBackgroundNotification  
- UIApplication.willTerminateNotification
- UIApplication.didBecomeActiveNotification
```

### 2. 이중 토큰 저장 시스템

```swift
// UserDefaults + Keychain 이중 저장
- UserDefaults: 빠른 접근을 위한 임시 저장
- Keychain: 영구 저장 및 보안
- 앱 종료 시 동기화 보장
```

### 3. 긴급 토큰 저장

```swift
// 앱 종료 시 즉시 저장
private func emergencyTokenPersistence() {
    // UserDefaults 즉시 동기화
    // Keychain 동기식 저장
    // 모든 토큰 정보 보존
}
```

### 4. 백그라운드 작업 요청

```swift
// 백그라운드에서 토큰 저장 시간 확보
var backgroundTaskID = UIApplication.shared.beginBackgroundTask(withName: "TokenPersistence")
// 최대 30초 동안 백그라운드 작업 가능
```

## 📋 테스트 시나리오

### 1. 정상 로그인 후 앱 종료 테스트

```bash
# 1. 앱 실행
# 2. 로그인 수행
# 3. 앱 완전 종료 (앱 스위처에서 위로 스와이프)
# 4. 앱 재실행
# 5. 자동 로그인 확인
```

### 2. 백그라운드 전환 테스트

```bash
# 1. 앱 실행 및 로그인
# 2. 홈 버튼 누르기 (백그라운드)
# 3. 앱 재실행
# 4. 로그인 상태 유지 확인
```

### 3. 강제 종료 테스트

```bash
# 1. 앱 실행 및 로그인
# 2. 앱 스위처에서 강제 종료
# 3. 앱 재실행
# 4. 로그인 상태 복원 확인
```

## 🔧 디버깅 명령어

### 콘솔 로그 확인

```bash
# Xcode 콘솔에서 다음 로그 확인:
🔄 App will resign active - ensuring token persistence
🔄 App did enter background - final token persistence check
🔄 App will terminate - emergency token persistence
✅ Token persistence ensured before app backgrounding
✅ Emergency token persistence completed
```

### 토큰 저장 상태 확인

```swift
// LoginManager에서 직접 확인
print("UserDefaults accessToken:", UserDefaults.standard.string(forKey: "accessToken") ?? "nil")
print("Keychain accessToken:", LoginManager.shared.loadFromKeychain(key: "accessToken") ?? "nil")
```

## 🚨 문제 해결

### 1. 토큰이 저장되지 않는 경우

**확인사항:**
- Keychain 접근 권한
- Info.plist 설정
- 디버그 로그 확인

**해결방법:**
```swift
// Keychain 접근성 설정 변경
kSecAttrAccessible as String: kSecAttrAccessibleAlways
```

### 2. 앱 재시작 시 로그인 상태가 사라지는 경우

**확인사항:**
- UserDefaults 동기화 상태
- Keychain 저장 상태
- 앱 생명주기 이벤트 처리

**해결방법:**
```swift
// 토큰 저장 확인 및 복원
LoginManager.shared.verifyTokenStorage()
```

### 3. 토큰 불일치 문제

**확인사항:**
- UserDefaults와 Keychain 간 동기화
- 토큰 저장 타이밍

**해결방법:**
```swift
// 토큰 동기화 수행
LoginManager.shared.verifyTokenStorage()
```

## 📊 성능 모니터링

### 토큰 저장 성공률

```swift
// 성공/실패 로그 분석
✅ Keychain save successful for key: accessToken
❌ Keychain save failed for key: accessToken, status: -34018
```

### 앱 생명주기 이벤트 처리

```swift
// 이벤트 처리 로그 확인
🔄 App became active - checking token persistence
🔄 App became inactive - ensuring token persistence
🔄 App entered background - final token persistence check
```

## 🔄 업데이트 히스토리

### v1.0.4 (2025-01-XX)
- 앱 생명주기 이벤트 처리 강화
- 긴급 토큰 저장 기능 추가
- 백그라운드 작업 요청 추가
- UserDefaults와 Keychain 간 동기화 개선

### v1.0.3 (이전)
- 기본 토큰 저장 기능
- 앱 생명주기 관찰자 설정

---

**최종 업데이트:** 2025년 1월
**버전:** 1.0.4 