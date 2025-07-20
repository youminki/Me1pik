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
  color = '#1976d2',
  className,
  label,
}) => {
  return (
    <Wrapper
      className={className}
      role='status'
      aria-live='polite'
      aria-label={label || '로딩 중'}
    >
      <Spinner size={size} color={color} />
      {label && <Label>{label}</Label>}
    </Wrapper>
  );
};

export default LoadingSpinner;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const Spinner = styled.div<{ size: number; color: string }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid ${({ color }) => color};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 8px;
`;

const Label = styled.div`
  font-size: 1rem;
  color: #666;
  margin-top: 4px;
`;
