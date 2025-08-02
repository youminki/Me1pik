// src/components/Header/SettingsDetailSubHeader.tsx
import React from 'react';
import styled from 'styled-components';

export interface DetailSubHeaderProps {
  backLabel: string;
  onBackClick?: () => void;
  // 오른쪽 버튼 텍스트와 동작을 프롭스로 전달
  editLabel: string;
  onEditClick?: () => void;
  endLabel: string;
  onEndClick?: () => void;
}

const SettingsDetailSubHeader: React.FC<DetailSubHeaderProps> = ({
  backLabel,
  onBackClick,
  editLabel,
  onEditClick,
  endLabel,
  onEndClick,
}) => {
  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      window.history.back();
    }
  };

  const handleEdit = () => {
    if (onEditClick) onEditClick();
  };

  const handleEnd = () => {
    if (onEndClick) onEndClick();
  };

  return (
    <Container>
      <LeftButton onClick={handleBack}>
        <BulletIcon />
        {backLabel}
      </LeftButton>
      <RightButtons>
        <EditButton onClick={handleEdit}>{editLabel}</EditButton>
        <EndButton onClick={handleEnd}>{endLabel}</EndButton>
      </RightButtons>
    </Container>
  );
};

export default SettingsDetailSubHeader;

const Container = styled.div`
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
  line-height: 13px;
  text-align: center;
  border: 1px solid #dddddd;
  background-color: #ffffff;
  color: #000000;
  cursor: pointer;
  border-radius: 8px 0 0 8px;
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
  gap: 0px;
`;

const EditButton = styled.button`
  width: 100px;
  height: 40px;

  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  text-align: center;
  border: 1px solid #dddddd;
  background-color: #ffffff;
  color: #000000;
  cursor: pointer;
  border-radius: 8px 0 0 8px;
  &:hover {
    background-color: #dddddd;
  }
`;

const EndButton = styled.button`
  width: 100px;
  height: 40px;

  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  text-align: center;
  border: 1px solid #dddddd;
  background-color: #ffffff;
  color: #000000;
  cursor: pointer;
  border-radius: 0 8px 8px 0;
  &:hover {
    background-color: #dddddd;
  }
`;
