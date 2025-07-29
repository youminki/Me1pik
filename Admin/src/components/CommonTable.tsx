import React from 'react';
import styled from 'styled-components';

export type Column<T> = {
  key: keyof T | string;
  label: string;
  width?: string;
  render?: (value: unknown, row: T, rowIndex: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
};

export type CommonTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  showCheckbox?: boolean;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (row: T, checked: boolean) => void;
  selectedRows?: (T | string | number)[];
  rowKey?: (row: T) => string | number;
  emptyMessage?: string;
  style?: React.CSSProperties;
  isLoading?: boolean; // 추가
};

function CommonTable<T extends Record<string, unknown>>({
  columns,
  data,
  showCheckbox = false,
  onSelectAll,
  onSelectRow,
  selectedRows = [],
  rowKey = (row: T): string | number =>
    (row.id as string | number) ??
    (row.key as string | number) ??
    (row.no as string | number) ??
    JSON.stringify(row),
  emptyMessage = '데이터가 없습니다.',
  style,
  isLoading = false, // 추가
}: CommonTableProps<T>) {
  const allSelected = data.length > 0 && data.every((row) => selectedRows.includes(rowKey(row)));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAll) onSelectAll(e.target.checked);
  };
  const handleSelectRow = (row: T) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectRow) onSelectRow(row, e.target.checked);
  };

  return (
    <Table style={style}>
      <colgroup>
        {showCheckbox && <col style={{ width: '40px' }} />}
        {columns.map((col) => (
          <col key={col.key as string} style={{ width: col.width || 'auto' }} />
        ))}
      </colgroup>
      <thead>
        <TableRow>
          {showCheckbox && (
            <Th align="center">
              <CheckboxCenter>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  disabled={isLoading}
                />
              </CheckboxCenter>
            </Th>
          )}
          {columns.map((col) => (
            <Th key={col.key as string} align={col.align || 'center'}>
              {col.label}
            </Th>
          ))}
        </TableRow>
      </thead>
      <tbody>
        {isLoading
          ? // 스켈레톤 UI: 10줄 표시
            Array.from({ length: 10 }).map((_, rowIdx) => (
              <TableRow key={`skeleton-row-${rowIdx}`}>
                {showCheckbox && (
                  <Td align="center">
                    <SkeletonBox />
                  </Td>
                )}
                {columns.map((col, colIdx) => (
                  <Td key={`skeleton-col-${colIdx}`} align={col.align || 'center'}>
                    <SkeletonBox />
                  </Td>
                ))}
              </TableRow>
            ))
          : data.length === 0
            ? // 데이터가 없을 때 10개의 빈 행
              Array.from({ length: 10 }).map((_, rowIdx) => (
                <TableRow key={`empty-row-${rowIdx}`}>
                  <Td colSpan={columns.length + (showCheckbox ? 1 : 0)} align="center">
                    {rowIdx === 0 ? emptyMessage : ''}
                  </Td>
                </TableRow>
              ))
            : // 데이터가 10개 미만이면 빈 행 추가
              [
                ...data.map((row, rowIndex) => (
                  <TableRow key={rowKey(row)}>
                    {showCheckbox && (
                      <Td align="center">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(rowKey(row))}
                          onChange={handleSelectRow(row)}
                        />
                      </Td>
                    )}
                    {columns.map((col) => {
                      let cellValue: unknown = row[col.key as keyof T];
                      if (cellValue == null) {
                        cellValue = '';
                      } else if (
                        typeof cellValue !== 'string' &&
                        typeof cellValue !== 'number' &&
                        typeof cellValue !== 'boolean' &&
                        !React.isValidElement(cellValue)
                      ) {
                        cellValue = String(cellValue);
                      }
                      return (
                        <Td key={col.key as string} align={col.align || 'center'}>
                          {col.render
                            ? col.render(row[col.key as keyof T], row, rowIndex)
                            : (cellValue as React.ReactNode)}
                        </Td>
                      );
                    })}
                  </TableRow>
                )),
                ...Array.from({ length: Math.max(0, 10 - data.length) }).map((_, idx) => (
                  <TableRow key={`filler-row-${idx}`}>
                    {showCheckbox && <Td align="center">&nbsp;</Td>}
                    {columns.map((_, colIdx) => (
                      <Td key={`filler-col-${colIdx}`} align="center">
                        &nbsp;
                      </Td>
                    ))}
                  </TableRow>
                )),
              ]}
      </tbody>
    </Table>
  );
}

export default CommonTable;

// styled-components
const Table = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  background-color: ${({ theme }) => theme.colors.bg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.black};
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
const Th = styled.th<{ align?: string }>`
  text-align: ${({ align }) => align || 'center'};
  vertical-align: middle;
  background-color: ${({ theme }) => theme.colors.tableHeader};
  font-weight: 800;
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.black};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0 20px;
  white-space: nowrap;
`;
const Td = styled.td<{ align?: string }>`
  text-align: ${({ align }) => align || 'center'};
  vertical-align: middle;
  font-weight: 400;
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.black};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// 스켈레톤 박스 스타일 추가
const SkeletonBox = styled.div`
  width: 100%;
  height: 18px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  border-radius: 4px;
  animation: skeleton-loading 1.2s infinite linear;
  @keyframes skeleton-loading {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
`;

const CheckboxCenter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 44px;
`;
