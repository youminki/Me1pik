// src/components/Header/TripleButtonDetailSubHeader.tsx
import React from 'react';
import styled from 'styled-components';

export interface TripleButtonDetailSubHeaderProps {
  backLabel: string;
  onBackClick?: () => void;
  saveLabel: string;
  onSaveClick?: () => void;
  deleteLabel: string;
  onDeleteClick?: () => void;
}

const TripleButtonDetailSubHeader: React.FC<TripleButtonDetailSubHeaderProps> = ({
  backLabel,
  onBackClick,
  saveLabel,
  onSaveClick,
  deleteLabel,
  onDeleteClick,
}) => {
  const handleBack = () => {
    if (onBackClick) onBackClick();
    else window.history.back();
  };

  return (
    <HeaderContainer>
      <LeftButton onClick={handleBack}>
        <BulletIcon />
        {backLabel}
      </LeftButton>
      <RightButtons>
        <ActionButton onClick={onSaveClick}>{saveLabel}</ActionButton>
        <ActionButton onClick={onDeleteClick}>{deleteLabel}</ActionButton>
      </RightButtons>
    </HeaderContainer>
  );
};

export default TripleButtonDetailSubHeader;

const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  min-width: 834px;
  min-height: 60px;
  background: #f9f9f9;
  border: 1px solid #dddddd;
  border-radius: 4px;
  padding: 0 10px;
  box-sizing: border-box;
`;

const LeftButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 110px;
  height: 40px;

  font-weight: 700;
  font-size: 12px;
  border: 1px solid #dddddd;
  background-color: #ffffff;
  color: #000000;
  cursor: pointer;
  border-radius: 8px;

  &:hover {
    background-color: #eeeeee;
  }
`;

const BulletIcon = styled.div`
  width: 7px;
  height: 7px;
  margin-right: 5px;
  border-left: 3px solid #f6ae24;
  border-bottom: 3px solid #f6ae24;
  transform: rotate(45deg);
`;

const RightButtons = styled.div`
  display: flex;
  margin-left: auto;
`;

const ActionButton = styled.button`
  width: 100px;
  height: 40px;

  font-weight: 700;
  font-size: 12px;
  border: 1px solid #dddddd;
  background-color: #ffffff;
  color: #000000;
  cursor: pointer;
  border-left: none;

  &:hover {
    background-color: #dddddd;
  }

  /* 첫 번째 버튼(변경저장)의 왼쪽 모서리 둥글게 */
  &:first-child {
    border-left: 1px solid #dddddd;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  /* 마지막 버튼(삭제)의 오른쪽 모서리 둥글게 */
  &:last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;
