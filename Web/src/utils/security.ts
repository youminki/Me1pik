/**
 * 보안 유틸리티
 */

/**
 * XSS 방지를 위한 HTML 이스케이프
 * @param text 이스케이프할 텍스트
 * @returns 이스케이프된 텍스트
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * URL 검증
 * @param url 검증할 URL
 * @returns 유효성 여부
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
 * 안전한 URL 생성
 * @param url 원본 URL
 * @returns 안전한 URL
 */
export const sanitizeUrl = (url: string): string => {
  if (!isValidUrl(url)) {
    return '#';
  }
  return url;
};

/**
 * 민감한 데이터 마스킹
 * @param data 마스킹할 데이터
 * @param type 데이터 타입
 * @returns 마스킹된 데이터
 */
export const maskSensitiveData = (
  data: string,
  type: 'email' | 'phone' | 'card' | 'ssn'
): string => {
  switch (type) {
    case 'email': {
      const [local, domain] = data.split('@');
      return `${local.charAt(0)}***@${domain}`;
    }

    case 'phone':
      return data.replace(/(\d{3})\d{4}(\d{4})/, '$1-****-$2');

    case 'card':
      return data.replace(/(\d{4})\d{8}(\d{4})/, '$1-****-****-$2');

    case 'ssn':
      return data.replace(/(\d{6})\d{7}/, '$1-*******');

    default:
      return data;
  }
};

/**
 * CSRF 토큰 생성
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
 * 안전한 랜덤 문자열 생성
 * @param length 문자열 길이
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
 * 입력 데이터 검증
 * @param input 검증할 입력값
 * @param rules 검증 규칙
 * @returns 검증 결과
 */
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

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
 * Content Security Policy 헤더 생성
 * @returns CSP 헤더
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
 * 안전한 JSON 파싱
 * @param json JSON 문자열
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
 * 안전한 localStorage 사용
 * @param key 키
 * @param value 값
 */
export const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('localStorage 저장 실패:', error);
  }
};

/**
 * 안전한 localStorage 읽기
 * @param key 키
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
