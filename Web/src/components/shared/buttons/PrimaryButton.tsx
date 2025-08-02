/**
 * 기본 버튼 컴포넌트 (PrimaryButton.tsx)
 *
 * 애플리케이션에서 사용하는 기본 버튼 컴포넌트를 제공합니다.
 * 다양한 색상 변형(흰색, 회색, 기본)을 지원하며,
 * 호버, 액티브, 포커스 상태를 포함한 완전한 버튼 시스템을 제공합니다.
 *
 * @description
 * - 기본 버튼 시스템
 * - 색상 변형 지원 (흰색, 회색, 기본)
 * - 호버/액티브/포커스 상태
 * - 접근성 지원
 * - 테마 시스템 연동
 * - 반응형 디자인
 * - 애니메이션 효과
 */
import React from 'react';
import styled from 'styled-components';

import { theme } from '@/styles/Theme';

/**
 * 기본 버튼 속성 인터페이스
 *
 * 기본 버튼 컴포넌트의 props를 정의합니다.
 * HTML button 속성을 상속받으며, 색상 변형 옵션을 제공합니다.
 *
 * @property children - 버튼 내용
 * @property white - 흰색 텍스트/배경 사용 여부 (선택적)
 * @property gray - 회색 텍스트/배경 사용 여부 (선택적)
 */
interface Button01Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode; // 버튼 내용
  /** 흰색 텍스트/배경 사용 */
  white?: boolean; // 흰색 텍스트/배경 사용 여부 (선택적)
  /** 회색 텍스트/배경 사용 */
  gray?: boolean; // 회색 텍스트/배경 사용 여부 (선택적)
}

/**
 * 기본 버튼 컴포넌트
 *
 * 애플리케이션에서 사용하는 기본 버튼을 렌더링하는 컴포넌트입니다.
 * 다양한 색상 변형을 지원하며, 호버, 액티브, 포커스 상태를 포함합니다.
 *
 * @param children - 버튼 내용
 * @param white - 흰색 텍스트/배경 사용 여부 (선택적)
 * @param gray - 회색 텍스트/배경 사용 여부 (선택적)
 * @param props - 기타 HTML button 속성들
 * @returns 기본 버튼 컴포넌트
 */
const Button01: React.FC<Button01Props> = ({
  children,
  white,
  gray,
  ...props
}) => (
  <StyledButton $white={white} $gray={gray} {...props}>
    {children}
  </StyledButton>
);

export default Button01;

const StyledButton = styled.button<{
  $white?: boolean;
  $gray?: boolean;
}>`
  width: 100%;
  height: 56px;
  padding: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};

  font-size: ${theme.colors.label};
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;

  /* 색상: white > gray > 기본 */
  color: ${({ $white, $gray }) =>
    $white
      ? theme.colors.primary
      : $gray
        ? theme.colors.gray2
        : theme.colors.primary};
  background-color: ${({ $white, $gray }) =>
    $white
      ? theme.colors.white
      : $gray
        ? theme.colors.gray1
        : theme.colors.yellow};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  ${theme.shadow.base};
  z-index: ${theme.zIndex.header};

  &:hover {
    background-color: ${({ $white, $gray }) =>
      $white
        ? theme.colors.gray4
        : $gray
          ? theme.colors.gray3
          : theme.colors.yellow1};
    transform: translateY(-2px);
  }

  &:active {
    background-color: ${({ $white, $gray }) =>
      $white
        ? theme.colors.gray2
        : $gray
          ? theme.colors.gray1
          : theme.colors.yellow0};
    transform: translateY(0);
  }

  &:disabled {
    background-color: ${theme.colors.gray4};
    color: ${theme.colors.gray2};
    cursor: not-allowed;
    transform: none;
  }

  &:focus {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`;
