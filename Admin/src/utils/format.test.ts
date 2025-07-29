import { formatDate, formatMoney, formatDateTime } from './format';

describe('formatDate', () => {
  it('YYYY.MM.DD 형식으로 날짜를 반환한다', () => {
    expect(formatDate('2024-07-24')).toBe('2024.07.24');
    expect(formatDate(new Date('2023-01-02'))).toBe('2023.01.02');
  });
  it('잘못된 날짜는 빈 문자열을 반환한다', () => {
    expect(formatDate('invalid-date')).toBe('');
  });
});

describe('formatMoney', () => {
  it('숫자를 천 단위 구분자로 반환한다', () => {
    expect(formatMoney(1234567)).toBe('1,234,567');
    expect(formatMoney('89000')).toBe('89,000');
  });
  it('잘못된 값은 빈 문자열을 반환한다', () => {
    expect(formatMoney('abc')).toBe('');
  });
});

describe('formatDateTime', () => {
  it('YYYY.MM.DD HH:mm 형식으로 날짜와 시간을 반환한다', () => {
    expect(formatDateTime('2024-07-24T15:30:00')).toBe('2024.07.24 15:30');
    expect(formatDateTime(new Date('2023-01-02T09:05:00'))).toBe('2023.01.02 09:05');
  });
  it('잘못된 날짜는 빈 문자열을 반환한다', () => {
    expect(formatDateTime('invalid-date')).toBe('');
  });
});
