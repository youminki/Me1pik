# API 유틸리티 가이드

이 디렉토리에는 인증, 회원, 상품, 주소 등 주요 API 호출 및 데이터 유틸리티가 포함되어 있습니다.

## 주요 API 유틸리티

### 1. 인증/회원

- **LoginPost**: 로그인, 토큰 저장/반환, 에러 메시지 일관 처리
- **signupUser**: 회원가입, 성공/실패/에러 타입 명확화
- **userApi**: 회원 정보, 이메일 찾기, 중복 체크 등

### 2. 상품/브랜드

- **getBrandList, getProductsByBrand**: 브랜드/상품 목록 조회, 타입 안전성 보장
- **productApi**: 상품 상세, 검색, 필터 등

### 3. 주소

- **AddressApi**: 주소 목록, 생성, 수정, 삭제, 기본 설정 등
- **useAddresses, useCreateAddress**: react-query 기반 데이터 패칭/변경

## 에러 처리 정책

- 모든 API 함수는 에러 발생 시 명확한 타입(`ApiError`, `LoginError` 등)으로 throw
- 에러 메시지는 UI에서 일관되게 처리 가능
- 예시:

```ts
try {
  await signupUser(data);
} catch (err) {
  if (typeof err === 'object' && err && 'message' in err) {
    alert(err.message);
  }
}
```

## 예시 코드

```ts
// 로그인
const result = await LoginPost(email, password);
console.log(result.accessToken);

// 회원가입
await signupUser({ ... });

// 브랜드 목록
const brands = await getBrandList();

// 주소 추가
await AddressApi.createAddress({ address, addressDetail, deliveryMessage });
```

## 실무 적용 팁

- 모든 API 함수는 타입스크립트 타입을 엄격히 준수합니다.
- 에러 핸들링은 try/catch와 타입 가드(isApiError 등)로 일관되게 처리하세요.
- react-query 훅은 캐싱/로딩/에러 상태를 자동 관리합니다.
- API 변경 시 반드시 타입/에러 정책을 함께 점검하세요.

## 참고

- [Axios 공식 문서](https://axios-http.com/)
- [React Query 공식 문서](https://tanstack.com/query/latest)
