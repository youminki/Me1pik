import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingSpinnerProps {
  color?: string;
  className?: string;
  label?: string;
  size?: number;
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  color = '#f7c600',
  className,
  label,
  size = 64,
  variant = 'spinner',
}) => {
  return (
    <CenterWrapper
      className={className}
      role='status'
      aria-live='polite'
      aria-label={label || '로딩 중'}
    >
      {variant === 'spinner' && <DonutSpinner size={size} color={color} />}
      {variant === 'dots' && (
        <DotsSpinner color={color}>
          <Dot color={color} delay={0} />
          <Dot color={color} delay={0.16} />
          <Dot color={color} delay={0.32} />
        </DotsSpinner>
      )}
      {variant === 'pulse' && <PulseSpinner size={size} color={color} />}
      {variant === 'wave' && (
        <WaveSpinner color={color}>
          <WaveBar color={color} delay={0} />
          <WaveBar color={color} delay={0.1} />
          <WaveBar color={color} delay={0.2} />
          <WaveBar color={color} delay={0.3} />
          <WaveBar color={color} delay={0.4} />
        </WaveSpinner>
      )}
      {label && <Label>{label}</Label>}
    </CenterWrapper>
  );
};

export default LoadingSpinner;

// 🔧 추가: 간단한 인라인 로딩 스피너
export const InlineSpinner: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = '#f7c600',
}) => (
  <InlineSpinnerWrapper size={size}>
    <div
      style={{
        width: size,
        height: size,
        border: `${Math.max(2, size * 0.15)}px solid rgba(0,0,0,0.1)`,
        borderTop: `${Math.max(2, size * 0.15)}px solid ${color}`,
        borderRadius: '50%',
        animation: `${spin} 0.8s linear infinite`,
      }}
    />
  </InlineSpinnerWrapper>
);

// 🔧 추가: 스켈레톤 로딩 컴포넌트
export const SkeletonLoader: React.FC<{
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}> = ({ width = '100%', height = '20px', borderRadius = '4px', className }) => (
  <SkeletonWrapper
    width={width}
    height={height}
    borderRadius={borderRadius}
    className={className}
  />
);

// 🔧 추가: 텍스트 스켈레톤 (여러 줄)
export const TextSkeleton: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className }) => (
  <TextSkeletonWrapper className={className}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonLoader
        key={index}
        width={index === lines - 1 ? '60%' : '100%'}
        height='16px'
        borderRadius='4px'
      />
    ))}
  </TextSkeletonWrapper>
);

// 애니메이션 키프레임들
const spin = keyframes`
  100% { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 80%, 100% { 
    transform: scale(0);
    opacity: 0.5;
  }
  40% { 
    transform: scale(1);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% { 
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% { 
    transform: scale(1.2);
    opacity: 1;
  }
`;

const wave = keyframes`
  0%, 60%, 100% { 
    transform: translateY(0);
  }
  30% { 
    transform: translateY(-20px);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 🔧 추가: 스켈레톤 셰이머 애니메이션
const skeletonShimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  z-index: 9999;
  animation: ${fadeIn} 0.3s ease-out;
`;

const DonutSpinner = styled.div<{ size: number; color: string }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border: ${({ size }) => Math.max(4, size * 0.12)}px solid rgba(0, 0, 0, 0.1);
  border-top: ${({ size }) => Math.max(4, size * 0.12)}px solid
    ${({ color }) => color};
  border-radius: 50%;
  animation: ${spin} 0.9s linear infinite;
  box-sizing: border-box;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const DotsSpinner = styled.div<{ color: string }>`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
`;

const Dot = styled.div<{ color: string; delay: number }>`
  width: 12px;
  height: 12px;
  background-color: ${({ color }) => color};
  border-radius: 50%;
  animation: ${bounce} 1.4s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay}s;
`;

const PulseSpinner = styled.div<{ size: number; color: string }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background-color: ${({ color }) => color};
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
  box-shadow: 0 0 20px ${({ color }) => color}40;
`;

const WaveSpinner = styled.div<{ color: string }>`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
`;

const WaveBar = styled.div<{ color: string; delay: number }>`
  width: 4px;
  height: 20px;
  background-color: ${({ color }) => color};
  border-radius: 2px;
  animation: ${wave} 1.2s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay}s;
`;

const Label = styled.div`
  font-size: 1.1rem;
  color: #333;
  margin-top: 16px;
  letter-spacing: 0.02em;
  font-weight: 500;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out 0.2s both;
  max-width: 300px;
  line-height: 1.4;
`;

// 🔧 추가: 인라인 스피너 래퍼
const InlineSpinnerWrapper = styled.div<{ size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
`;

// 🔧 추가: 스켈레톤 래퍼
const SkeletonWrapper = styled.div<{
  width: string | number;
  height: string | number;
  borderRadius: string;
}>`
  width: ${({ width }) => (typeof width === 'number' ? `${width}px` : width)};
  height: ${({ height }) =>
    typeof height === 'number' ? `${height}px` : height};
  border-radius: ${({ borderRadius }) => borderRadius};
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${skeletonShimmer} 1.5s ease-in-out infinite;
`;

// 🔧 추가: 텍스트 스켈레톤 래퍼
const TextSkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;
