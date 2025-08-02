import { CommonSettingTableColumn } from '@components/Table/Setting/CommonSettingTable';
import { TermsItem } from 'src/types/setting';
import { noColumn, authorColumn, createdAtColumn } from 'src/utils/commonColumns';

export const termsColumns: CommonSettingTableColumn<TermsItem>[] = [
  noColumn<TermsItem>(),
  { key: 'category', label: '구분', width: '80px' },
  { key: 'title', label: '제목', width: '30%' },
  { key: 'content', label: '내용' },
  authorColumn<TermsItem>(),
  createdAtColumn<TermsItem>(),
];
