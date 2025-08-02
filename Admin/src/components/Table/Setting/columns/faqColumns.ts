import { CommonSettingTableColumn } from '@components/Table/Setting/CommonSettingTable';
import { noColumn, authorColumn, createdAtColumn } from 'src/utils/commonColumns';

/**
 * FAQ 컬럼 정의(faqColumns)
 *
 * - FAQ 테이블에 필요한 컬럼 정의
 * - 번호, 제목, 내용, 작성자, 작성일 등 포함
 * - 공통 컬럼 유틸리티 함수 활용
 * - 재사용 가능한 공통 컴포넌트
 */

/**
 * FAQ 아이템 인터페이스
 * - FAQ 목록에 필요한 아이템 정보 구조
 */
export interface FAQItem {
  no: number;
  category: string;
  type: string;
  content: string;
  author: string;
  createdAt: string;
}

/**
 * FAQ 컬럼 정의
 * - FAQ 테이블에 필요한 컬럼 배열
 */
export const faqColumns: CommonSettingTableColumn<FAQItem>[] = [
  noColumn<FAQItem>(),
  { key: 'type', label: '제목', width: '30%' },
  { key: 'content', label: '내용' },
  authorColumn<FAQItem>(),
  createdAtColumn<FAQItem>(),
];
