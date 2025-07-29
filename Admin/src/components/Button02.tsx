import React from 'react';
import styled, { css } from 'styled-components';

interface Button02Props {
  children: React.ReactNode;
  onClick?: () => void;
  color: 'yellow' | 'black';
  disabled?: boolean;
}

const Button02: React.FC<Button02Props> = ({ children, onClick, color, disabled = false }) => {
  return (
    <StyledButton onClick={onClick} color={color} disabled={disabled}>
      {children}
    </StyledButton>
  );
};

export default Button02;

const StyledButton = styled.button<{ color: 'yellow' | 'black' }>`
  min-width: 69px;
  min-height: 34px;
  border-radius: 5px;
  border: none;
  color: #ffffff;

  font-weight: 800;
  font-size: 12px;
  line-height: 13px;
  text-align: center;
  margin-right: 11px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  ${({ color }) =>
    color === 'yellow'
      ? css`
          background-color: #f6ae24;
          &:hover:not(:disabled) {
            background-color: #e59c20;
          }
          &:active:not(:disabled) {
            background-color: #cc8c1c;
          }
        `
      : css`
          background-color: #333333;
          &:hover:not(:disabled) {
            background-color: #1a1a1a;
          }
          &:active:not(:disabled) {
            background-color: #000000;
          }
        `}

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;
