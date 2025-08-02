import DOMPurify from 'dompurify';

export function sanitize(html: string) {
  return DOMPurify.sanitize(html);
}
