/**
 * 배송지 테이블(ShippingAddressTable)
 *
 * - 사용자별 배송지 정보를 표 형태로 렌더링
 * - 수령지, 이름, 배송지, 연락처1, 연락처2, 기본설정 여부 등 표시
 * - 체크박스 선택 기능, 기본설정 표시 등 지원
 * - 재사용 가능한 공통 컴포넌트
 */
// src/components/ShippingAddressTable.tsx
import React from 'react';
import CommonTable, { Column } from '@/components/CommonTable';

/**
 * 배송지 행 인터페이스
 * - 배송지에 필요한 행 데이터 구조
 */
export interface ShippingRow {
  type: string; // 수령지 (자택, 기타 등)
  name: string; // 수령인
  address: string; // 배송지
  phone1: string; // 연락처1
  phone2: string; // 연락처2
  isDefault: boolean; // 기본설정 여부
  [key: string]: unknown;
}

/**
 * 배송지 테이블 props
 * - 데이터, 선택 상태, 선택 이벤트 등
 */
interface ShippingAddressTableProps {
  data: ShippingRow[];
  selectedRows?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (row: ShippingRow & { no: number }, checked: boolean) => void;
}

/**
 * 테이블 컬럼 정의
 * - No., 수령지, 이름, 배송지, 연락처1, 연락처2, 기본설정 등
 */
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

/**
 * 배송지 테이블 컴포넌트
 * - 배송지 정보를 테이블 형태로 표시
 */
const ShippingAddressTable: React.FC<ShippingAddressTableProps> = ({
  data,
  selectedRows = new Set(),
  onSelectAll,
  onSelectRow,
}) => {
  /**
   * 각 row에 no(번호) 필드 추가
   * - 각 행에 순차적인 번호를 추가하여 테이블에 표시
   */
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
