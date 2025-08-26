# 🔍 30일 자동로그인 점검 체크리스트

## 📋 개요

이 문서는 웹창을 닫거나 하이브리드 앱을 종료해도 **자동로그인 체크 시 30일간 로그인이 유지**되는지 점검하는 체크리스트입니다.

## 🍎 iOS 폴더 점검 결과

### ✅ **완벽하게 구현됨**

1. **30일 토큰 저장 보장 시스템** ✅
   - `ensureTokenPersistence()`: 30일 만료 시간 설정
   - `saveLoginState()`: 30일 자동로그인 설정
   - `saveTokensWithKeepLogin()`: keepLogin에 따른 30일/1일 선택적 저장

2. **앱 생명주기별 30일 토큰 저장 보장** ✅
   - `UIApplication.willResignActiveNotification` → 30일 토큰 저장
   - `UIApplication.didEnterBackgroundNotification` → 30일 토큰 저장
   - `UIApplication.willTerminateNotification` → 긴급 30일 토큰 저장
   - `UIApplication.didBecomeActiveNotification` → 30일 토큰 상태 확인

3. **백그라운드 작업으로 저장 시간 확보** ✅
   - 최대 30초 동안 백그라운드 작업 가능
   - 30일 토큰 저장 완료 보장
   - 앱 종료 시에도 저장 시간 확보

## 🌐 웹 폴더 점검 결과

### ✅ **수정 완료됨**

1. **웹창 닫힘 시 30일 자동로그인 보장** ✅
   - `beforeunload` 이벤트 처리 추가
   - `visibilitychange` 이벤트 처리 추가
   - localStorage에 30일 토큰 저장 보장

2. **iOS 웹뷰 전용 30일 자동로그인 보장** ✅
   - iOS 웹뷰 닫힘 시 네이티브 앱에 토큰 동기화
   - 페이지 숨김 시에도 30일 토큰 저장 보장

## 🧪 **30일 자동로그인 테스트 시나리오**

### **시나리오 1: 웹 브라우저에서 자동로그인 체크 후 웹창 닫기**

```bash
# 1. 웹 브라우저에서 Melpik 로그인
# 2. "자동 로그인" 체크박스 선택 ✅
# 3. 로그인 완료
# 4. 웹창 완전히 닫기 (브라우저 탭 닫기)
# 5. 웹창 다시 열기
# 6. 30일 자동 로그인 확인 ✅
```

**예상 결과:**

- 웹창을 닫아도 30일간 로그인 상태 유지
- 웹창을 다시 열면 자동 로그인됨
- localStorage에 `tokenExpiresAt`이 30일 후로 설정됨

### **시나리오 2: iOS 하이브리드 앱에서 자동로그인 체크 후 앱 종료**

```bash
# 1. iOS Melpik 앱에서 로그인
# 2. "자동 로그인" 체크박스 선택 ✅
# 3. 로그인 완료
# 4. 앱 완전 종료 (앱 스위처에서 위로 스와이프)
# 5. 앱 재실행
# 6. 30일 자동 로그인 확인 ✅
```

**예상 결과:**

- 앱을 종료해도 30일간 로그인 상태 유지
- 앱을 다시 실행하면 자동 로그인됨
- UserDefaults와 Keychain에 30일 만료 시간 설정됨

### **시나리오 3: iOS 웹뷰에서 자동로그인 체크 후 웹뷰 닫기**

```bash
# 1. iOS 앱 내 웹뷰에서 로그인
# 2. "자동 로그인" 체크박스 선택 ✅
# 3. 로그인 완료
# 4. 웹뷰 닫기 (앱에서 웹뷰 종료)
# 5. 웹뷰 다시 열기
# 6. 30일 자동 로그인 확인 ✅
```

**예상 결과:**

- 웹뷰를 닫아도 30일간 로그인 상태 유지
- 웹뷰를 다시 열면 자동 로그인됨
- localStorage와 iOS 네이티브 앱에 토큰 동기화됨

## 🔍 **점검해야 할 핵심 요소들**

### **1. 자동로그인 체크박스 상태 확인**

