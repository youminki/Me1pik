import DOMPurify from 'dompurify';

/**
 * sanitize 유틸리티
 *
 * HTML 콘텐츠 정제 기능을 제공하는 유틸리티입니다.
 * XSS 공격을 방지하기 위해 HTML 콘텐츠를 안전하게 정제합니다.
 */

/**
 * sanitize 함수
 *
 * XSS 공격을 방지하기 위해 HTML 콘텐츠를 안전하게 정제합니다.
 * DOMPurify 라이브러리를 사용하여 악성 스크립트와 위험한 태그를 제거합니다.
 *
 * @param html - 정제할 HTML 문자열
 * @returns 안전하게 정제된 HTML 문자열
 */
export function sanitize(html: string): string {
  return DOMPurify.sanitize(html);
}
