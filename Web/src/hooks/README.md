# 커스텀 훅(Hooks) 가이드

이 디렉토리에는 프로젝트 전역에서 재사용되는 커스텀 훅이 포함되어 있습니다.

## 주요 훅

### 1. useApi

- 비동기 API 호출을 위한 상태 관리 훅
- 반환값: `{ data, loading, error, execute, reset }`
- 예시:

```tsx
const { data, loading, error, execute } = useApi(fetchUser);
useEffect(() => {
  execute();
}, []);
```

### 2. useAsyncState

- 비동기 함수의 로딩/에러/데이터 상태를 관리
- 반환값: `{ data, loading, error, execute, reset }`
- 예시:

```tsx
const { data, loading, error, execute } = useAsyncState(fetchData);
<button onClick={() => execute()}>불러오기</button>;
```

### 3. useCache

- 메모리/로컬스토리지 기반 캐싱 훅
- 반환값: `{ get, set, remove, clear }`
- 예시:

```tsx
const { get, set } = useCache('user');
set('profile', { name: '홍길동' });
const profile = get('profile');
```

### 4. useOnlineStatus

- 네트워크 온라인/오프라인 상태 감지
- 반환값: `isOnline: boolean`
- 예시:

```tsx
const isOnline = useOnlineStatus();
if (!isOnline) return <ErrorMessage message='오프라인 상태입니다.' />;
```

### 5. useI18n

- 다국어 번역/언어 변경 지원
- 반환값: `{ t, locale, setLocale }`
- 예시:

```tsx
const { t, locale, setLocale } = useI18n();
<span>{t('로그인')}</span>;
```

## 실무 적용 팁

- 모든 커스텀 훅은 타입 안전성을 보장하며, 반환값 구조를 일관되게 유지합니다.
- 비동기 훅은 반드시 loading/error/data 상태를 활용해 UI를 제어하세요.
- 캐싱 훅은 SSR/CSR 환경 모두에서 안전하게 동작합니다.
- 네트워크/접근성 훅은 사용자 경험 개선에 적극 활용하세요.

## 참고

- [React 공식 훅 가이드](https://react.dev/reference/react)
- [React Custom Hooks 패턴](https://usehooks.com/)
