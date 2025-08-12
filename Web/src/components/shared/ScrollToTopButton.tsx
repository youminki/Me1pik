import React from 'react';
import styled from 'styled-components';

import ArrowIconSvg from '@/assets/ArrowIcon.svg';

interface ScrollToTopButtonProps {
  onClick: () => void;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick}>
      <ArrowIconImg src={ArrowIconSvg} alt='위로 이동' />
    </Button>
  );
};

export default ScrollToTopButton;

const Button = styled.button`
  position: fixed;
  bottom: 100px;
  right: 14px;
  width: 48px;
  height: 48px;
  border: none;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: #555555;
  border-radius: 6px;
  transition:
    transform 0.3s,
    box-shadow 0.3s,
    opacity 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  &:hover {
    transform: scale(1.1);
    background: #666666;
  }

  &:active {
    transform: scale(0.95);
  }

  /* Desktop: Bottom Dock와 가로(row)로 같은 위치 정렬 */
  @media (min-width: 768px) {
    bottom: 5%;
    right: auto;
    left: calc(50% + 240px); /* Dock 최대 너비 400px 기준, 우측으로 40px 간격 */
    transform: translateX(0);
  }
`;

const ArrowIconImg = styled.img`
  width: 24px;
  height: 24px;
  display: block;
`;
