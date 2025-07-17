# 멜픽 (Melpik) - React + TypeScript + Vite

멜픽은 의류 대여 서비스를 제공하는 웹 애플리케이션입니다. React, TypeScript, Vite를 기반으로 구축되었으며, 안드로이드와 iOS 네이티브 앱과의 연동을 지원합니다.

## 주요 기능

- **사용자 인증**: 로그인, 회원가입, 비밀번호 찾기
- **상품 관리**: 의류 상품 조회, 장바구니, 결제
- **렌탈 서비스**: 의류 대여 스케줄링, 이용권 관리
- **네이티브 앱 연동**: 안드로이드/iOS 앱과의 원활한 연동
- **반응형 디자인**: 모바일 최적화된 UI/UX

## 네이티브 앱 로그인 연동

### 기능 개요

- 웹뷰 환경에서 네이티브 앱의 로그인 상태를 자동으로 감지
- 로그인 토큰이 없을 때 네이티브 앱에 로그인 요청
- 네이티브 앱에서 로그인 완료 시 웹뷰로 로그인 정보 전달

### 지원 플랫폼

- **Android**: React Native WebView
- **iOS**: WKWebView
- **웹**: 일반 브라우저 환경

### 구현된 기능

#### 1. 네이티브 앱 환경 감지

```typescript
import { isNativeApp } from './utils/nativeApp';

// 네이티브 앱 환경인지 확인
if (isNativeApp()) {
  // 네이티브 앱 전용 로직
}
```

#### 2. 로그인 요청 전송

```typescript
import { requestNativeLogin } from './utils/nativeApp';

// 네이티브 앱에 로그인 요청
requestNativeLogin();
```

#### 3. 로그인 정보 저장

```typescript
import { saveNativeLoginInfo } from './utils/nativeApp';

// 네이티브 앱에 로그인 정보 저장
saveNativeLoginInfo({
  id: 'user@example.com',
  email: 'user@example.com',
  token: 'access_token',
  refreshToken: 'refresh_token',
  expiresAt: '2024-12-31T23:59:59.999Z',
});
```

### 네이티브 앱에서 구현해야 할 기능

#### Android (React Native)

```javascript
// WebView에 주입할 함수들
window.nativeApp = {
  requestLogin: () => {
    // 네이티브 로그인 화면으로 이동
    NativeModules.AuthModule.showLogin();
  },
  saveLoginInfo: (data) => {
    // 로그인 정보를 네이티브에 저장
    NativeModules.AuthModule.saveLoginInfo(data);
  },
};
```

#### iOS (Swift)

```swift
// WKWebView에 주입할 함수들
webView.evaluateJavaScript("""
window.nativeApp = {
  requestLogin: function() {
    // 네이티브 로그인 화면으로 이동
    window.webkit.messageHandlers.loginHandler.postMessage({
      type: 'REQUEST_LOGIN'
    });
  },
  saveLoginInfo: function(data) {
    // 로그인 정보를 네이티브에 저장
    window.webkit.messageHandlers.loginHandler.postMessage({
      type: 'SAVE_LOGIN_INFO',
      data: data
    });
  }
};
""")
```

## 🧪 테스트 실행 및 CustomModal mock 안내

- `src/pages/Melpik/Setting/__tests__/SettingMelpik.test.tsx`에서는 CustomModal mock에서 '확인' 버튼을 직접 추가합니다.
- 이는 테스트 환경에서 포털/조건부 렌더링 등으로 인해 실제 children이 노출되지 않는 한계를 보완하기 위함입니다.
- 실제 서비스 코드에는 영향이 없으며, E2E 테스트에서는 실제 모달 동작까지 검증할 수 있습니다.

### 테스트 실행 방법

```bash
yarn jest src/pages/Melpik/Setting/__tests__/SettingMelpik.test.tsx --coverage
```

### E2E 테스트 도입 권장

- 실제 브라우저 환경에서 포털/모달/버튼 동작까지 검증하려면 Cypress, Playwright 등 도구를 활용한 E2E 테스트를 추가하는 것이 좋습니다.

## 개발 환경 설정

### 필수 요구사항

- Node.js 18.0.0 이상
- Yarn 또는 npm

### 설치 및 실행

```bash
# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev

# 빌드
yarn build

# 린트 검사
yarn lint
```

## 프로젝트 구조

```
src/
├── api/           # API 통신 관련
├── assets/        # 이미지, 아이콘 등 정적 파일
├── components/    # 재사용 가능한 컴포넌트
├── hooks/         # 커스텀 훅
├── pages/         # 페이지 컴포넌트
├── styles/        # 스타일 관련
├── utils/         # 유틸리티 함수
└── App.tsx        # 메인 앱 컴포넌트
```

## 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Styled Components
- **State Management**: React Hook Form, React Query
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Linting**: ESLint, TypeScript ESLint

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

---

## 기존 Vite 설정 정보

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react';

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
});
```
