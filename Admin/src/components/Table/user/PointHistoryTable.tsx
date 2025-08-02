/**
 * 포인트 이력 테이블(PointHistoryTable)
 *
 * - 사용자별 포인트 이력 정보를 표 형태로 렌더링
 * - 적립일자, 종류(적립/차감), 포인트 변동내역, 변동 포인트, 잔여 포인트 등 표시
 * - 포인트 적립/차감 내역을 시간순으로 정렬하여 표시
 * - 재사용 가능한 공통 컴포넌트
 */

// src/components/Table/user/PointHistoryTable.tsx
import React from 'react';
import CommonTable, { Column } from 'src/components/CommonTable';

/**
 * 포인트 이력 행 인터페이스
 * - 포인트 이력에 필요한 행 데이터 구조
 */
export interface PointHistoryRow {
  date: string; // 적립일자
  kind: '적립' | '차감'; // 종류 (적립/차감)
  history: string; // 포인트 변동내역
  changedPoints: string; // 변동 포인트
  remainingPoints: string; // 잔여 포인트
  [key: string]: unknown;
}

/**
 * 포인트 이력 테이블 props
 * - 포인트 이력 데이터 등
 */
interface PointHistoryTableProps {
  data: PointHistoryRow[];
}

/**
 * 테이블 컬럼 정의
 * - No., 적립일자, 종류, 포인트 변동내역, 변동 포인트, 잔여 포인트 등
 */
const columns: Column<PointHistoryRow & { no: number }>[] = [
  { key: 'no', label: 'No.', width: '60px' },
  { key: 'date', label: '적립일자', width: '120px' },
  { key: 'kind', label: '종류 (적립/차감)', width: '100px' },
  { key: 'history', label: '포인트 변동내역', width: '180px' },
  { key: 'changedPoints', label: '변동 포인트', width: '120px' },
  { key: 'remainingPoints', label: '잔여 포인트', width: '120px' },
];

/**
 * 포인트 이력 테이블 컴포넌트
 * - 포인트 이력 정보를 테이블 형태로 표시
 */
const PointHistoryTable: React.FC<PointHistoryTableProps> = ({ data }) => {
  /**
   * 데이터에 번호 추가
   * - 각 행에 순차적인 번호를 추가하여 테이블에 표시
   */
  const dataWithNo = data.map((row, idx) => ({ ...row, no: idx + 1 }));
  return (
    <CommonTable<PointHistoryRow & { no: number }>
      columns={columns}
      data={dataWithNo}
      rowKey={(row) => row.no}
      emptyMessage="데이터가 없습니다."
      style={{ minWidth: 800 }}
    />
  );
};

export default PointHistoryTable;
