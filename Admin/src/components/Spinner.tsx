import React from 'react';
import styled, { keyframes } from 'styled-components';

const bounce = keyframes`
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-12px); }
  100% { transform: translateY(0); }
`;

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin: 100px 0;
`;

const Dot = styled.div<{ delay: string }>`
  width: 12px;
  height: 12px;
  background-color: #f6ae24;
  border-radius: 50%;
  margin: 0 6px;
  animation: ${bounce} 0.6s ${({ delay }) => delay} infinite ease-in-out;
`;

const Spinner: React.FC = () => (
  <SpinnerWrapper>
    <Dot delay="0s" />
    <Dot delay="0.15s" />
    <Dot delay="0.3s" />
  </SpinnerWrapper>
);

export default Spinner;
