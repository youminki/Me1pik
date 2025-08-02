/**
 * 이메일 유효성 검사
 * @param email 이메일 주소
 * @returns 유효성 여부
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 유효성 검사
 * @param password 비밀번호
 * @returns 유효성 여부
 */
export const isValidPassword = (password: string): boolean => {
  // 최소 8자, 영문/숫자/특수문자 조합
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * 전화번호 유효성 검사
 * @param phone 전화번호
 * @returns 유효성 여부
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * 우편번호 유효성 검사
 * @param postalCode 우편번호
 * @returns 유효성 여부
 */
export const isValidPostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^\d{5}$/;
  return postalCodeRegex.test(postalCode);
};

/**
 * 카드번호 유효성 검사 (Luhn 알고리즘)
 * @param cardNumber 카드번호
 * @returns 유효성 여부
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
 * URL 유효성 검사
 * @param url URL
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
 * 숫자 범위 검사
 * @param value 검사할 값
 * @param min 최소값
 * @param max 최대값
 * @returns 유효성 여부
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * 문자열 길이 검사
 * @param text 검사할 텍스트
 * @param min 최소 길이
 * @param max 최대 길이
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
 * 필수 필드 검사
 * @param value 검사할 값
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
