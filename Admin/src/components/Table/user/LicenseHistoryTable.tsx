/**
 * 이용권 이력 테이블(LicenseHistoryTable)
 *
 * - 사용자별 이용권 이력 정보를 표 형태로 렌더링
 * - 종류, 결제일자, 다음 결제일자, 이용권 코드, 사용기간, 결제금액, 상태 등 표시
 * - 상태별 뱃지 표시, 조건부 렌더링 등 지원
 * - 재사용 가능한 공통 컴포넌트
 */
// src/components/Table/user/LicenseHistoryTable.tsx
import React from 'react';
import CommonTable, { Column } from '@/components/CommonTable';
import StatusBadge from '@/components/Common/StatusBadge';
import { getStatusBadge } from '@/utils/statusUtils';

/**
 * 이용권 이력 행 인터페이스
 * - 이용권 이력에 필요한 행 데이터 구조
 */
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

/**
 * 이용권 이력 테이블 props
 * - 이용권 이력 데이터 등
 */
interface LicenseHistoryTableProps {
  data: LicenseHistoryRow[];
}

/**
 * 테이블 컬럼 정의
 * - No., 종류, 결제일자, 다음 결제일자, 이용권 코드, 사용기간, 결제금액, 상태, 취소 신청일자 등
 */
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

/**
 * 이용권 이력 테이블 컴포넌트
 * - 이용권 이력 정보를 테이블 형태로 표시
 */
const LicenseHistoryTable: React.FC<LicenseHistoryTableProps> = ({ data }) => {
  /**
   * 데이터에 번호 추가
   * - 각 행에 순차적인 번호를 추가하여 테이블에 표시
   */
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
