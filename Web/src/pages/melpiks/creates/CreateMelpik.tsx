import React from 'react';
import styled from 'styled-components';

import ContentList from '@/components/melpiks/create-melpiks/ContentList';
import PageHeader from '@/components/shared/headers/PageHeader';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import StatsSection from '@/components/stats-section';

const visitLabel = '인스타 계정';
const salesLabel = '현재 등록수  ';
const visits = '@styleweex';
const sales = '2';
const dateRange = 'Now';

const CreateMelpik: React.FC = () => {
  return (
    <>
      <UnifiedHeader variant='oneDepth' />
      <CreateMelpikContainer>
        <PageHeader 
          title="멜픽 생성" 
          subtitle="내 채널을 통해 나는 브랜드가 된다" 
        />

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
    </>
  );
};

export default CreateMelpik;

const CreateMelpikContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: #fff;
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
