// src/components/Table/user/PointHistoryTable.tsx
import React from 'react';
import CommonTable, { Column } from 'src/components/CommonTable';

export interface PointHistoryRow {
  date: string; // 적립일자
  kind: '적립' | '차감'; // 종류 (적립/차감)
  history: string; // 포인트 변동내역
  changedPoints: string; // 변동 포인트
  remainingPoints: string; // 잔여 포인트
  [key: string]: unknown;
}

interface PointHistoryTableProps {
  data: PointHistoryRow[];
}

const columns: Column<PointHistoryRow & { no: number }>[] = [
  { key: 'no', label: 'No.', width: '60px' },
  { key: 'date', label: '적립일자', width: '120px' },
  { key: 'kind', label: '종류 (적립/차감)', width: '100px' },
  { key: 'history', label: '포인트 변동내역', width: '180px' },
  { key: 'changedPoints', label: '변동 포인트', width: '120px' },
  { key: 'remainingPoints', label: '잔여 포인트', width: '120px' },
];

const PointHistoryTable: React.FC<PointHistoryTableProps> = ({ data }) => {
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
