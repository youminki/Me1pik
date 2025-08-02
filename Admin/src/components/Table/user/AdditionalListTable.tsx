/**
 * 추가 목록 테이블(AdditionalListTable)
 *
 * - 사용자별 추가 목록 정보를 표 형태로 렌더링
 * - 등록일자, 스타일, 브랜드, 분류, 색상, 구매 사이즈, 리테일가 등 표시
 * - 체크박스 선택 기능 지원
 * - 재사용 가능한 공통 컴포넌트
 */

// src/components/Table/user/AdditionalListTable.tsx
import React from 'react';
import CommonTable, { Column } from '@/components/CommonTable';

/**
 * 추가 목록 행 인터페이스
 * - 추가 목록에 필요한 행 데이터 구조
 */
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

/**
 * 추가 목록 테이블 props
 * - 데이터, 선택 상태, 선택 이벤트 등
 */
interface AdditionalListTableProps {
  data: AdditionalListRow[];
  selectedRows?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (row: AdditionalListRow, checked: boolean) => void;
}

/**
 * 테이블 컬럼 정의
 * - No., 등록일자, 스타일, 브랜드, 분류, 색상, 구매 사이즈, 리테일가 등
 */
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

/**
 * 추가 목록 테이블 컴포넌트
 * - 추가 목록 정보를 테이블 형태로 표시
 */
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