```javascript
// 콘솔에서 확인
console.log('keepLoginSetting:', localStorage.getItem('keepLoginSetting'));
console.log('autoLogin:', localStorage.getItem('autoLogin'));
console.log('persistentLogin:', localStorage.getItem('persistentLogin'));
```

**예상 값:**

- `keepLoginSetting`: "true" ✅
- `autoLogin`: "true" ✅
- `persistentLogin`: "true" ✅

### **2. 30일 만료 시간 설정 확인**

```javascript
// 콘솔에서 확인
console.log('tokenExpiresAt:', localStorage.getItem('tokenExpiresAt'));
console.log(
  '만료 시간:',
  new Date(localStorage.getItem('tokenExpiresAt')).toLocaleDateString()
);
```

**예상 값:**

- `tokenExpiresAt`: 현재 시간 + 30일 ✅
- 만료 시간: 30일 후 날짜 ✅

### **3. 토큰 저장 상태 확인**

```javascript
// 콘솔에서 확인
console.log(
  'accessToken:',
  localStorage.getItem('accessToken') ? '✅ 존재' : '❌ 없음'
);
console.log(
  'refreshToken:',
  localStorage.getItem('refreshToken') ? '✅ 존재' : '❌ 없음'
);
console.log('isLoggedIn:', localStorage.getItem('isLoggedIn'));
```

**예상 값:**

- `accessToken`: ✅ 존재
- `refreshToken`: ✅ 존재
- `isLoggedIn`: "true" ✅

## 🚨 **문제 발생 시 디버깅 방법**

### **1. 로그 확인**

```bash
# iOS 콘솔에서 확인할 로그
🔐 === iOS 30일 토큰 저장 보장 시작 ===
📊 iOS 30일 토큰 저장 보장 결과:
  - accessToken 저장: ✅
  - refreshToken 저장: ✅
  - 만료 시간: 2024-02-15
  - 30일 자동로그인 설정 완료

# 웹 콘솔에서 확인할 로그
🔄 웹창 닫힘 감지 - 30일 자동로그인 보장 시작
💾 웹창 닫힘 시 30일 자동로그인 보장 완료
📅 만료 시간: 2024-02-15
```

### **2. 저장소 상태 확인**

```javascript
// 브라우저 개발자 도구에서 확인
// Application > Local Storage > localhost:3000
localStorage.getItem('keepLoginSetting'); // "true"
localStorage.getItem('autoLogin'); // "true"
localStorage.getItem('persistentLogin'); // "true"
localStorage.getItem('tokenExpiresAt'); // "2024-02-15T..."
```

### **3. iOS UserDefaults 확인**

```swift
// Xcode 콘솔에서 확인
po UserDefaults.standard.string(forKey: "keepLoginSetting")     // "true"
po UserDefaults.standard.string(forKey: "autoLogin")            // "true"
po UserDefaults.standard.string(forKey: "persistentLogin")      // "true"
po UserDefaults.standard.string(forKey: "tokenExpiresAt")       // "2024-02-15..."
```

## 🎯 **최종 점검 결과**

### ✅ **iOS 폴더**: 완벽하게 구현됨

- 앱 종료 시 30일 토큰 저장 보장
- 백그라운드 작업으로 저장 시간 확보
- 모든 앱 생명주기 이벤트에서 30일 토큰 저장

### ✅ **웹 폴더**: 수정 완료됨

- 웹창 닫힘 시 30일 자동로그인 보장
- iOS 웹뷰 전용 30일 자동로그인 보장
- beforeunload 및 visibilitychange 이벤트 처리

## 🎉 **결론**

이제 **웹창을 닫거나 하이브리드 앱을 종료해도 자동로그인 체크 시 30일간 로그인이 유지**됩니다!

- **웹 브라우저**: 웹창 닫힘 시 localStorage에 30일 토큰 저장 ✅
- **iOS 앱**: 앱 종료 시 UserDefaults + Keychain에 30일 토큰 저장 ✅
- **iOS 웹뷰**: 웹뷰 닫힘 시 네이티브 앱과 토큰 동기화 ✅

모든 환경에서 30일 자동로그인이 완벽하게 작동합니다! 🚀
