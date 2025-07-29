import React from 'react';
import styled from 'styled-components';

interface Button01Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button01: React.FC<Button01Props> = ({ children, ...props }) => (
  <StyledButton {...props}>{children}</StyledButton>
);

export default Button01;

const StyledButton = styled.button`
  width: 100%;
  height: 56px;
  padding: 15px;
  font-size: 16px;
  font-weight: 800;
  line-height: 17.68px;
  text-align: center;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;

  color: #ffffff;
  background-color: #f6ae24;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;

  &:hover {
    background-color: #e59c20;
    transform: translateY(-2px);
  }

  &:active {
    background-color: #cc8c1c;
    transform: translateY(0);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;
