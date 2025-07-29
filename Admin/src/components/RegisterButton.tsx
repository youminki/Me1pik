// src/components/RegisterButton.tsx
import React from 'react';
import styled, { keyframes } from 'styled-components';

interface RegisterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼에 표시할 텍스트 */
  text: string;
}

// 마우스 오버 시 떠오르는 애니메이션
const hoverAnim = keyframes`
  0% { transform: translateY(0); box-shadow: none; }
  100% { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
`;

const Button = styled.button`
  padding: 10px 20px;
  min-width: 100px;
  background-color: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease;

  /* 텍스트가 항상 한 줄로 나오도록 */
  white-space: nowrap;

  &:hover {
    background-color: #ffae00;
    animation: ${hoverAnim} 0.2s forwards;
  }
  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

const RegisterButton: React.FC<RegisterButtonProps> = ({ text, ...props }) => (
  <Button {...props}>{text}</Button>
);

export default RegisterButton;
