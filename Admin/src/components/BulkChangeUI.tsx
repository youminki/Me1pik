// src/components/BulkChangeUI.tsx
import React from 'react';
import styled from 'styled-components';

interface BulkChangeUIProps {
  newStatus: string;
  onStatusChange: (value: string) => void;
  onBulkChange: () => void;
  statusOptions: Array<{ label: string; value: string }>;
  selectedCount: number;
  isLoading?: boolean;
  disabled?: boolean;
}

const BulkChangeUI: React.FC<BulkChangeUIProps> = ({
  newStatus,
  onStatusChange,
  onBulkChange,
  statusOptions,
  selectedCount,
  isLoading = false,
  disabled = false,
}) => {
  return (
    <FilterGroup>
      <Select value={newStatus} onChange={(e) => onStatusChange(e.target.value)}>
        <option value="">변경할 상태</option>
        {statusOptions.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
      <BulkButton
        onClick={onBulkChange}
        disabled={!newStatus || selectedCount === 0 || isLoading || disabled}
      >
        {isLoading ? '변경중...' : '일괄변경'}
      </BulkButton>
    </FilterGroup>
  );
};

export default BulkChangeUI;

// Styled Components
const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Select = styled.select`
  height: 32px;
  padding: 0 8px;
  font-size: 12px;
  border: 1px solid #ccc;
`;

const BulkButton = styled.button`
  height: 32px;
  padding: 0 12px;
  background: #f6ae24;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;
