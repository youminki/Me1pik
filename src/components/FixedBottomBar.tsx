// src/components/FixedBottomBar.tsx
import React from 'react';
import styled from 'styled-components';

interface FixedBottomBarProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  color?: 'yellow' | 'black';
}

const FixedBottomBar: React.FC<FixedBottomBarProps> = ({
  text,
  color = 'black',
  ...buttonProps
}) => {
  return (
    <BottomBar>
      <SettleButton $color={color} {...buttonProps}>
        {text}
      </SettleButton>
    </BottomBar>
  );
};

export default FixedBottomBar;

const BottomBar = styled.div`
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  max-width: 600px;
  margin: 0 auto;
  background: #eeeeee;
  padding: 15px 0 34px 0;
  text-align: center;
`;

// transient prop "$color" 사용
const SettleButton = styled.button<{ $color: 'yellow' | 'black' }>`
  width: 90%;
  padding: 20px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;

  background-color: ${({ $color }) =>
    $color === 'yellow' ? '#F6AE24' : '#000000'};
  color: #ffffff;
  border: none;
  font-weight: 800;
  line-height: 18px;
  text-align: center;
`;
