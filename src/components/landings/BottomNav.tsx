import React from 'react';
import styled from 'styled-components';

const BottomNav: React.FC = () => {
  return (
    <Container>
      <TopText>
        현재 N명의 인플루언서들이
        <br /> melpik을 신청했어요!
      </TopText>

      <StartButton>melpik 시작하기</StartButton>

      <BottomText>사전예약 마감까지 N일 00:00시간 남았어요!</BottomText>
    </Container>
  );
};

export default BottomNav;

const Container = styled.div`
  width: 440px;
  height: 250px;
  background: #f5ab35;
  border-radius: 20px 20px 0px 0px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const TopText = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 17px;
  line-height: 23px;
  text-align: center;
  color: #ffffff;
  opacity: 0.9;

  margin-bottom: 12px;
`;

const StartButton = styled.button`
  width: 250px;
  height: 40px;
  background: #ffffff;
  border-radius: 100px;
  border: none;
  cursor: pointer;

  font-style: normal;
  font-weight: 800;
  font-size: 15px;
  line-height: 17px;
  text-align: center;
  color: #000000;

  margin: 0 auto 12px auto;
`;

const BottomText = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 17px;
  line-height: 25px;
  text-align: center;
  color: #ffffff;
  opacity: 0.9;
`;
