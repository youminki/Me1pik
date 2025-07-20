import React from 'react';
import styled, { keyframes } from 'styled-components';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color = '#f6ae24',
  text,
}) => {
  return (
    <SpinnerContainer>
      <SpinnerElement size={size} color={color} />
      {text && <SpinnerText>{text}</SpinnerText>}
    </SpinnerContainer>
  );
};

export default Spinner;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const SpinnerElement = styled.div<{ size: string; color: string }>`
  width: ${({ size }) => {
    switch (size) {
      case 'small':
        return '20px';
      case 'large':
        return '40px';
      default:
        return '30px';
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case 'small':
        return '20px';
      case 'large':
        return '40px';
      default:
        return '30px';
    }
  }};
  border: 2px solid #f0f0f0;
  border-top: 2px solid ${({ color }) => color};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const SpinnerText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  text-align: center;
`;
