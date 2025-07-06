// src/components/Button01.tsx
import React from 'react';
import styled from 'styled-components';

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
  padding: 15px;
  margin-top: 20px;

  font-size: 16px;
  font-weight: 800;
  line-height: 17.68px;
  text-align: center;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;

  /* 색상: white > gray > 기본 */
  color: ${({ $white, $gray }) =>
    $white ? '#ffffff' : $gray ? '#666666' : '#ffffff'};
  background-color: ${({ $white, $gray }) =>
    $white ? '#ffffff' : $gray ? '#cccccc' : '#f6ae24'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;

  &:hover {
    background-color: ${({ $white, $gray }) =>
      $white ? '#f0f0f0' : $gray ? '#dddddd' : '#ffc947'};
    transform: translateY(-2px);
  }

  &:active {
    background-color: ${({ $white, $gray }) =>
      $white ? '#e0e0e0' : $gray ? '#bbbbbb' : '#d99a1e'};
    transform: translateY(0);
  }

  &:disabled {
    background-color: #eeeeee;
    color: #aaaaaa;
    cursor: not-allowed;
    transform: none;
  }
`;
