import React from 'react';
import CommonTable, { Column } from '@/components/CommonTable';
import StatusBadge from '@/components/Common/StatusBadge';
import { getStatusBadge } from '@/utils/statusUtils';

/**
 * 결제 방법 테이블(PaymentMethodTable)
 *
 * - 사용자별 결제 방법 정보를 표 형태로 렌더링
 * - 카드사, 카드번호, 상태, 등록일자 등 표시
 * - 상태별 뱃지 표시 지원
 * - 재사용 가능한 공통 컴포넌트
 */

/**
 * 결제 방법 행 인터페이스
 * - 결제 방법에 필요한 행 데이터 구조
 */
export interface PaymentMethodRow {
  cardCompany: string; // 카드사
  cardNumber: string; // 카드번호
  status: string; // 상태
  registeredDate: string; // 등록일자
  [key: string]: unknown;
}

/**
 * 결제 방법 테이블 props
 * - 결제 방법 데이터 등
 */
interface PaymentMethodTableProps {
  data: PaymentMethodRow[];
}

/**
 * 테이블 컬럼 정의
 * - No., 카드사, 카드번호, 상태, 등록일자 등
 */
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

/**
 * 결제 방법 테이블 컴포넌트
 * - 결제 방법 정보를 테이블 형태로 표시
 */
const PaymentMethodTable: React.FC<PaymentMethodTableProps> = ({ data }) => {
  /**
   * 데이터에 번호 추가
   * - 각 행에 순차적인 번호를 추가하여 테이블에 표시
   */
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
