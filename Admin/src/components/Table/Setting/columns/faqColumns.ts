import { CommonSettingTableColumn } from '@components/Table/Setting/CommonSettingTable';
import { noColumn, authorColumn, createdAtColumn } from 'src/utils/commonColumns';

export interface FAQItem {
  no: number;
  category: string;
  type: string;
  content: string;
  author: string;
  createdAt: string;
}

export const faqColumns: CommonSettingTableColumn<FAQItem>[] = [
  noColumn<FAQItem>(),
  { key: 'type', label: '제목', width: '30%' },
  { key: 'content', label: '내용' },
  authorColumn<FAQItem>(),
  createdAtColumn<FAQItem>(),
];
