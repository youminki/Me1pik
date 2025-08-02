/**
 * 보조 버튼 컴포넌트 (SecondaryButton.tsx)
 *
 * 애플리케이션에서 사용하는 보조 버튼 컴포넌트를 제공합니다.
 * 다양한 색상 옵션(노란색, 파란색, 빨간색, 검은색)을 지원하며,
 * 호버, 액티브, 포커스 상태와 애니메이션 효과를 포함합니다.
 *
 * @description
 * - 보조 버튼 시스템
 * - 색상 옵션 지원 (노란색, 파란색, 빨간색, 검은색)
 * - 호버/액티브/포커스 상태
 * - 애니메이션 효과
 * - 접근성 지원
 * - 테마 시스템 연동
 * - 반응형 디자인
 */

import React from 'react';
import styled, { keyframes, css } from 'styled-components';

/**
 * 보조 버튼 속성 인터페이스
 *
 * 보조 버튼 컴포넌트의 props를 정의합니다.
 *
 * @property children - 버튼 내용
 * @property onClick - 클릭 핸들러 (선택적)
 * @property color - 버튼 색상 (필수)
 */
interface Button02Props {
  children: React.ReactNode; // 버튼 내용
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // 클릭 핸들러 (선택적)
  color: 'yellow' | 'blue' | 'red' | 'black'; // 버튼 색상 (필수)
}

/**
 * 보조 버튼 컴포넌트
 *
 * 애플리케이션에서 사용하는 보조 버튼을 렌더링하는 컴포넌트입니다.
 * 다양한 색상 옵션을 지원하며, 호버, 액티브, 포커스 상태와 애니메이션을 포함합니다.
 *
 * @param children - 버튼 내용
 * @param onClick - 클릭 핸들러 (선택적)
 * @param color - 버튼 색상 (필수)
 * @returns 보조 버튼 컴포넌트
 */
const Button02: React.FC<Button02Props> = ({ children, onClick, color }) => {
  return (
    <StyledButton onClick={onClick} color={color}>
      {children}
    </StyledButton>
  );
};

export default Button02;

const pressAnimation = keyframes`
  from {
    transform: scale(0.95);
  }
  to {
    transform: scale(1);
  }
`;

const StyledButton = styled.button<{
  color: 'yellow' | 'blue' | 'red' | 'black';
}>`
  min-width: 69px;
  min-height: 34px;
  border-radius: 5px;
  border: none;
  color: #ffffff;
  font-weight: 800;
  font-size: 12px;
  line-height: 13px;
  text-align: center;
  margin-right: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  ${({ theme }) => theme.shadow.base};
  z-index: ${({ theme }) => theme.zIndex.header};

  ${({ color }) =>
    color === 'yellow'
      ? css`
          background-color: #f6ae24;
          &:hover {
            background-color: #e59c20;
          }
          &:active {
            background-color: #cc8c1c;
            animation: ${pressAnimation} 0.2s ease;
          }
        `
      : color === 'blue'
        ? css`
            background-color: #007bff;
            &:hover {
              background-color: #0069d9;
            }
            &:active {
              background-color: #005cbf;
              animation: ${pressAnimation} 0.2s ease;
            }
          `
        : color === 'red'
          ? css`
              background-color: #ff4d4d;
              &:hover {
                background-color: #ff3333;
              }
              &:active {
                background-color: #cc2929;
                animation: ${pressAnimation} 0.2s ease;
              }
            `
          : css`
              background-color: #333333;
              &:hover {
                background-color: #1a1a1a;
              }
              &:active {
                background-color: #000000;
                animation: ${pressAnimation} 0.2s ease;
              }
            `}

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  &:focus {
    outline: 2px solid #222;
    outline-offset: 2px;
  }
`;
