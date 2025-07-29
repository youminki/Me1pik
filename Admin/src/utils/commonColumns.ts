import { formatDate, formatDateTime } from 'src/utils/format';

// key 타입을 keyof T로 명확히 지정하여 CommonSettingTableColumn과 호환
export function noColumn<T extends { no: any }>(label = 'No.', width = '60px') {
  return { key: 'no' as keyof T, label, width };
}
export function authorColumn<T extends { author: any }>(label = '작성자', width = '120px') {
  return { key: 'author' as keyof T, label, width };
}
export function createdAtColumn<T extends { createdAt: any }>(
  label = '등록일',
  width = '100px',
  withTime = false,
) {
  return {
    key: 'createdAt' as keyof T,
    label,
    width,
    render: (v: unknown) => (withTime ? formatDateTime(v as string) : formatDate(v as string)),
  };
}

export const commonColumns = {
  no: noColumn,
  author: authorColumn,
  createdAt: createdAtColumn,
  createdAtTime: <T extends { createdAt: any }>() => createdAtColumn<T>('등록일시', '160px', true),
};
