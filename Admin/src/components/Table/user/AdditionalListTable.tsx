// src/components/Table/user/AdditionalListTable.tsx
import React from 'react';
import CommonTable, { Column } from '@/components/CommonTable';

export interface AdditionalListRow {
  no: number; // No.
  registeredDate: string; // 등록일자
  style: string; // 스타일 (품번)
  brand: string; // 브랜드
  category: string; // 분류
  color: string; // 색상
  purchaseSize: string; // 구매 사이즈
  retailPrice: string; // 리테일가
  [key: string]: unknown;
}

interface AdditionalListTableProps {
  data: AdditionalListRow[];
  selectedRows?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (row: AdditionalListRow, checked: boolean) => void;
}

const columns: Column<AdditionalListRow>[] = [
  { key: 'no', label: 'No.', width: '60px' },
  { key: 'registeredDate', label: '등록일자', width: '120px' },
  { key: 'style', label: '스타일 (품번)', width: '120px' },
  { key: 'brand', label: '브랜드', width: '100px' },
  { key: 'category', label: '분류', width: '80px' },
  { key: 'color', label: '색상', width: '80px' },
  { key: 'purchaseSize', label: '구매 사이즈', width: '100px' },
  { key: 'retailPrice', label: '리테일가', width: '100px' },
];

const AdditionalListTable: React.FC<AdditionalListTableProps> = ({
  data,
  selectedRows = new Set(),
  onSelectAll,
  onSelectRow,
}) => {
  return (
    <CommonTable<AdditionalListRow>
      columns={columns}
      data={data}
      showCheckbox
      selectedRows={Array.from(selectedRows)}
      onSelectAll={onSelectAll}
      onSelectRow={onSelectRow}
      rowKey={(row) => row.no}
      emptyMessage="데이터가 없습니다."
      style={{ minWidth: 1000 }}
    />
  );
};

export default AdditionalListTable;
