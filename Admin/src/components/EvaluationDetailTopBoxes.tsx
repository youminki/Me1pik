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
    </Container>
  );
};

export default PageDetailTopBoxes;

/* ===== Styled Components ===== */

const Container = styled.div`
  display: flex;
  align-items: center;

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
  /* 통째로 중앙 정렬하고 싶다면 아래 주석 해제 */
  /* justify-content: center; */
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
