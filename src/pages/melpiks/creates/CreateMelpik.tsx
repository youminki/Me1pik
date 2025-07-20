import React from 'react';
import styled from 'styled-components';

import ContentList from '../../../components/melpiks/create-melpiks/ContentList';
import StatsSection from '../../../components/stats-section';

const visitLabel = '인스타 계정';
const salesLabel = '현재 등록수  ';
const visits = '@styleweex';
const sales = '2';
const dateRange = 'Now';

const CreateMelpik: React.FC = () => {
  return (
    <CreateMelpikContainer>
      <Header>
        <Title>멜픽 생성</Title>
        <Subtitle>내 채널을 통해 나는 브랜드가 된다</Subtitle>
      </Header>

      <StatsSection
        visits={visits}
        sales={sales}
        dateRange={dateRange}
        visitLabel={visitLabel}
        salesLabel={salesLabel}
      />
      <Divider />
      <ContentWrapper>
        <ContentList />
      </ContentWrapper>
    </CreateMelpikContainer>
  );
};

export default CreateMelpik;

const CreateMelpikContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: #fff;
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 6px;
`;

const Title = styled.h1`
  font-weight: 800;
  font-size: 24px;
  line-height: 27px;

  color: #000000;
  margin-bottom: 0px;
`;

const Subtitle = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: #ccc;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: hidden;
  position: relative;
  margin-top: 30px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
  margin-top: 30px;
`;
