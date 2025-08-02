import React from 'react';
import { Column, default as CommonTable } from '@components/CommonTable';
import StatusBadge from 'src/components/Common/StatusBadge';
import styled from 'styled-components';
import { getStatusBadge } from 'src/utils/statusUtils';

/** 이용권 아이템 인터페이스 */
export interface TicketItem {
  no: number; // 번호
  paymentDate: string; // 결제일
  nextPaymentDate: string; // 다음결제일
  user: string; // 이용자 (닉네임)
  type: string; // 종류
  usagePeriod: string; // 이용기간
  usageCount: string; // 이용횟수
  status: string; // 상태
}

interface TicketTableProps {
  filteredData: TicketItem[];
  handleEdit: (no: number) => void;
  selectedRows: Set<number>;
  setSelectedRows: React.Dispatch<React.SetStateAction<Set<number>>>;
  isLoading?: boolean; // 추가
}

const TdUser = styled.td`
  cursor: pointer;
  color: #007bff;
  text-align: center;
  &:hover {
    text-decoration: underline;
  }
`;

const columns: Column<TicketItem & { handleEdit: (no: number) => void }>[] = [
  { key: 'no', label: '번호', width: '50px' },
  { key: 'paymentDate', label: '결제일', width: '100px' },
  { key: 'nextPaymentDate', label: '다음결제일', width: '100px' },
  {
    key: 'user',
    label: '이용자 (닉네임)',
    width: '150px',
    render: (v, row) => <TdUser onClick={() => row.handleEdit(row.no)}>{v as string}</TdUser>,
  },
  { key: 'type', label: '종류', width: '120px' },
  { key: 'usagePeriod', label: '이용기간', width: '150px' },
  { key: 'usageCount', label: '이용횟수', width: '80px' },
  {
    key: 'status',
    label: '상태',
    width: '80px',
    render: (v) => {
      const badge = getStatusBadge(v as string);
      return <StatusBadge style={{ background: badge.background }}>{badge.label}</StatusBadge>;
    },
  },
];

const TicketTable: React.FC<TicketTableProps> = ({
  filteredData,
  handleEdit,
  selectedRows,
  setSelectedRows,
  isLoading,
}) => {
  /**
   * handleEdit을 각 row에 추가하여, 사용자 클릭 시 상세/수정 진입이 가능하도록 합니다.
   */
  const dataWithEdit = filteredData.map((item) => ({ ...item, handleEdit }));

  const onSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(filteredData.map((t) => t.no)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const onSelectRow = (row: TicketItem, checked: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (checked) newSet.add(row.no);
      else newSet.delete(row.no);
      return newSet;
    });
  };

  return (
    <CommonTable
      columns={columns}
      data={dataWithEdit}
      showCheckbox
      selectedRows={Array.from(selectedRows)}
      onSelectAll={onSelectAll}
      onSelectRow={onSelectRow}
      rowKey={(row) => row.no}
      emptyMessage="데이터가 없습니다."
      style={{ minWidth: 900 }}
      isLoading={isLoading} // 추가
    />
  );
};

export default TicketTable;
