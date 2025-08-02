/**
 * 작업 이력 테이블(TaskHistoryTable)
 *
 * - 관리자 작업 이력을 표 형태로 렌더링
 * - 작업일자, 작업내용, 변경일시 등 표시
 * - 10행 고정 레이아웃, 반응형 디자인 등 지원
 * - 재사용 가능한 공통 컴포넌트
 */

// src/components/Table/admin/TaskHistoryTable.tsx
import React from 'react';
import styled from 'styled-components';

/**
 * 작업 이력 행 인터페이스
 * - 작업 이력에 필요한 행 데이터 구조
 */
export interface TaskHistoryRow {
  workDate: string; // 예: "서비스 > 제품목록 관리"
  workContent: string; // 예: "변경전 작업내용... 관리자 내 상세..."
  changedAt: string; // 예: "2025-03-02 00:00:00"
}

/**
 * 작업 이력 테이블 props
 * - 작업 이력 데이터 등
 */
interface TaskHistoryTableProps {
  data: TaskHistoryRow[];
}

/**
 * 작업 이력 테이블 컴포넌트
 * - 작업 이력을 테이블 형태로 표시
 */
const TaskHistoryTable: React.FC<TaskHistoryTableProps> = ({ data }) => {
  /**
   * 10행 고정을 위해 부족한 행의 개수를 계산
   * - 테이블 레이아웃을 일정하게 유지하기 위한 빈 행 개수 계산
   */
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
          {/**
           * 데이터가 10행 미만이면 빈 행 추가
           * - 테이블 레이아웃을 일정하게 유지하기 위한 빈 행 추가
           */}
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

/**
 * 테이블 컨테이너 스타일드 컴포넌트
 * - 테이블 컨테이너 스타일링
 */
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
