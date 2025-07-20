// src/components/melpiks/Schedule/Reservation1/BottomBar.tsx

import React from 'react';
import styled from 'styled-components';

interface BottomBarProps {
  onNext: () => void;
  buttonText?: string;
  disabled?: boolean;
}

const BottomBar: React.FC<BottomBarProps> = ({
  onNext,
  buttonText = '다음',
  disabled = false,
}) => {
  return (
    <BottomBarContainer>
      <ActionButton onClick={onNext} disabled={disabled}>
        {buttonText}
      </ActionButton>
    </BottomBarContainer>
  );
};

export default BottomBar;

const BottomBarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 10px 34px;
  background-color: #eeeeee;
  z-index: 9999;
`;

const ActionButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  height: 56px;
  background-color: ${({ disabled }) => (disabled ? '#bdbdbd' : 'black')};
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  margin: 0 21px;
`;
