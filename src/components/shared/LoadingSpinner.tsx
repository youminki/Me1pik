import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = '#f7c600',
  className,
  label,
}) => {
  return (
    <CenterWrapper
      className={className}
      role='status'
      aria-live='polite'
      aria-label={label || '로딩 중'}
    >
      <Spinner size={size} color={color} />
      {label && <Label>{label}</Label>}
    </CenterWrapper>
  );
};

export default LoadingSpinner;

const spin = keyframes`
  0% { transform: rotate(0deg); }
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

const Spinner = styled.div<{ size: number; color: string }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border: ${({ size }) => Math.max(2, Math.floor(size * 0.12))}px solid
    rgba(0, 0, 0, 0.07);
  border-top: ${({ size }) => Math.max(2, Math.floor(size * 0.12))}px solid
    ${({ color }) => color};
  border-radius: 50%;
  animation: ${spin} 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  background: transparent;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
`;

const Label = styled.div`
  font-size: 1.05rem;
  color: #222;
  margin-top: 6px;
  letter-spacing: 0.01em;
  font-weight: 500;
`;
