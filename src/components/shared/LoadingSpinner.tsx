import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingSpinnerProps {
  color?: string;
  className?: string;
  label?: string;
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  color = '#f7c600',
  className,
  label,
  size = 40,
}) => {
  return (
    <CenterWrapper
      className={className}
      role='status'
      aria-live='polite'
      aria-label={label || '로딩 중'}
    >
      <BounceSpinner>
        <Dot delay='0s' color={color} size={size * 0.3} />
        <Dot delay='0.15s' color={color} size={size * 0.3} />
        <Dot delay='0.3s' color={color} size={size * 0.3} />
      </BounceSpinner>
      {label && <Label>{label}</Label>}
    </CenterWrapper>
  );
};

export default LoadingSpinner;

const bounce = keyframes`
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-12px); }
  100% { transform: translateY(0); }
`;

const CenterWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  z-index: 9999;
`;

const BounceSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin: 10px 0 10px 0;
`;

const Dot = styled.div<{ delay: string; color: string; size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background-color: ${({ color }) => color};
  border-radius: 50%;
  margin: 0 6px;
  animation: ${bounce} 0.6s ${({ delay }) => delay} infinite ease-in-out;
`;

const Label = styled.div`
  font-size: 1.05rem;
  color: #222;
  margin-top: 6px;
  letter-spacing: 0.01em;
  font-weight: 500;
`;
