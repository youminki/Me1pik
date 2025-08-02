// src/components/Table/ProductEvaluationTable.tsx
import React from 'react';
import { Column, default as CommonTable } from '@components/CommonTable';
import { InstaContainer, Avatar, InstaText } from '@components/Common/Profile';
import StatusBadge from '@components/Common/StatusBadge';
import { getStatusBadge } from '@utils/statusUtils';

export interface User {
  no: number;
  grade: string;
  name: string;
  nickname: string;
  instagram: string;
  productStatus: string;
  serviceQuality: string;
  productReview: string;
  registeredAt: string;
}

interface ProductEvaluationTableProps {
  filteredData: User[];
  handleEdit: (no: number) => void;
  selectedRows?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (row: User, checked: boolean) => void;
  isLoading?: boolean; // 추가
}

const columns: Column<User & { handleEdit: (no: number) => void }>[] = [
  { key: 'no', label: 'No.', width: '60px' },
  { key: 'grade', label: '등급', width: '60px' },
  { key: 'name', label: '이름', width: '80px' },
  { key: 'nickname', label: '닉네임', width: '80px' },
  {
    key: 'instagram',
    label: '계정(인스타)',
    width: '150px',
    render: (v, row) => (
      <InstaContainer>
        <Avatar />
        <InstaText $clickable onClick={() => row.handleEdit(row.no)}>
          {v as string}
        </InstaText>
      </InstaContainer>
    ),
  },
  {
    key: 'productStatus',
    label: '제품상태',
    width: '80px',
    render: (v) => {
      const badge = getStatusBadge(v as string);
      return <StatusBadge style={{ background: badge.background }}>{badge.label}</StatusBadge>;
    },
  },
  { key: 'serviceQuality', label: '서비스 품질', width: '80px' },
  {
    key: 'productReview',
    label: '제품후기',
    width: '200px',
    render: (v) => <span style={{ textAlign: 'left', display: 'block' }}>{v as string}</span>,
  },
  { key: 'registeredAt', label: '등록일자', width: '100px' },
];

const ProductEvaluationTable: React.FC<ProductEvaluationTableProps> = ({
  filteredData,
  handleEdit,
  selectedRows = new Set(),
  onSelectAll,
  onSelectRow,
  isLoading,
}) => {
  // handleEdit을 row에 추가
  const dataWithEdit = filteredData.map((user) => ({ ...user, handleEdit }));

  return (
    <CommonTable
      columns={columns}
      data={dataWithEdit}
      showCheckbox
      selectedRows={Array.from(selectedRows)}
      onSelectAll={onSelectAll}
      onSelectRow={onSelectRow}
      rowKey={(row) => row.no}
      emptyMessage="데이터가 없습니다."
      style={{ minWidth: 900 }}
      isLoading={isLoading} // 추가
    />
  );
};

export default ProductEvaluationTable;
