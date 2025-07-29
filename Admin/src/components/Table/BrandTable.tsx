import React from 'react';
import CommonTable, { Column } from '@components/CommonTable';
import StatusBadge from 'src/components/Common/StatusBadge';
import { getStatusBadge } from 'src/utils/statusUtils';

export interface BrandItem extends Record<string, unknown> {
  no: number;
  group: string;
  brand: string;
  quantity: number;
  discount: number;
  manager: string;
  contact: string;
  registerDate: string;
  status: string;
}

interface BrandTableProps {
  filteredData: BrandItem[];
  handleEdit: (no: number) => void;
  selectedRows?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (row: BrandItem, checked: boolean) => void;
  isLoading?: boolean; // 추가
}

const columns: Column<BrandItem & { handleEdit: (no: number) => void }>[] = [
  { key: 'no', label: 'No.', width: '60px' },
  {
    key: 'group',
    label: '그룹사',
    width: '150px',
    render: (v, row) => (
      <span
        style={{ color: '#007bff', cursor: 'pointer' }}
        title={String(v)}
        onClick={() => row.handleEdit(row.no)}
      >
        {String(v)}
      </span>
    ),
  },
  {
    key: 'brand',
    label: '브랜드',
    width: '100px',
    render: (v) => <span title={String(v)}>{String(v)}</span>,
  },
  {
    key: 'quantity',
    label: '제품수',
    width: '80px',
    render: (v) => <span title={String(v)}>{String(v)}</span>,
  },
  {
    key: 'discount',
    label: '할인율',
    width: '80px',
    render: (v) => <span title={`${v}%`}>{String(v)}%</span>,
  },
  {
    key: 'manager',
    label: '담당자',
    width: '120px',
    render: (v) => <span title={String(v)}>{String(v)}</span>,
  },
  {
    key: 'contact',
    label: '연락처',
    width: '120px',
    render: (v) => <span title={String(v)}>{String(v)}</span>,
  },
  {
    key: 'registerDate',
    label: '등록일',
    width: '100px',
    render: (v) => <span title={String(v)}>{String(v)}</span>,
  },
  {
    key: 'status',
    label: '상태',
    width: '80px',
    render: (v) => {
      const badge = getStatusBadge(String(v));
      return <StatusBadge style={{ background: badge.background }}>{badge.label}</StatusBadge>;
    },
  },
];

const BrandTable: React.FC<BrandTableProps> = ({
  filteredData,
  handleEdit,
  selectedRows = new Set(),
  onSelectAll,
  onSelectRow,
  isLoading,
}) => {
  // handleEdit을 row에 추가
  const dataWithEdit = filteredData.map((item) => ({ ...item, handleEdit }));

  return (
    <CommonTable<BrandItem & { handleEdit: (no: number) => void }>
      columns={columns}
      data={dataWithEdit}
      showCheckbox
      selectedRows={Array.from(selectedRows)}
      onSelectAll={onSelectAll}
      onSelectRow={onSelectRow}
      rowKey={(row) => row.no}
      emptyMessage="데이터가 없습니다."
      style={{ minWidth: 1000 }}
      isLoading={isLoading} // 추가
    />
  );
};

export default BrandTable;
