// src/components/Button01.tsx
import React from 'react';
import styled from 'styled-components';

import { theme } from '@/styles/theme';

interface Button01Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /** 흰색 텍스트/배경 사용 */
  white?: boolean;
  /** 회색 텍스트/배경 사용 */
  gray?: boolean;
}

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
