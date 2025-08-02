/**
 * 공통 설정 테이블(CommonSettingTable)
 *
 * - 설정 정보를 표 형태로 렌더링하는 범용 테이블 컴포넌트
 * - 로딩 상태 스켈레톤, 최소 행 수, 행 클릭 이벤트 등 지원
 * - 제네릭 타입으로 다양한 데이터 구조 지원
 * - 재사용 가능한 공통 컴포넌트
 */
import React from 'react';
import styled from 'styled-components';

/**
 * 공통 설정 테이블 컬럼 인터페이스
 * - 컬럼 키, 라벨, 너비, 렌더링 함수 등 포함
 */
export interface CommonSettingTableColumn<T> {
  key: keyof T;
  label: string;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

/**
 * 공통 설정 테이블 props
 * - 컬럼 정의, 데이터, 행 클릭 이벤트, 최소 행 수, 로딩 상태 등
 */
interface CommonSettingTableProps<T> {
  columns: CommonSettingTableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  minRows?: number;
  isLoading?: boolean;
}

/**
 * 스켈레톤 셀 컴포넌트
 * - 로딩 중에 표시되는 애니메이션 셀
 */
const SkeletonCell = () => (
  <div
    style={{
      width: '100%',
      height: 20,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200px 100%',
      animation: 'skeleton 1.5s infinite',
      borderRadius: 4,
    }}
  />
);

/**
 * 공통 설정 테이블 컴포넌트
 * - 설정 정보를 테이블 형태로 표시하는 범용 컴포넌트
 */
function CommonSettingTable<T extends object>({
  columns,
  data,
  onRowClick,
  minRows = 10,
  isLoading = false,
}: CommonSettingTableProps<T>) {
  /**
   * 빈 행 수 계산
   * - 최소 행 수를 유지하기 위한 빈 행 개수 계산
   */
  const emptyRowsCount = Math.max(0, minRows - data.length);

  return (
    <Table>
      <colgroup>
        {columns.map((col) => (
          <col key={col.key as string} style={{ width: col.width || 'auto' }} />
        ))}
      </colgroup>
      <thead>
        <TableRow>
          {columns.map((col) => (
            <Th key={col.key as string}>{col.label}</Th>
          ))}
        </TableRow>
      </thead>
      <tbody>
        {isLoading ? (
          Array.from({ length: minRows }).map((_, rowIdx) => (
            <TableRow key={`skeleton-${rowIdx}`}>
              {columns.map((col) => (
                <Td key={col.key as string}>
                  <SkeletonCell />
                </Td>
              ))}
            </TableRow>
          ))
        ) : (
          <>
            {data.map((row, rowIdx) => (
              <TableRow
                key={rowIdx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: 'pointer' } : {}}
              >
                {columns.map((col) => (
                  <Td key={col.key as string}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : ((row[col.key] as React.ReactNode) ?? '')}
                  </Td>
                ))}
              </TableRow>
            ))}
            {Array.from({ length: emptyRowsCount }).map((_, i) => (
              <TableRow key={`empty-${i}`}>
                {columns.map((col) => (
                  <Td key={col.key as string}>&nbsp;</Td>
                ))}
              </TableRow>
            ))}
          </>
        )}
      </tbody>
    </Table>
  );
}

export default CommonSettingTable;

/**
 * 테이블 스타일드 컴포넌트
 * - 테이블 기본 스타일링
 */
const Table = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  background-color: #ffffff;
  border: 1px solid #dddddd;
`;

const TableRow = styled.tr`
  height: 44px;
  &:nth-child(even) {
    background: #f8f9fa;
  }
  &:hover {
    background-color: #e3f2fd;
    cursor: pointer;
  }
`;

const Th = styled.th`
  text-align: center;
  vertical-align: middle;
  background-color: #eeeeee;
  font-weight: 800;
  font-size: 12px;
  color: #000000;
  border: 1px solid #dddddd;
  white-space: nowrap;
`;

const Td = styled.td`
  vertical-align: middle;
  font-weight: 400;
  font-size: 12px;
  color: #000000;
  border: 1px solid #dddddd;
  white-space: nowrap;
  text-align: center;
  padding-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;

  /* 클릭 가능한 셀(content 컬럼) 호버 효과 제거 */
`;

// 스켈레톤 애니메이션 추가
const skeletonKeyframes = `
@keyframes skeleton {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
`;
if (typeof window !== 'undefined' && !document.getElementById('skeleton-keyframes')) {
  const style = document.createElement('style');
  style.id = 'skeleton-keyframes';
  style.innerHTML = skeletonKeyframes;
  document.head.appendChild(style);
}
