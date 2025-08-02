/**
 * 일괄 변경 UI(BulkChangeUI)
 *
 * - 선택된 항목들의 상태를 일괄적으로 변경하는 UI 컴포넌트
 * - 상태 선택 드롭다운, 일괄 변경 버튼, 로딩 상태 등 지원
 * - 조건부 비활성화, 선택 개수 표시 등 기능 제공
 * - 재사용 가능한 공통 컴포넌트
 */

// src/components/BulkChangeUI.tsx
import React from 'react';
import styled from 'styled-components';

/**
 * 일괄 변경 UI props
 * - 새 상태, 상태 변경 이벤트, 일괄 변경 이벤트, 상태 옵션, 선택 개수, 로딩 상태 등
 */
interface BulkChangeUIProps {
  newStatus: string;
  onStatusChange: (value: string) => void;
  onBulkChange: () => void;
  statusOptions: Array<{ label: string; value: string }>;
  selectedCount: number;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * 일괄 변경 UI 컴포넌트
 * - 선택된 항목들의 상태를 일괄적으로 변경하는 UI
 */
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

/**
 * 필터 그룹 스타일드 컴포넌트
 * - 드롭다운과 버튼을 가로로 배치하는 컨테이너
 */
const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
`;

/**
 * 선택 드롭다운 스타일드 컴포넌트
 * - 상태 선택을 위한 드롭다운 스타일링
 */
const Select = styled.select`
  height: 32px;
  padding: 0 8px;
  font-size: 12px;
  border: 1px solid #ccc;
`;

/**
 * 일괄 변경 버튼 스타일드 컴포넌트
 * - 일괄 변경 실행을 위한 버튼 스타일링
 */
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
