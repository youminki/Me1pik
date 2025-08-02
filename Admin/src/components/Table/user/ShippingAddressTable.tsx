// src/components/ShippingAddressTable.tsx
import React from 'react';
import CommonTable, { Column } from '@/components/CommonTable';

export interface ShippingRow {
  type: string; // 수령지 (자택, 기타 등)
  name: string; // 수령인
  address: string; // 배송지
  phone1: string; // 연락처1
  phone2: string; // 연락처2
  isDefault: boolean; // 기본설정 여부
  [key: string]: unknown;
}

interface ShippingAddressTableProps {
  data: ShippingRow[];
  selectedRows?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (row: ShippingRow & { no: number }, checked: boolean) => void;
}

const columns: Column<ShippingRow & { no: number }>[] = [
  { key: 'no', label: 'No.', width: '50px' },
  { key: 'type', label: '수령지', width: '80px' },
  { key: 'name', label: '이름', width: '80px' },
  { key: 'address', label: '배송지', width: '300px' },
  { key: 'phone1', label: '연락처1', width: '100px' },
  { key: 'phone2', label: '연락처2', width: '100px' },
  {
    key: 'isDefault',
    label: '기본설정',
    width: '80px',
    render: (v) => (v ? 'Y' : 'N'),
  },
];

const ShippingAddressTable: React.FC<ShippingAddressTableProps> = ({
  data,
  selectedRows = new Set(),
  onSelectAll,
  onSelectRow,
}) => {
  // 각 row에 no(번호) 필드 추가
  const dataWithNo = data.map((row, idx) => ({ ...row, no: idx + 1 }));
  return (
    <CommonTable<ShippingRow & { no: number }>
      columns={columns}
      data={dataWithNo}
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

export default ShippingAddressTable;
