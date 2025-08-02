/**
 * security 유틸리티 모음
 *
 * 애플리케이션 보안 유틸리티를 제공합니다.
 * 웹 보안 위협으로부터 애플리케이션을 보호하는 기능들을 제공합니다.
 *
 * @description
 * - XSS (Cross-Site Scripting) 방지
 * - CSRF (Cross-Site Request Forgery) 방지
 * - 입력 데이터 검증
 * - 민감한 데이터 마스킹
 * - 안전한 데이터 저장/조회
 * - Content Security Policy 생성
 */

/**
 * escapeHtml 함수
 *
 * XSS 방지를 위한 HTML 이스케이프를 수행합니다.
 * 사용자 입력을 안전하게 HTML에 삽입할 수 있도록 이스케이프합니다.
 * DOM API를 사용하여 안전하게 텍스트를 이스케이프합니다.
 *
 * @param text - 이스케이프할 텍스트
 * @returns 이스케이프된 안전한 텍스트
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * isValidUrl 함수
 *
 * URL이 안전한 프로토콜(http, https)을 사용하는지 확인합니다.
 *
 * @param url - 검증할 URL
 * @returns 유효한 URL이면 true, 그렇지 않으면 false
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * sanitizeUrl 함수
 *
 * URL이 유효하지 않은 경우 안전한 기본값으로 대체합니다.
 *
 * @param url - 원본 URL
 * @returns 안전한 URL (유효하지 않으면 '#')
 */
export const sanitizeUrl = (url: string): string => {
  if (!isValidUrl(url)) {
    return '#';
  }
  return url;
};

/**
 * maskSensitiveData 함수
 *
 * 개인정보 보호를 위해 민감한 데이터를 마스킹 처리합니다.
 * 각 데이터 타입에 맞는 적절한 마스킹 패턴을 적용합니다.
 *
 * @param data - 마스킹할 데이터
 * @param type - 데이터 타입 (email, phone, card, ssn)
 * @returns 마스킹된 데이터
 */
export const maskSensitiveData = (
  data: string,
  type: 'email' | 'phone' | 'card' | 'ssn'
): string => {
  switch (type) {
    case 'email': {
      // 이메일: 로컬 부분 첫 글자만 표시, 나머지는 ***
      const [local, domain] = data.split('@');
      return `${local.charAt(0)}***@${domain}`;
    }

    case 'phone':
      // 전화번호: 중간 4자리만 마스킹
      return data.replace(/(\d{3})\d{4}(\d{4})/, '$1-****-$2');

    case 'card':
      // 카드번호: 중간 8자리 마스킹
      return data.replace(/(\d{4})\d{8}(\d{4})/, '$1-****-****-$2');

    case 'ssn':
      // 주민번호: 뒷자리 7자리 마스킹
      return data.replace(/(\d{6})\d{7}/, '$1-*******');

    default:
      return data;
  }
};

/**
 * generateCSRFToken 함수
 *
 * CSRF 토큰을 생성합니다.
 *
 * @returns CSRF 토큰
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
};

/**
 * generateSecureRandomString 함수
 *
 * 안전한 랜덤 문자열을 생성합니다.
 *
 * @param length - 문자열 길이 (기본값: 32)
 * @returns 랜덤 문자열
 */
export const generateSecureRandomString = (length: number = 32): string => {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    result += charset[array[i] % charset.length];
  }

  return result;
};

/**
 * ValidationRule 인터페이스
 *
 * 입력 데이터 검증 규칙을 정의합니다.
 *
 * @property required - 필수 입력 여부
 * @property minLength - 최소 길이
 * @property maxLength - 최대 길이
 * @property pattern - 정규식 패턴
 * @property custom - 커스텀 검증 함수
 */
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
}

/**
 * ValidationResult 인터페이스
 *
 * 입력 데이터 검증 결과를 담는 인터페이스입니다.
 *
 * @property isValid - 유효성 여부
 * @property errors - 에러 메시지 배열
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * validateInput 함수
 *
 * 입력 데이터를 검증합니다.
 *
 * @param input - 검증할 입력값
 * @param rules - 검증 규칙
 * @returns 검증 결과
 */
export const validateInput = (
  input: string,
  rules: ValidationRule
): ValidationResult => {
  const errors: string[] = [];

  if (rules.required && !input.trim()) {
    errors.push('필수 입력 항목입니다.');
  }

  if (input && rules.minLength && input.length < rules.minLength) {
    errors.push(`최소 ${rules.minLength}자 이상 입력해주세요.`);
  }

  if (input && rules.maxLength && input.length > rules.maxLength) {
    errors.push(`최대 ${rules.maxLength}자까지 입력 가능합니다.`);
  }

  if (input && rules.pattern && !rules.pattern.test(input)) {
    errors.push('올바른 형식으로 입력해주세요.');
  }

  if (input && rules.custom && !rules.custom(input)) {
    errors.push('유효하지 않은 입력입니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * generateCSPHeader 함수
 *
 * Content Security Policy 헤더를 생성합니다.
 *
 * @returns CSP 헤더 문자열
 */
export const generateCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
};

/**
 * safeJsonParse 함수
 *
 * 안전한 JSON 파싱을 수행합니다.
 *
 * @template T - 파싱할 타입
 * @param json - JSON 문자열
 * @returns 파싱된 객체 또는 null
 */
export const safeJsonParse = <T>(json: string): T | null => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
};

/**
 * safeSetItem 함수
 *
 * 안전한 localStorage 저장을 수행합니다.
 *
 * @param key - 저장할 키
 * @param value - 저장할 값
 */
export const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('localStorage 저장 실패:', error);
  }
};

/**
 * safeGetItem 함수
 *
 * 안전한 localStorage 읽기를 수행합니다.
 *
 * @param key - 읽을 키
 * @returns 값 또는 null
 */
export const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('localStorage 읽기 실패:', error);
    return null;
  }
};
