import React from 'react';
import styled from 'styled-components';

interface NoResultMessageProps {
  countdown: number;
}

const NoResultMessage: React.FC<NoResultMessageProps> = ({ countdown }) => {
  return (
    <Container>
      <MainMessage>조건에 맞는 상품이 없습니다.</MainMessage>
      <CountdownText>
        {countdown}초 후 전체 상품으로 이동합니다...
      </CountdownText>
    </Container>
  );
};

export default NoResultMessage;

const Container = styled.div`
  min-width: 220px;
  max-width: 90vw;
  margin: 0 auto;
  text-align: center;
  font-size: 18px;
  color: #888;
  font-weight: 600;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12px;
`;

const MainMessage = styled.div`
  font-size: 18px;
  color: #666;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const CountdownText = styled.div`
  font-size: 14px;
  color: #999;
  font-weight: 400;
  line-height: 1.3;
`;
