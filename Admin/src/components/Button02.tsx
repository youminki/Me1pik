import React from 'react';
import styled, { css } from 'styled-components';

interface Button02Props {
  children: React.ReactNode;
  onClick?: () => void;
  color: 'yellow' | 'black';
}

const Button02: React.FC<Button02Props> = ({ children, onClick, color }) => {
  return (
    <StyledButton onClick={onClick} color={color}>
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
          &:hover {
            background-color: #e59c20;
          }
          &:active {
            background-color: #cc8c1c;
          }
        `
      : css`
          background-color: #333333;
          &:hover {
            background-color: #1a1a1a;
          }
          &:active {
            background-color: #000000;
          }
        `}

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;
