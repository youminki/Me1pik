/**
 * 숫자를 통화 형식으로 포맷팅
 * @param amount 금액
 * @param currency 통화 (기본값: 'KRW')
 * @returns 포맷팅된 문자열
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'KRW'
): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * 숫자를 천 단위 구분자로 포맷팅
 * @param number 숫자
 * @returns 포맷팅된 문자열
 */
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('ko-KR').format(number);
};

/**
 * 날짜를 포맷팅
 * @param date 날짜
 * @param format 포맷 옵션
 * @returns 포맷팅된 문자열
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'long' | 'time' | 'relative' = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('ko-KR');
    case 'long':
      return dateObj.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return dateObj.toLocaleTimeString('ko-KR');
    case 'relative':
      return formatRelativeTime(dateObj);
    default:
      return dateObj.toLocaleDateString('ko-KR');
  }
};

/**
 * 상대적 시간 포맷팅
 * @param date 날짜
 * @returns 상대적 시간 문자열
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '방금 전';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  }

  return date.toLocaleDateString('ko-KR');
};

/**
 * 파일 크기를 포맷팅
 * @param bytes 바이트
 * @returns 포맷팅된 문자열
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * 전화번호를 포맷팅
 * @param phone 전화번호
 * @returns 포맷팅된 전화번호
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }

  return phone;
};

/**
 * 카드번호를 포맷팅
 * @param cardNumber 카드번호
 * @returns 포맷팅된 카드번호
 */
export const formatCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);

  if (groups) {
    return groups.join(' ');
  }

  return cardNumber;
};

/**
 * 텍스트를 줄임표로 자르기
 * @param text 텍스트
 * @param MAX_LENGTH 최대 길이
 * @returns 잘린 텍스트
 */
export const truncateText = (text: string, MAX_LENGTH: number): string => {
  if (text.length <= MAX_LENGTH) {
    return text;
  }

  return `${text.slice(0, MAX_LENGTH)}...`;
};

/**
 * 숫자를 퍼센트로 포맷팅
 * @param value 값
 * @param total 전체 값
 * @param decimals 소수점 자릿수
 * @returns 퍼센트 문자열
 */
export const formatPercentage = (
  value: number,
  total: number,
  decimals: number = 1
): string => {
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};
