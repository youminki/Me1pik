/**
 * format 유틸리티 모음
 *
 * 다양한 데이터 포맷팅 기능을 제공하는 유틸리티 함수 집합입니다.
 * - formatCurrency: 통화 포맷팅
 * - formatNumber: 숫자 포맷팅
 * - formatDate: 날짜 포맷팅
 * - formatFileSize: 파일 크기 포맷팅
 * - formatPhone: 전화번호 포맷팅
 * - formatCardNumber: 카드번호 포맷팅
 * - truncateText: 텍스트 자르기
 * - formatPercentage: 퍼센트 포맷팅
 */

/**
 * formatCurrency 함수
 *
 * 숫자를 통화 형식으로 포맷팅합니다.
 *
 * @param amount - 금액
 * @param currency - 통화 (기본값: 'KRW')
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
 * formatNumber 함수
 *
 * 숫자를 천 단위 구분자로 포맷팅합니다.
 *
 * @param number - 숫자
 * @returns 포맷팅된 문자열
 */
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('ko-KR').format(number);
};

/**
 * formatDate 함수
 *
 * 날짜를 다양한 형식으로 포맷팅합니다.
 *
 * @param date - 날짜 (Date 객체 또는 문자열)
 * @param format - 포맷 옵션 ('short', 'long', 'time', 'relative')
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
 * formatRelativeTime 함수
 *
 * 상대적 시간을 포맷팅합니다 (예: "방금 전", "5분 전").
 *
 * @param date - 날짜
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
 * formatFileSize 함수
 *
 * 바이트 단위의 파일 크기를 읽기 쉬운 형태로 포맷팅합니다.
 *
 * @param bytes - 바이트
 * @returns 포맷팅된 문자열 (예: "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * formatPhone 함수
 *
 * 전화번호를 하이픈이 포함된 형식으로 포맷팅합니다.
 *
 * @param phone - 전화번호
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
 * formatCardNumber 함수
 *
 * 카드번호를 4자리씩 공백으로 구분하여 포맷팅합니다.
 *
 * @param cardNumber - 카드번호
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
 * truncateText 함수
 *
 * 텍스트를 지정된 길이로 자르고 줄임표를 추가합니다.
 *
 * @param text - 텍스트
 * @param MAX_LENGTH - 최대 길이
 * @returns 잘린 텍스트
 */
export const truncateText = (text: string, MAX_LENGTH: number): string => {
  if (text.length <= MAX_LENGTH) {
    return text;
  }

  return `${text.slice(0, MAX_LENGTH)}...`;
};

/**
 * formatPercentage 함수
 *
 * 숫자를 퍼센트로 포맷팅합니다.
 *
 * @param value - 값
 * @param total - 전체 값
 * @param decimals - 소수점 자릿수 (기본값: 1)
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
