// src/components/Table/admin/TaskHistoryTable.tsx
import React from 'react';
import styled from 'styled-components';

/**
 * 스크린샷에 맞춰 컬럼 구성
 *  - 작업일자 (workDate)
 *  - 작업내용 (workContent)
 *  - 변경일시 (changedAt)
 */
export interface TaskHistoryRow {
  workDate: string; // 예: "서비스 > 제품목록 관리"
  workContent: string; // 예: "변경전 작업내용... 관리자 내 상세..."
  changedAt: string; // 예: "2025-03-02 00:00:00"
}

interface TaskHistoryTableProps {
  data: TaskHistoryRow[];
}

const TaskHistoryTable: React.FC<TaskHistoryTableProps> = ({ data }) => {
  // 10행 고정을 위해 부족한 행의 개수를 계산
  const emptyRowsCount = Math.max(0, 10 - data.length);

  return (
    <TableContainer>
      <StyledTable>
        <colgroup>
          <col style={{ width: '20%' }} />
          <col style={{ width: '60%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <thead>
          <tr>
            <Th>작업일자</Th>
            <Th>작업내용</Th>
            <Th>변경일시</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <Td title={row.workDate}>{row.workDate}</Td>
              <Td title={row.workContent}>{row.workContent}</Td>
              <Td title={row.changedAt}>{row.changedAt}</Td>
            </tr>
          ))}
          {/* 데이터가 10행 미만이면 빈 행 추가 */}
          {Array.from({ length: emptyRowsCount }).map((_, idx) => (
            <tr key={`empty-${idx}`}>
              <Td />
              <Td />
              <Td />
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </TableContainer>
  );
};

export default TaskHistoryTable;

/* ====================== Styled Components ====================== */

const TableContainer = styled.div`
  min-width: 834px;
  min-height: 600px;
  max-width: 100vw;
  overflow-x: auto;
  @media (max-width: 834px) {
    min-width: 100vw;
    padding: 0 8px;
  }
  @media (max-height: 1194px) {
    min-height: 400px;
  }
  border: 1px solid #dddddd;
  border-radius: 4px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #333;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow-x: auto;

  th,
  td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    font-weight: 700;
    font-size: 14px;
    padding: 8px;
    border-bottom: 1px solid #eee;
  }

  tbody tr:hover {
    background-color: #e3f2fd;
    cursor: pointer;
  }

  @media (max-width: 834px) {
    display: block;
    overflow-x: auto;
  }
`;

const Th = styled.th`
  font-weight: 700;
  font-size: 14px;
  padding: 8px;
  border-bottom: 1px solid #eee;
`;

const Td = styled.td<{ $align?: string }>`
  font-size: 14px;
  padding: 8px;
  border-bottom: 1px solid #eee;
  text-align: ${({ $align }) => $align || 'left'};
`;
