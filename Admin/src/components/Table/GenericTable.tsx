import React from 'react';
import CommonTable, { Column } from '../CommonTable';

interface GenericTableProps<
  T extends Record<string, unknown>,
  R extends Record<string, unknown> = T,
> {
  data: T[];
  columns: Column<R>[];
  rowKey: (row: R) => string | number;
  processRow?: (item: T, idx: number) => R;
  showCheckbox?: boolean;
  selectedRows?: (R | string | number)[];
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (row: R, checked: boolean) => void;
  emptyMessage?: string;
  style?: React.CSSProperties;
  isLoading?: boolean;
}

function GenericTable<T extends Record<string, unknown>, R extends Record<string, unknown> = T>({
  data,
  columns,
  rowKey,
  processRow,
  showCheckbox = false,
  selectedRows = [],
  onSelectAll,
  onSelectRow,
  emptyMessage = '데이터가 없습니다.',
  style,
  isLoading = false,
}: GenericTableProps<T, R>) {
  /**
   * row 데이터 가공 (예: handleEdit, no 등 추가)
   * processRow가 주어지면 각 row를 변환하여 테이블에 전달합니다.
   */
  const processedData = React.useMemo(
    () => (processRow ? data.map((item, idx) => processRow(item, idx)) : (data as unknown as R[])),
    [data, processRow],
  );

  return (
    <CommonTable<R>
      columns={columns}
      data={processedData}
      showCheckbox={showCheckbox}
      selectedRows={selectedRows}
      onSelectAll={onSelectAll}
      onSelectRow={onSelectRow}
      rowKey={rowKey}
      emptyMessage={emptyMessage}
      style={style}
      isLoading={isLoading}
    />
  );
}

export default GenericTable;
