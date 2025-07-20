import React from 'react';
import styled, { css, keyframes } from 'styled-components';

interface Button02Props {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  color: 'yellow' | 'blue' | 'red' | 'black';
}

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
  margin-right: 11px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;

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
