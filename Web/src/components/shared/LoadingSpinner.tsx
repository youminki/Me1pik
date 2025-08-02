/**
 * 로딩 스피너 컴포넌트 (LoadingSpinner.tsx)
 *
 * 사용자에게 로딩 상태를 표시하는 스피너 컴포넌트를 제공합니다.
 * 도넛 형태의 회전 애니메이션을 사용하며, 접근성을 고려한
 * ARIA 속성과 라벨을 지원합니다.
 *
 * @description
 * - 도넛 형태 회전 애니메이션
 * - 커스터마이징 가능한 색상 및 크기
 * - 접근성 지원 (ARIA 속성)
 * - 라벨 텍스트 표시
 * - 반응형 디자인
 * - 고정 위치 오버레이
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

/**
 * 로딩 스피너 속성 인터페이스
 *
 * 로딩 스피너 컴포넌트의 props를 정의합니다.
 *
 * @property color - 스피너 색상 (기본값: '#f7c600')
 * @property className - CSS 클래스명 (선택적)
 * @property label - 스피너 라벨 텍스트 (선택적)
 * @property size - 스피너 크기 (픽셀, 기본값: 64)
 */
interface LoadingSpinnerProps {
  color?: string; // 스피너 색상 (기본값: '#f7c600')
  className?: string; // CSS 클래스명 (선택적)
  label?: string; // 스피너 라벨 텍스트 (선택적)
  size?: number; // 스피너 크기 (픽셀, 기본값: 64)
}

/**
 * 로딩 스피너 컴포넌트
 *
 * 로딩 상태를 표시하는 스피너를 렌더링하는 컴포넌트입니다.
 * 접근성을 고려한 ARIA 속성을 포함하며, 커스터마이징 가능한
 * 색상, 크기, 라벨을 지원합니다.
 *
 * @param color - 스피너 색상 (기본값: '#f7c600')
 * @param className - CSS 클래스명 (선택적)
 * @param label - 스피너 라벨 텍스트 (선택적)
 * @param size - 스피너 크기 (픽셀, 기본값: 64)
 * @returns 로딩 스피너 컴포넌트
 */
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
