# 안드로이드 상단영역과 웹 영역 겹침 방지 설정

## 개요

안드로이드 앱의 상태바(상단영역)와 웹뷰 영역이 겹치지 않도록 CSS 변수와 네이티브 앱 통신을 통해 동적으로 상태바 높이를 처리하는 시스템을 구현했습니다.

## 구현 내용

### 1. 웹 프로젝트 수정사항

#### 1.1 네이티브 앱 유틸리티 확장 (`Web/src/utils/nativeApp.ts`)

- `isAndroidApp()`, `isIOSApp()` 함수 추가
- `getStatusBarHeight()` 함수로 상태바 높이 가져오기
- `setStatusBarHeight()` 함수로 CSS 변수 설정
- `setupStatusBarHeightListener()` 함수로 이벤트 리스너 설정

#### 1.2 글로벌 스타일 추가 (`Web/src/styles/GlobalStyles.ts`)

- CSS 변수 정의: `--status-bar-height`, `--safe-area-top`
- 네이티브 앱 환경에서 상태바 높이 자동 설정
- 터치 하이라이트 제거 및 사용자 선택 제한

#### 1.3 AppLayout 컴포넌트 수정 (`Web/src/pages/layouts/AppLayout.tsx`)

- 헤더 위치를 상태바 높이만큼 조정
- 콘텐츠 영역 상단 패딩을 상태바 높이만큼 증가

#### 1.4 UnifiedHeader 컴포넌트 수정 (`Web/src/components/shared/headers/UnifiedHeader.tsx`)

- 헤더 래퍼 위치를 상태바 높이만큼 조정
- 헤더 컨테이너 최소 높이 설정

#### 1.5 하단 네비게이션 수정 (`Web/src/components/bottom-navigation.tsx`)

- 하단 안전 영역 고려한 위치 조정

### 2. 안드로이드 앱 수정사항

#### 2.1 MainActivity.kt 수정 (`android/app/src/main/java/com/youminki/testhybrid/MainActivity.kt`)

- `getStatusBarHeight()` 함수로 상태바 높이 가져오기
- `sendStatusBarHeightToWebView()` 함수로 웹뷰에 상태바 높이 전달
- `handleStatusBarHeightRequest()` 함수로 상태바 높이 요청 처리
- JavaScript 인터페이스에 `REQUEST_STATUS_BAR_HEIGHT` 처리 추가
- 웹뷰 로딩 완료 시 자동으로 상태바 높이 전달

### 3. iOS 앱 수정사항

#### 3.1 ContentView.swift 수정 (`ios/Melpik_ios/ContentView.swift`)

- `getStatusBarHeight()` 함수로 상태바 높이 가져오기
- `sendStatusBarHeightToWeb()` 함수로 웹뷰에 상태바 높이 전달
- `handleStatusBarHeightRequest()` 함수로 상태바 높이 요청 처리
- 웹뷰 로딩 완료 시 자동으로 상태바 높이 전달
- 메시지 핸들러에 `REQUEST_STATUS_BAR_HEIGHT` 처리 추가

## CSS 변수

```css
:root {
  --status-bar-height: 0px; /* 상태바 높이 */
  --safe-area-top: 0px; /* 상단 안전 영역 */
  --android-top-margin: 0px; /* 안드로이드 상단 여백 (상태바 + 네비게이션바 + 추가 여백) */
  --header-height: 70px; /* 헤더 높이 */
  --bottom-nav-height: 60px; /* 하단 네비게이션 높이 */
}
```

## 동작 방식

1. **앱 시작 시**: 네이티브 앱에서 상태바 높이를 계산하여 웹뷰에 전달
2. **웹뷰 로딩 완료 시**: 자동으로 상태바 높이를 CSS 변수로 설정
3. **동적 요청 시**: 웹에서 필요할 때 네이티브 앱에 상태바 높이 요청
4. **레이아웃 조정**: 헤더와 콘텐츠 영역이 상태바 높이만큼 조정됨

## 메시지 통신

### 웹 → 네이티브 앱

```javascript
// 상태바 높이 요청
window.ReactNativeWebView.postMessage(
  JSON.stringify({
    type: "REQUEST_STATUS_BAR_HEIGHT",
  })
);
```

### 네이티브 앱 → 웹

```javascript
// 상태바 높이 전달
window.dispatchEvent(
  new CustomEvent("statusBarHeightChanged", {
    detail: { height: 24 },
  })
);
```

## 사용 예시

### 안드로이드 앱에서 상태바 높이 설정

```kotlin
private fun getStatusBarHeight(): Int {
    // WindowInsets를 사용한 더 정확한 계산 (Android 11+)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        val windowInsets = window.decorView.rootWindowInsets
        val systemBars = windowInsets?.getInsets(WindowInsetsCompat.Type.systemBars())
        val statusBarHeight = systemBars?.top ?: 0
        val navigationBarHeight = systemBars?.bottom ?: 0

        // 추가 여백
        val additionalMargin = 60
        return statusBarHeight + navigationBarHeight + additionalMargin
    }

    // 기존 방식 (Android 10 이하)
    val resourceId = resources.getIdentifier("status_bar_height", "dimen", "android")
    val statusBarHeight = if (resourceId > 0) {
        resources.getDimensionPixelSize(resourceId)
    } else {
        0
    }

    // 네비게이션바 높이 계산
    val navigationBarHeight = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        val navResourceId = resources.getIdentifier("navigation_bar_height", "dimen", "android")
        if (navResourceId > 0) {
            resources.getDimensionPixelSize(navResourceId)
        } else {
            0
        }
    } else {
        0
    }

    // 추가 여백
    val additionalMargin = 60
    return statusBarHeight + navigationBarHeight + additionalMargin
}
```

### iOS 앱에서 상태바 높이 설정

```swift
private func getStatusBarHeight() -> CGFloat {
    let window = UIApplication.shared.windows.first { $0.isKeyWindow }
    return window?.windowScene?.statusBarManager?.statusBarFrame.height ?? 0
}
```

### 웹에서 상태바 높이 사용

```css
.header {
  top: var(--android-top-margin, 0px);
}

.content {
  padding-top: calc(70px + var(--android-top-margin, 0px));
}
```

## 장점

1. **동적 처리**: 다양한 기기의 상태바 높이를 자동으로 처리
2. **일관된 UI**: 웹과 네이티브 앱 간 일관된 레이아웃
3. **반응형**: 기기 회전이나 상태바 변경 시에도 적절히 대응
4. **성능 최적화**: CSS 변수를 통한 효율적인 스타일 적용

## 주의사항

1. **네이티브 앱 환경 감지**: `isNativeApp()` 함수로 네이티브 앱 환경인지 확인
2. **기본값 설정**: 상태바 높이를 가져올 수 없는 경우 기본값 사용
3. **이벤트 리스너 정리**: 컴포넌트 언마운트 시 이벤트 리스너 제거 필요
4. **크로스 브라우저 호환성**: CSS 변수 지원 여부 확인 필요
