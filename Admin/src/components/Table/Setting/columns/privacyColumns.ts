import { CommonSettingTableColumn } from '@components/Table/Setting/CommonSettingTable';
import { noColumn, authorColumn, createdAtColumn } from 'src/utils/commonColumns';
import { PrivacyItem } from 'src/types/setting';

/**
 * 개인정보처리방침 컬럼 정의(privacyColumns)
 *
 * - 개인정보처리방침 테이블에 필요한 컬럼 정의
 * - 번호, 구분, 제목, 내용, 작성자, 작성일 등 포함
 * - 공통 컬럼 유틸리티 함수 활용
 * - 재사용 가능한 공통 컴포넌트
 */

/**
 * 개인정보처리방침 컬럼 정의
 * - 개인정보처리방침 테이블에 필요한 컬럼 배열
 */
export const privacyColumns: CommonSettingTableColumn<PrivacyItem>[] = [
  noColumn<PrivacyItem>(),
  { key: 'category', label: '구분', width: '80px' },
  { key: 'title', label: '제목', width: '30%' },
  { key: 'content', label: '내용' },
  authorColumn<PrivacyItem>(),
  createdAtColumn<PrivacyItem>(),
];
