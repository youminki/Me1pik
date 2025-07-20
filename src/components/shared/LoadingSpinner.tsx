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
  size = 64,
}) => {
  return (
    <CenterWrapper
      className={className}
      role='status'
      aria-live='polite'
      aria-label={label || '로딩 중'}
    >
      <DonutSpinner size={size} color={color} />
      {label && <Label>{label}</Label>}
    </CenterWrapper>
  );
};

export default LoadingSpinner;

const spin = keyframes`
  100% { transform: rotate(360deg); }
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

const DonutSpinner = styled.div<{ size: number; color: string }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border: ${({ size }) => Math.max(4, size * 0.12)}px solid #eee;
  border-top: ${({ size }) => Math.max(4, size * 0.12)}px solid
    ${({ color }) => color};
  border-radius: 50%;
  animation: ${spin} 0.9s linear infinite;
  box-sizing: border-box;
`;

const Label = styled.div`
  font-size: 1.15rem;
  color: #222;
  margin-top: 10px;
  letter-spacing: 0.01em;
  font-weight: 500;
`;
