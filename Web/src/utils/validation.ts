/**
 * 데이터 유효성 검사 유틸리티 (validation.ts)
 *
 * 애플리케이션에서 사용되는 다양한 데이터의 유효성을 검사하는 유틸리티 함수 집합입니다.
 * 이메일, 비밀번호, 전화번호, 우편번호, 카드번호, URL 등 다양한 형식을 검증하며,
 * 보안성과 사용자 경험을 모두 고려한 검증 로직을 제공합니다.
 *
 * @description
 * - isValidEmail: 이메일 주소 형식 검증
 * - isValidPassword: 비밀번호 복잡도 검증 (보안 강화)
 * - isValidPhone: 한국 전화번호 형식 검증
 * - isValidPostalCode: 우편번호 형식 검증
 * - isValidCardNumber: 카드번호 유효성 검증 (Luhn 알고리즘)
 * - isValidUrl: URL 형식 및 접근성 검증
 * - isInRange: 숫자 범위 검증
 * - isTextLengthValid: 문자열 길이 검증
 * - isRequired: 필수 필드 검증
 */

/**
 * 이메일 주소 유효성 검사 함수
 *
 * 이메일 주소가 올바른 형식인지 검증합니다.
 * 기본적인 이메일 형식 규칙을 적용하여 검사합니다.
 *
 * @param email - 검증할 이메일 주소
 * @returns 유효한 이메일 형식이면 true, 아니면 false
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 유효성 검사 함수
 *
 * 비밀번호가 보안 요구사항을 충족하는지 검증합니다.
 * 최소 8자, 영문/숫자/특수문자 조합을 확인하여 보안성을 강화합니다.
 *
 * @param password - 검증할 비밀번호
 * @returns 보안 요구사항을 충족하면 true, 아니면 false
 */
export const isValidPassword = (password: string): boolean => {
  // 최소 8자, 영문/숫자/특수문자 조합
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * 전화번호 유효성 검사 함수
 *
 * 한국 전화번호 형식에 맞는지 검증합니다.
 * 01X-XXXX-XXXX 형식의 휴대폰 번호를 확인합니다.
 *
 * @param phone - 검증할 전화번호
 * @returns 유효한 한국 전화번호 형식이면 true, 아니면 false
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * 우편번호 유효성 검사 함수
 *
 * 한국 우편번호 형식에 맞는지 검증합니다.
 * 5자리 숫자 형식을 확인합니다.
 *
 * @param postalCode - 검증할 우편번호
 * @returns 유효한 5자리 우편번호 형식이면 true, 아니면 false
 */
export const isValidPostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^\d{5}$/;
  return postalCodeRegex.test(postalCode);
};

/**
 * 카드번호 유효성 검사 함수
 *
 * Luhn 알고리즘을 사용하여 카드번호의 유효성을 검증합니다.
 * 체크섬 계산을 통해 카드번호가 올바른 형식인지 확인합니다.
 *
 * @param cardNumber - 검증할 카드번호 (공백 포함 가능)
 * @returns 유효한 카드번호 형식이면 true, 아니면 false
 */
export const isValidCardNumber = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s/g, '');

  if (!/^\d{13,19}$/.test(cleanNumber)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * isValidUrl 함수
 *
 * URL의 유효성을 검사합니다.
 *
 * @param url - URL
 * @returns 유효성 여부
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * isInRange 함수
 *
 * 숫자가 지정된 범위 내에 있는지 검사합니다.
 *
 * @param value - 검사할 값
 * @param min - 최소값
 * @param max - 최대값
 * @returns 유효성 여부
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * isTextLengthValid 함수
 *
 * 문자열의 길이가 지정된 범위 내에 있는지 검사합니다.
 *
 * @param text - 검사할 텍스트
 * @param min - 최소 길이
 * @param max - 최대 길이
 * @returns 유효성 여부
 */
export const isTextLengthValid = (
  text: string,
  min: number,
  max: number
): boolean => {
  return text.length >= min && text.length <= max;
};

/**
 * isRequired 함수
 *
 * 필수 필드가 비어있지 않은지 검사합니다.
 *
 * @param value - 검사할 값
 * @returns 유효성 여부
 */
export const isRequired = (
  value: string | number | null | undefined
): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};
