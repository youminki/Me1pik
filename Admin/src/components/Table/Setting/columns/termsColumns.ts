import { CommonSettingTableColumn } from '@components/Table/Setting/CommonSettingTable';
import { TermsItem } from 'src/types/setting';
import { noColumn, authorColumn, createdAtColumn } from 'src/utils/commonColumns';

/**
 * 이용약관 컬럼 정의
 * - 이용약관 테이블에 필요한 컬럼 배열
 */
export const termsColumns: CommonSettingTableColumn<TermsItem>[] = [
  noColumn<TermsItem>(),
  { key: 'category', label: '구분', width: '80px' },
  { key: 'title', label: '제목', width: '30%' },
  { key: 'content', label: '내용' },
  authorColumn<TermsItem>(),
  createdAtColumn<TermsItem>(),
];
