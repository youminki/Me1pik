import React from 'react';
import { Column } from '@components/CommonTable';
import GradeBadgeCell from '@components/Table/GradeBadgeCell';
import GenericTable from './GenericTable';

/**
 * 사용자 인터페이스
 * - 페이지 목록에 필요한 사용자 정보 구조
 */
export interface User {
  no: number;
  grade: string;
  name: string;
  nickname: string;
  instagram: string;
  season: string;
  contentsCount: string;
  submitCount: string;
  average: number;
  totalSum: number;
  handleEdit?: (no: number) => void;
  [key: string]: unknown;
}

/**
 * 페이지 테이블 props
 * - 사용자 데이터, 편집 핸들러, 선택 상태, 로딩 상태 등
 */
interface PageTableProps {
  data: User[];
  handleEdit: (no: number) => void;
  selectedRows?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (row: User, checked: boolean) => void;
  isLoading?: boolean; // 추가
}

/**
 * 테이블 컬럼 정의
 * - No., 등급, 이름, 닉네임, 인스타그램, 시즌, 콘텐츠 수, 등록 제출 수, 평균, 총합 등
 */
const columns: Column<User & { handleEdit?: (no: number) => void }>[] = [
  { key: 'no', label: 'No.', width: '60px' },
  {
    key: 'grade',
    label: '등급',
    width: '80px',
    render: (v) => <GradeBadgeCell grade={v as string} />,
  },
  { key: 'name', label: '이름', width: '80px' },
  { key: 'nickname', label: '닉네임', width: '80px' },
  {
    key: 'instagram',
    label: '계정(인스타)',
    width: '150px',
    render: (v, row) => (
      <span
        style={{ color: '#007bff', cursor: 'pointer' }}
        onClick={() => row.handleEdit?.(row.no)}
        role="button"
        tabIndex={0}
        aria-label="계정 상세 보기"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') row.handleEdit?.(row.no);
        }}
      >
        {v as string}
      </span>
    ),
  },
  { key: 'season', label: '시즌 진행상태', width: '100px' },
  { key: 'contentsCount', label: '콘텐츠 수', width: '80px' },
  { key: 'submitCount', label: '등록 제출 수', width: '80px' },
  { key: 'average', label: '1회 평균', width: '80px' },
  { key: 'totalSum', label: '총 합', width: '80px' },
];

/**
 * 페이지 테이블 컴포넌트
 * - 사용자 정보를 테이블 형태로 표시
 */
const PageTable: React.FC<PageTableProps> = ({
  data,
  handleEdit,
  selectedRows = new Set(),
  onSelectAll,
  onSelectRow,
  isLoading,
}) => {
  /**
   * handleEdit을 row에 추가 (GenericTable의 processRow로 대체)
   * - 사용자 클릭 시 상세/수정 진입이 가능하도록 합니다.
   */
  const processRow = React.useCallback((user: User) => ({ ...user, handleEdit }), [handleEdit]);

  return (
    <GenericTable<User>
      data={data}
      columns={columns}
      rowKey={(row) => row.no}
      processRow={processRow}
      showCheckbox
      selectedRows={Array.from(selectedRows)}
      {...(onSelectAll ? { onSelectAll } : {})}
      {...(onSelectRow ? { onSelectRow } : {})}
      emptyMessage="데이터가 없습니다."
      style={{ minWidth: 900 }}
      isLoading={isLoading}
    />
  );
};

export default PageTable;
