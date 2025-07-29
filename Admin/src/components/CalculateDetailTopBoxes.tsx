// src/components/PageDetailTopBoxes.tsx

import React from 'react';
import styled from 'styled-components';
import avatar from 'src/assets/userDetailImg1.svg';

const PageDetailTopBoxes: React.FC = () => {
  return (
    <Container>
      <InfoSection>
        <AvatarWrapper>
          <Avatar src={avatar} alt="User Avatar" />
        </AvatarWrapper>

        <TextGroup>
          <Row>
            <BoldText>홍길동</BoldText>
            <NormalText>(mivin)</NormalText>
          </Row>
          <Row>
            <NormalText>goodxx21@naver.com</NormalText>
          </Row>
          <Row>
            <BoldText>일반</BoldText>
            <NormalText>(등급)</NormalText>
          </Row>
        </TextGroup>
      </InfoSection>

      <VerticalDivider />

      <StatsSection>
        <StatItem>
          <BoldText>시즌 진행현황</BoldText>
          <NormalText>2025 / 봄 (4월)</NormalText>
        </StatItem>
        <StatItem>
          <BoldText>누적 판매수</BoldText>
          <NormalText>148</NormalText>
        </StatItem>
        <StatItem>
          <BoldText>누적 판매액</BoldText>
          <NormalText>7,420,000원</NormalText>
        </StatItem>
      </StatsSection>
    </Container>
  );
};

export default PageDetailTopBoxes;

/* ===== Styled Components ===== */

const Container = styled.div`
  display: flex;
  align-items: center;
  width: 1200px;
  height: 120px;
  padding: 0 16px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
`;

const InfoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 250px;
`;

const AvatarWrapper = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const BoldText = styled.div`
  font-weight: 800;
  font-size: 12px;
  line-height: 13px;
  color: #000;
`;

const NormalText = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 13px;
  color: #000;
`;

const VerticalDivider = styled.div`
  width: 1px;
  height: 56px;
  background: #d9d9d9;
  margin: 0 24px;
`;

const StatsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;
