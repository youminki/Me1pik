# 멜픽 (Melpik) - React + TypeScript + Vite

멜픽은 의류 대여 서비스를 제공하는 웹 애플리케이션입니다. React, TypeScript, Vite를 기반으로 구축되었으며, 안드로이드와 iOS 네이티브 앱과의 연동을 지원합니다.

## 주요 기능

- **사용자 인증**: 로그인, 회원가입, 비밀번호 찾기
- **상품 관리**: 의류 상품 조회, 장바구니, 결제
- **렌탈 서비스**: 의류 대여 스케줄링, 이용권 관리
- **네이티브 앱 연동**: 안드로이드/iOS 앱과의 원활한 연동
- **반응형 디자인**: 모바일 최적화된 UI/UX

## 프로젝트 구조 및 개발 정책

### 절대경로 import alias

- 모든 import 경로는 `@/` alias(`@ = /src`)로 통일되어 있습니다.
- 예시: `import Button from '@/components/shared/buttons/PrimaryButton';`
- Vite/tsconfig에서 alias가 설정되어 있습니다.

### 디자인 시스템 theme

- `src/styles/theme.ts`에서 색상, 폰트, spacing, shadow, zIndex, radius, transition 등 일원화
- 모든 스타일은 theme 기반으로 작성 (styled-components)
- 타입 정의는 `src/styles/styled.d.ts`에서 일치 관리

### 테스트 정책

- 공통 컴포넌트/커스텀 훅 단위 테스트를 Jest + Testing Library로 작성
- 예시: `PrimaryButton`, `InputField`, `useHeaderConfig`, `useDebounce`, `useCache` 등
- 테스트 커버리지 1차 확보, 추가 커버리지 지속 보강

### 코드 품질 정책

- ESLint, TypeScript strict 모드 적용
- 불필요한 콘솔로그, TODO, any, @ts-ignore 등 위험 요소 제거
- dead code(사용하지 않는 파일/컴포넌트) 주기적 정리
- 스타일/타입/테마 정의 중복 없이 일원화

### 폴더 구조

```
src/
├── api-utils/      # API 통신 및 비즈니스 로직
├── assets/         # 이미지, 아이콘 등 정적 파일
├── components/     # 재사용 가능한 컴포넌트
├── hooks/          # 커스텀 훅
├── pages/          # 페이지 컴포넌트
├── styles/         # 스타일 및 theme
├── utils/          # 유틸리티 함수
└── App.tsx         # 메인 앱 컴포넌트
```

## 개발 환경 설정

- Node.js 20.0.0 이상 (package.json engines 참조)
- Yarn 또는 npm

### 설치 및 실행

```bash
# 의존성 설치
yarn install
# 개발 서버 실행
yarn dev
# 빌드 (환경별)
yarn build          # 기본 빌드
yarn build:dev      # 개발 환경 빌드
yarn build:staging  # 스테이징 환경 빌드
yarn build:prod     # 프로덕션 환경 빌드
# 린트 검사
yarn lint
yarn lint:fix       # 자동 수정
# 타입 체크
yarn type-check
# 테스트 실행
yarn test
yarn test:watch     # 감시 모드
yarn test:coverage  # 커버리지 포함
```

### 환경 변수 설정

프로젝트 루트에 다음 파일들을 생성하여 환경 변수를 설정하세요:

```bash
Web/
├── .env.local      # 로컬 개발용 (gitignore에 포함)
├── .env.development # 개발 환경용
├── .env.staging    # 스테이징 환경용
└── .env.production # 프로덕션 환경용
```

주요 환경 변수:

- `VITE_API_BASE_URL`: API 서버 URL
- `VITE_APP_ENV`: 애플리케이션 환경 (development/staging/production)
- `VITE_ENABLE_DEBUG_MODE`: 디버그 모드 활성화
- `VITE_ENABLE_ANALYTICS`: 분석 도구 활성화

## 네이티브 앱 로그인 연동

(생략: 기존 설명과 동일)

## 테스트 실행 및 E2E 권장

- `yarn test`로 단위 테스트 실행
- E2E 테스트는 Cypress, Playwright 등 도구로 추가 권장

## 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Styled Components (theme 기반)
- **State Management**: React Hook Form, React Query
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Linting**: ESLint, TypeScript ESLint
- **Testing**: Jest, React Testing Library

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다
