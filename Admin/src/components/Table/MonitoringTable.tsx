// src/components/Table/MonitoringTable.tsx
import React from 'react';
import { Column, default as CommonTable } from '@components/CommonTable';
import StatusBadge from 'src/components/Common/StatusBadge';
import { getStatusBadge } from 'src/utils/statusUtils';
import styled from 'styled-components';
import { FaCopy } from 'react-icons/fa';

export interface MonitoringItem {
  no: number;
  신청일: string;
  주문자: string;
  대여기간: string;
  브랜드: string;
  종류: string;
  스타일: string;
  색상: string;
  사이즈: string;
  배송상태: string;
}

interface Props {
  filteredData: MonitoringItem[];
  handleEdit: (no: number) => void;
  selectedRows: Set<number>;
  toggleRow: (no: number) => void;
  toggleAll: () => void;
  statuses: string[];
  onSave: (id: number, status: string) => Promise<void>;
  isLoading?: boolean; // 추가
}

const StyleCodeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const StyleCodeText = styled.span`
  font-size: 12px;
  color: #333;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: color 0.2s;

  &:hover {
    color: #007bff;
  }
`;

const columns: Column<MonitoringItem & { handleEdit: (no: number) => void }>[] = [
  { key: 'no', label: '번호', width: '50px' },
  { key: '신청일', label: '신청일', width: '100px' },
  {
    key: '주문자',
    label: '주문자',
    width: '100px',
    render: (v, row) => (
      <span
        style={{ cursor: 'pointer', color: '#007bff', textAlign: 'center' }}
        onClick={() => row.handleEdit(row.no)}
      >
        {v as string}
      </span>
    ),
  },
  { key: '대여기간', label: '대여기간', width: '170px' },
  { key: '브랜드', label: '브랜드', width: '80px' },
  { key: '종류', label: '종류', width: '80px' },
  {
    key: '스타일',
    label: '스타일(품번)',
    width: '120px',
    render: (value, row) => {
      const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(row.스타일);
          console.log('스타일 품번이 복사되었습니다:', row.스타일);
        } catch (err) {
          console.error('복사 실패:', err);
        }
      };

      return (
        <StyleCodeContainer>
          <StyleCodeText>{value as string}</StyleCodeText>
          <CopyButton onClick={handleCopy} title="스타일 품번 복사">
            <FaCopy size={12} />
          </CopyButton>
        </StyleCodeContainer>
      );
    },
  },
  { key: '색상', label: '색상', width: '60px' },
  { key: '사이즈', label: '사이즈', width: '60px' },
  {
    key: '배송상태',
    label: '배송상태',
    width: '60px',
    render: (v) => {
      const badge = getStatusBadge(v as string);
      return <StatusBadge style={{ background: badge.background }}>{v as string}</StatusBadge>;
    },
  },
];

const MonitoringTable: React.FC<Props> = ({
  filteredData,
  handleEdit,
  selectedRows,
  toggleRow,
  toggleAll,
  isLoading,
}) => {
  // handleEdit을 row에 추가
  const dataWithEdit = filteredData.map((item) => ({ ...item, handleEdit }));

  const onSelectAll = () => {
    toggleAll();
  };

  const onSelectRow = (row: MonitoringItem) => {
    toggleRow(row.no);
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
      style={{ minWidth: 1000 }}
      isLoading={isLoading} // 추가
    />
  );
};

export default MonitoringTable;
