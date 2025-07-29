// src/components/Table/user/LicenseHistoryTable.tsx
import React from 'react';
import CommonTable, { Column } from '@/components/CommonTable';
import StatusBadge from '@/components/Common/StatusBadge';
import { getStatusBadge } from '@/utils/statusUtils';

export interface LicenseHistoryRow {
  type: string; // 종류
  paymentDate: string; // 결제일자
  nextPaymentDate?: string; // 다음 결제일자
  code: string; // 이용권 코드
  period?: string; // 이용권 사용기간
  amount: string; // 결제금액
  status: string; // 상태
  cancelRequestDate?: string; // 취소 신청일자
  [key: string]: unknown;
}

interface LicenseHistoryTableProps {
  data: LicenseHistoryRow[];
}

const columns: Column<LicenseHistoryRow & { no: number }>[] = [
  { key: 'no', label: 'No.', width: '60px' },
  { key: 'type', label: '종류', width: '80px' },
  { key: 'paymentDate', label: '결제일자', width: '100px' },
  {
    key: 'nextPaymentDate',
    label: '다음 결제일자',
    width: '120px',
    render: (v) => (v ? String(v) : '-'),
  },
  {
    key: 'code',
    label: '이용권 코드',
    width: '120px',
    render: (v) => <span style={{ textDecoration: 'underline' }}>{v ? String(v) : '-'}</span>,
  },
  {
    key: 'period',
    label: '이용권 사용기간',
    width: '120px',
    render: (v) => (v ? String(v) : '-'),
  },
  { key: 'amount', label: '결제금액', width: '100px' },
  {
    key: 'status',
    label: '상태',
    width: '80px',
    render: (v) => {
      const badge = getStatusBadge(v as string);
      return <StatusBadge style={{ background: badge.background }}>{badge.label}</StatusBadge>;
    },
  },
  {
    key: 'cancelRequestDate',
    label: '취소 신청일자',
    width: '120px',
    render: (v) => (v ? String(v) : '-'),
  },
];

const LicenseHistoryTable: React.FC<LicenseHistoryTableProps> = ({ data }) => {
  const dataWithNo = data.map((row, idx) => ({ ...row, no: idx + 1 }));
  return (
    <CommonTable<LicenseHistoryRow & { no: number }>
      columns={columns}
      data={dataWithNo}
      rowKey={(row) => row.no}
      emptyMessage="데이터가 없습니다."
      style={{ minWidth: 1000 }}
    />
  );
};

export default LicenseHistoryTable;
