// src/components/Table/CalculateListTable.tsx
import React from 'react';
import { Column, default as CommonTable } from '@components/CommonTable';
import { InstaContainer, Avatar, InstaText } from '@components/Common/Profile';

export interface User {
  no: number;
  grade: string;
  name: string;
  nickname: string;
  instagram: string;
  season: string;
  sellCount: string;
  totalSum: number;
  profit: number;
  expectedProfit: number;
}

interface CalculateListTableProps {
  filteredData: User[];
  handleEdit: (no: number) => void;
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
  { key: 'season', label: '시즌 진행상태', width: '120px' },
  { key: 'sellCount', label: '판매 제품수', width: '90px' },
  {
    key: 'totalSum',
    label: '총 판매금액',
    width: '100px',
    render: (v) => Number(v).toLocaleString(),
  },
  {
    key: 'profit',
    label: '판매 수익금',
    width: '90px',
    render: (v) => Number(v).toLocaleString(),
  },
  {
    key: 'expectedProfit',
    label: '정산 예정금',
    width: '90px',
    render: (v) => Number(v).toLocaleString(),
  },
];

const CalculateListTable: React.FC<CalculateListTableProps> = ({
  filteredData,
  handleEdit,
  isLoading,
}) => {
  // handleEdit을 row에 추가
  const dataWithEdit = filteredData.map((user) => ({ ...user, handleEdit }));

  return (
    <CommonTable
      columns={columns}
      data={dataWithEdit}
      rowKey={(row) => row.no}
      emptyMessage="데이터가 없습니다."
      style={{ minWidth: 900 }}
      isLoading={isLoading} // 추가
    />
  );
};

export default CalculateListTable;
