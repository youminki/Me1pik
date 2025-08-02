import { CommonSettingTableColumn } from '@components/Table/Setting/CommonSettingTable';
import { NoticeItem } from 'src/types/setting';
import { noColumn, authorColumn, createdAtColumn } from 'src/utils/commonColumns';

export const noticeColumns: CommonSettingTableColumn<NoticeItem>[] = [
  noColumn<NoticeItem>(),
  { key: 'category', label: '구분', width: '80px' },
  { key: 'title', label: '제목', width: '30%' },
  { key: 'content', label: '내용' },
  authorColumn<NoticeItem>(),
  createdAtColumn<NoticeItem>(),
];
