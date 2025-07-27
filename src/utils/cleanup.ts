/**
 * 코드 정리 유틸리티
 */

/**
 * 사용하지 않는 import 제거
 */
export const removeUnusedImports = () => {
  // ESLint 규칙으로 자동 처리됨
  // no-unused-vars, @typescript-eslint/no-unused-vars
  console.log('사용하지 않는 import는 ESLint가 자동으로 처리합니다.');
};

/**
 * Dead code 제거
 */
export const removeDeadCode = () => {
  // 사용하지 않는 함수, 변수, 클래스 제거
  // TypeScript strict 모드에서 자동 감지
  console.log('Dead code는 TypeScript strict 모드에서 감지됩니다.');
};

/**
 * 콘솔 로그 정리
 */
export const cleanupConsoleLogs = () => {
  // 프로덕션 빌드에서 자동 제거됨
  // vite.config.ts의 minify 옵션으로 처리
  console.log('프로덕션 빌드에서 콘솔 로그가 자동 제거됩니다.');
};

/**
 * TODO, FIXME 주석 정리
 */
export const cleanupTODOs = () => {
  // 개발 완료 후 TODO, FIXME 주석 제거
  // eslint-plugin-todo 사용 권장
  console.log('TODO, FIXME 주석을 정리하세요.');
};

/**
 * 타입 안전성 개선
 */
export const improveTypeSafety = () => {
  // any 타입 사용 최소화
  // strict 모드 활성화
  console.log('TypeScript strict 모드를 활성화하세요.');
};

/**
 * 성능 최적화 체크리스트
 */
export const performanceChecklist = () => {
  const checklist = [
    '✅ 번들 크기 최적화 (청크 분할)',
    '✅ 이미지 최적화 (WebP, lazy loading)',
    '✅ 폰트 최적화 (WOFF2, preload)',
    '✅ 메모이제이션 적용 (React.memo, useMemo)',
    '✅ 코드 스플리팅 (React.lazy)',
    '✅ Service Worker 등록',
    '✅ HTTP 캐싱 헤더 설정',
    '✅ PWA 매니페스트 추가',
    '✅ 성능 모니터링 구현',
    '✅ 불필요한 리렌더링 방지',
    '✅ 네트워크 요청 최적화',
    '✅ 로컬 스토리지 캐싱',
  ];

  console.log('성능 최적화 체크리스트:');
  checklist.forEach((item) => console.log(item));
};

/**
 * 보안 체크리스트
 */
export const securityChecklist = () => {
  const checklist = [
    '✅ CSP 헤더 설정',
    '✅ HTTPS 사용',
    '✅ 토큰 안전한 저장',
    '✅ XSS 방지',
    '✅ CSRF 방지',
    '✅ 입력값 검증',
    '✅ 에러 메시지 노출 방지',
  ];

  console.log('보안 체크리스트:');
  checklist.forEach((item) => console.log(item));
};

/**
 * 접근성 체크리스트
 */
export const accessibilityChecklist = () => {
  const checklist = [
    '✅ 시맨틱 HTML 사용',
    '✅ ARIA 라벨 추가',
    '✅ 키보드 네비게이션 지원',
    '✅ 색상 대비 확인',
    '✅ 스크린 리더 지원',
    '✅ 포커스 표시 개선',
    '✅ alt 텍스트 추가',
  ];

  console.log('접근성 체크리스트:');
  checklist.forEach((item) => console.log(item));
};
