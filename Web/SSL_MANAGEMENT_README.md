# 🔒 SSL 인증서 비동기 관리 시스템

me1pik.com 도메인에 대한 SSL 인증서를 Vercel에서 비동기적으로 생성하고 관리하는 시스템입니다.

## 🚀 주요 기능

### ✅ SSL 인증서 관리

- **비동기 생성**: SSL 인증서 생성 요청을 비동기적으로 처리
- **자동 모니터링**: 실시간 SSL 상태 모니터링 (1분마다 자동 새로고침)
- **자동 갱신**: 만료 예정 인증서 자동 감지 및 갱신
- **상태 추적**: 생성, 활성, 오류, 만료 상태 실시간 추적

### 🔧 기술적 특징

- **React Hooks**: `useSSLMonitor` 훅으로 상태 관리
- **TypeScript**: 타입 안전성 보장
- **Vercel API**: 공식 Vercel API를 통한 안전한 SSL 관리
- **에러 처리**: 견고한 에러 처리 및 복구 메커니즘

## 📋 설치 및 설정

### 1. 환경 변수 설정

```bash
# .env 파일 생성
VERCEL_TOKEN=your_vercel_api_token_here
SSL_AUTO_REFRESH=true
SSL_REFRESH_INTERVAL=60000
SSL_DOMAINS=me1pik.com,www.me1pik.com
```

### 2. Vercel API 토큰 발급

1. [Vercel Dashboard](https://vercel.com/account/tokens) 접속
2. "Create Token" 클릭
3. 토큰 이름 입력 (예: "SSL Management")
4. 토큰 복사하여 `.env` 파일에 설정

### 3. 의존성 설치

```bash
npm install axios
# 또는
yarn add axios
```

## 🎯 사용법

### 기본 사용법

```tsx
import { useSSLMonitor } from '../hooks/useSSLMonitor';

const MyComponent = () => {
  const {
    sslStatuses,
    loading,
    error,
    createSSLCertificate,
    renewSSLCertificate,
  } = useSSLMonitor({
    domains: ['me1pik.com'],
    autoRefresh: true,
    refreshInterval: 60000,
  });

  // SSL 인증서 생성
  const handleCreate = async () => {
    await createSSLCertificate({
      domain: 'example.com',
      forceRenewal: false,
      waitForCompletion: false,
    });
  };

  // SSL 인증서 갱신
  const handleRenew = async () => {
    await renewSSLCertificate('me1pik.com');
  };

  return <div>{/* 컴포넌트 내용 */}</div>;
};
```

### 대시보드 사용법

```tsx
import SSLManagementDashboard from '../components/SSLManagementDashboard';

const App = () => {
  return (
    <div>
      <SSLManagementDashboard />
    </div>
  );
};
```

## 🔍 API 참조

### SSLManager 클래스

```typescript
class SSLManager {
  // SSL 인증서 생성 (비동기)
  createSSLCertificate(
    request: SSLCreationRequest
  ): Promise<{ requestId: string; status: string }>;

  // SSL 상태 확인
  checkSSLStatus(domain: string): Promise<SSLStatus>;

  // SSL 인증서 갱신
  renewSSLCertificate(
    domain: string
  ): Promise<{ requestId: string; status: string }>;

  // 모든 도메인 SSL 상태 확인
  checkAllDomainsSSL(): Promise<SSLStatus[]>;

  // 만료 예정 인증서 확인
  getExpiringCertificates(daysThreshold: number): Promise<SSLStatus[]>;
}
```

### useSSLMonitor 훅

```typescript
const {
  sslStatuses, // SSL 상태 배열
  loading, // 로딩 상태
  error, // 에러 정보
  lastUpdated, // 마지막 업데이트 시간
  expiringCertificates, // 만료 예정 인증서
  errorCertificates, // 오류 상태 인증서
  createSSLCertificate, // SSL 생성 함수
  renewSSLCertificate, // SSL 갱신 함수
  refresh, // 수동 새로고침 함수
  checkSSLStatuses, // 상태 확인 함수
} = useSSLMonitor(options);
```

## 📊 SSL 상태 코드

| 상태      | 설명      | 색상    |
| --------- | --------- | ------- |
| `active`  | 활성 상태 | 🟢 초록 |
| `pending` | 대기 중   | 🟡 노랑 |
| `error`   | 오류 상태 | 🔴 빨강 |
| `expired` | 만료됨    | 🔴 빨강 |

## 🚨 주의사항

### 보안

- **API 토큰 보호**: `.env` 파일을 `.gitignore`에 추가
- **환경별 설정**: 개발/스테이징/프로덕션 환경별 토큰 분리
- **권한 제한**: 필요한 최소 권한만 부여

### 성능

- **API 호출 제한**: Vercel API 호출 제한 준수
- **캐싱 활용**: 불필요한 API 호출 최소화
- **배치 처리**: 여러 도메인 상태를 한 번에 확인

### 모니터링

- **로그 추적**: SSL 생성/갱신 과정 로깅
- **알림 설정**: 오류 발생 시 알림 설정
- **정기 점검**: 주기적인 SSL 상태 점검

## 🔧 문제 해결

### 일반적인 문제들

#### 1. API 토큰 오류

```bash
Error: SSL 인증서 생성 실패: 401 Unauthorized
```

**해결방법**: Vercel API 토큰이 올바르게 설정되었는지 확인

#### 2. 도메인 권한 오류

```bash
Error: SSL 상태 확인 실패: 403 Forbidden
```

**해결방법**: 해당 도메인에 대한 권한이 있는지 확인

#### 3. 네트워크 타임아웃

```bash
Error: SSL 상태 확인 실패: timeout
```

**해결방법**: 네트워크 연결 상태 확인 및 재시도

### 디버깅 팁

1. **브라우저 개발자 도구**: 네트워크 탭에서 API 호출 확인
2. **콘솔 로그**: 에러 메시지 및 상태 변화 추적
3. **Vercel Dashboard**: 도메인 및 SSL 상태 직접 확인

## 📈 향후 개선 계획

- [ ] **자동 갱신**: 만료 전 자동 SSL 갱신
- [ ] **알림 시스템**: Slack/이메일 알림 연동
- [ ] **메트릭 수집**: SSL 상태 통계 및 분석
- [ ] **백업 시스템**: SSL 설정 백업 및 복구
- [ ] **멀티 프로바이더**: Let's Encrypt 등 다른 CA 지원

## 📞 지원

문제가 발생하거나 질문이 있으시면:

1. 이슈 트래커에 문제 등록
2. 개발팀에 문의
3. Vercel 공식 문서 참조

---

**마지막 업데이트**: 2025년 8월 28일
**버전**: 1.0.0
**작성자**: 개발팀
