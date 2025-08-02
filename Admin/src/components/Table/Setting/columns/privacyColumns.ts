import { CommonSettingTableColumn } from '@components/Table/Setting/CommonSettingTable';
import { noColumn, authorColumn, createdAtColumn } from 'src/utils/commonColumns';
import { PrivacyItem } from 'src/types/setting';

export const privacyColumns: CommonSettingTableColumn<PrivacyItem>[] = [
  noColumn<PrivacyItem>(),
  { key: 'category', label: '구분', width: '80px' },
  { key: 'title', label: '제목', width: '30%' },
  { key: 'content', label: '내용' },
  authorColumn<PrivacyItem>(),
  createdAtColumn<PrivacyItem>(),
];
