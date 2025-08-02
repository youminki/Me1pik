import React from 'react';
import { Column } from '@components/CommonTable';
import GradeBadgeCell from '@components/Table/GradeBadgeCell';
import GenericTable from './GenericTable';

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

interface PageTableProps {
  data: User[];
  handleEdit: (no: number) => void;
  selectedRows?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (row: User, checked: boolean) => void;
  isLoading?: boolean; // 추가
}

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

const PageTable: React.FC<PageTableProps> = ({
  data,
  handleEdit,
  selectedRows = new Set(),
  onSelectAll,
  onSelectRow,
  isLoading,
}) => {
  // handleEdit을 row에 추가 (GenericTable의 processRow로 대체)
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
