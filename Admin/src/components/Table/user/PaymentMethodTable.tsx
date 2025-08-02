import React from 'react';
import CommonTable, { Column } from '@/components/CommonTable';
import StatusBadge from '@/components/Common/StatusBadge';
import { getStatusBadge } from '@/utils/statusUtils';

export interface PaymentMethodRow {
  cardCompany: string; // 카드사
  cardNumber: string; // 카드번호
  status: string; // 상태
  registeredDate: string; // 등록일자
  [key: string]: unknown;
}

interface PaymentMethodTableProps {
  data: PaymentMethodRow[];
}

const columns: Column<PaymentMethodRow & { no: number }>[] = [
  { key: 'no', label: 'No.', width: '60px' },
  { key: 'cardCompany', label: '카드사', width: '120px' },
  { key: 'cardNumber', label: '카드번호', width: '180px' },
  {
    key: 'status',
    label: '상태',
    width: '80px',
    render: (v) => {
      const badge = getStatusBadge(v as string);
      return <StatusBadge style={{ background: badge.background }}>{badge.label}</StatusBadge>;
    },
  },
  { key: 'registeredDate', label: '등록일자', width: '120px' },
];

const PaymentMethodTable: React.FC<PaymentMethodTableProps> = ({ data }) => {
  const dataWithNo = data.map((row, idx) => ({ ...row, no: idx + 1 }));
  return (
    <CommonTable<PaymentMethodRow & { no: number }>
      columns={columns}
      data={dataWithNo}
      rowKey={(row) => row.no}
      emptyMessage="데이터가 없습니다."
      style={{ minWidth: 800 }}
    />
  );
};

export default PaymentMethodTable;
