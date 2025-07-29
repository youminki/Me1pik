// src/components/BulkChangeComponent.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getAllMemberships, changeUserMembership, GetAllMembershipsResponse } from '@api/adminUser';

interface BulkChangeComponentProps {
  selectedRows: Set<number>;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const BulkChangeComponent: React.FC<BulkChangeComponentProps> = ({
  selectedRows,
  onSuccess,
  onError,
}) => {
  const [memberships, setMemberships] = useState<GetAllMembershipsResponse>([]);
  const [newMembershipId, setNewMembershipId] = useState<number | ''>('');
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  useEffect(() => {
    getAllMemberships()
      .then((data) => setMemberships(data))
      .catch((err) => console.error('멤버십 목록 조회 실패:', err));
  }, []);

  const handleBulkChange = () => {
    if (newMembershipId === '') {
      alert('변경할 멤버십을 선택해주세요.');
      return;
    }
    if (selectedRows.size === 0) {
      alert('변경할 사용자를 선택해주세요.');
      return;
    }

    const target = memberships.find((m) => m.id === newMembershipId);
    if (!target) return;

    if (
      !window.confirm(`선택된 ${selectedRows.size}명 멤버십을 "${target.name}"로 변경하시겠습니까?`)
    )
      return;

    setIsBulkLoading(true);
    Promise.all(
      Array.from(selectedRows).map((userId) => changeUserMembership(userId, newMembershipId)),
    )
      .then(() => {
        alert('멤버십이 성공적으로 변경되었습니다.');
        onSuccess?.();
      })
      .catch((err) => {
        console.error('멤버십 일괄 변경 실패:', err);
        alert('일부 또는 전체 변경에 실패했습니다.');
        onError?.(err);
      })
      .finally(() => setIsBulkLoading(false));
  };

  return (
    <FilterGroup>
      <Select
        value={newMembershipId}
        onChange={(e) => setNewMembershipId(e.target.value === '' ? '' : Number(e.target.value))}
      >
        <option value="">변경할 멤버십 선택</option>
        {memberships.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </Select>
      <BulkButton
        onClick={handleBulkChange}
        disabled={newMembershipId === '' || selectedRows.size === 0 || isBulkLoading}
      >
        {isBulkLoading ? '변경중...' : '일괄변경'}
      </BulkButton>
    </FilterGroup>
  );
};

export default BulkChangeComponent;

// Styled Components
const FilterGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #f6ae24;
  border-radius: 5px;
  font-size: 14px;
  background-color: #f9f9f9;
  color: #333;
`;

const BulkButton = styled.button`
  padding: 8px 12px;
  background-color: #f6ae24;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #e09a1f;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    color: #888;
  }
`;
